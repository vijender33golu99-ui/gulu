const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// Safely get API keys
const GEMINI_KEYS = (process.env.GEMINI_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k && k.startsWith('AIza'));

const GROQ_KEYS = (process.env.GROQ_API_KEYS || '')
  .split(',')
  .map(k => k.trim())
  .filter(k => k && k.startsWith('gsk_'));

let geminiKeyIdx = 0;
let groqKeyIdx = 0;

console.log(`✅ Server start ho raha hai...`);
console.log(`🔑 Gemini keys loaded: ${GEMINI_KEYS.length}`);
console.log(`🔑 Groq keys loaded:   ${GROQ_KEYS.length}`);

// Delay function for Rate Limit Handling
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to call Gemini API with retry logic and model fallback
async function callGemini(question, imageBase64, systemPrompt, langName) {
  if (GEMINI_KEYS.length === 0) return { success: false, error: 'No Gemini keys' };

  // FIX 1: gemini-2.0-flash pehle — iska free tier RPM sabse zyada hai (15 RPM)
  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];
  let lastError = null;

  for (const model of modelsToTry) {
    let allKeysRateLimited = true;

    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const gKey = GEMINI_KEYS[(geminiKeyIdx + i) % GEMINI_KEYS.length];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gKey}`;

      const parts = [];
      if (imageBase64) {
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
      }

      const userMsg = (question || 'Please answer in detail.') + `\n\nAnswer in ${langName}.`;
      parts.push({ text: userMsg });

      try {
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: 0.4 }
          }),
          timeout: 60000
        });

        // FIX 2: 429 pe 2 second sleep — bina sleep ke sab keys ek saath fail ho jaati hain
        if (resp.status === 429) {
          const errBody = await resp.text();
          console.warn(`⚠️ Rate limit: ${model}, key ${i + 1}/${GEMINI_KEYS.length}. 2s ruk ke next key...`);
          lastError = `Rate Limit 429 on ${model} - ${errBody.substring(0, 100)}`;
          await sleep(2000);
          continue;
        }

        if (resp.ok) {
          const gData = await resp.json();
          let rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawText.length > 5) {
            geminiKeyIdx = (geminiKeyIdx + i) % GEMINI_KEYS.length;
            console.log(`✅ Gemini success: ${model}`);
            return { success: true, text: rawText };
          }
          lastError = `Empty response from ${model}`;
          allKeysRateLimited = false;
        } else {
          const errBody = await resp.text();
          lastError = `Error ${resp.status} on ${model} - ${errBody}`;
          console.error(`Gemini Error on ${model} (key ${i+1}):`, resp.status);
          allKeysRateLimited = false;
          if (resp.status === 404) break; // Model not found — skip to next model
        }
      } catch (e) {
        lastError = e.message;
        allKeysRateLimited = false;
        console.error('❌ Gemini Network error:', e.message);
      }
    }

    // Agar is model ki saari keys rate limited hain to 3s wait karo next model se pehle
    if (allKeysRateLimited) {
      console.warn(`⏳ ${model} ki saari keys rate limited. 3s baad agla model try karte hain...`);
      await sleep(3000);
    }
  }

  // Sab fail — available models list fetch karo diagnosis ke liye
  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEYS[0]}`);
    if (listResp.ok) {
      const listData = await listResp.json();
      const modelNames = listData.models
        .map(m => m.name.replace('models/', ''))
        .filter(n => n.includes('gemini'))
        .join(', ');
      return { success: false, error: `Available models: ${modelNames}. Last error: ${lastError}` };
    }
  } catch (e) {}

  return { success: false, error: lastError };
}

app.post('/api/ask', async (req, res) => {
  const { question, imageBase64, systemPrompt, selectedLangName } = req.body;

  if (!question && !imageBase64) {
    return res.status(400).json({ error: 'Sawaal ya image chahiye!' });
  }

  const strictSystemPrompt = (systemPrompt || '') + "\n\nCRITICAL INSTRUCTION: You are 'Didi AI', a friendly teacher. Answer the student's question in a single, complete, and easy-to-understand response. Use simple step-by-step Hindi/Hinglish. If it is a Math question, solve it clearly.";

  // 1. Try Gemini First (Best for Image + Text)
  console.log('🚀 Calling Gemini API...');
  const geminiResult = await callGemini(question, imageBase64, strictSystemPrompt, selectedLangName || 'Hindi');

  if (geminiResult.success) {
    console.log('✅ Gemini API success');
    return res.json({ success: true, rawText: geminiResult.text });
  }

  // FIX 3: Groq fallback — image ho ya na ho, agar text question hai toh Groq try karo
  console.log(`⚠️ Gemini failed: ${geminiResult.error}. Trying Groq...`);
  if (question && GROQ_KEYS.length > 0) {
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      const keyToUse = GROQ_KEYS[(groqKeyIdx + i) % GROQ_KEYS.length];
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keyToUse },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: strictSystemPrompt },
              { role: 'user', content: question + `\n\nAnswer in ${selectedLangName || 'Hindi'}.` }
            ]
          }),
          timeout: 60000
        });

        if (resp.status === 429) {
          const errBody = await resp.text();
          console.warn(`⚠️ Groq rate limit key ${i + 1}. 5s ruk ke next key...`);
          await sleep(5000);
          continue;
        }

        if (resp.ok) {
          const data = await resp.json();
          const rawText = data?.choices?.[0]?.message?.content || '';
          if (rawText.length > 5) {
            groqKeyIdx = (groqKeyIdx + i) % GROQ_KEYS.length;
            console.log('✅ Groq API success');
            return res.json({ success: true, rawText });
          }
        } else {
          const errBody = await resp.text();
          console.error(`Groq Error (key ${i+1}):`, resp.status, errBody.substring(0, 100));
        }
      } catch (e) {
        console.error(`❌ Groq Network error (key ${i+1}):`, e.message);
      }
    }
  }

  return res.status(503).json({ error: true, message: `All APIs failed. Last error: ${geminiResult.error}` });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', gemini_keys: GEMINI_KEYS.length, groq_keys: GROQ_KEYS.length });
});

// Diagnostic: fetch which models are available for this key
app.get('/api/models', async (req, res) => {
  if (GEMINI_KEYS.length === 0) return res.json({ error: 'No Gemini keys loaded' });
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEYS[0]}&pageSize=50`);
    const data = await resp.json();
    if (data.models) {
      const geminiModels = data.models
        .filter(m => m.name.includes('gemini'))
        .map(m => ({
          name: m.name.replace('models/', ''),
          methods: m.supportedGenerationMethods || []
        }));
      return res.json({ available_models: geminiModels });
    }
    return res.json({ raw: data });
  } catch (e) {
    return res.json({ error: e.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
