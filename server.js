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

// Delay function for Rate Limit Handling (Retry system)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to call Gemini API with retry logic and model fallback
async function callGemini(question, imageBase64, systemPrompt, langName) {
  if (GEMINI_KEYS.length === 0) return { success: false, error: 'No Gemini keys' };

  const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
  let lastError = null;

  for (const model of modelsToTry) {
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const gKey = GEMINI_KEYS[(geminiKeyIdx + i) % GEMINI_KEYS.length];
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${gKey}`;

      const parts = [];
      if (imageBase64) {
        // Strip data:image/jpeg;base64, prefix if present
        const base64Data = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: base64Data } });
      }
      
      const userMsg = (question || 'Please answer in detail.') + `

Answer in ${langName}.`;
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

        if (resp.status === 429) {
          const errBody = await resp.text();
          console.warn(`⚠️ Rate limit for ${model}. Body: ${errBody}`);
          lastError = `Rate Limit 429 on ${model} - ${errBody.substring(0, 50)}`;
          // We don't sleep anymore, we just try the next key or next model immediately!
          continue; 
        }

        if (resp.ok) {
          const gData = await resp.json();
          let rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawText.length > 5) {
            geminiKeyIdx = (geminiKeyIdx + i) % GEMINI_KEYS.length;
            return { success: true, text: rawText };
          }
        } else {
          const errBody = await resp.text();
          lastError = `Error ${resp.status} on ${model} - ${errBody}`;
          console.error(`Gemini Error on ${model}:`, errBody);
          // If 404 (Not Found), immediately break the key loop and try the NEXT model
          if (resp.status === 404) {
            break;
          }
        }
      } catch (e) {
        lastError = e.message;
        console.error('❌ Gemini Network error:', e.message);
      }
    }
  }
    // If all models failed, let's fetch what models are ACTUALLY available for this key
  try {
    const listResp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEYS[0]}`);
    if (listResp.ok) {
      const listData = await listResp.json();
      const modelNames = listData.models.map(m => m.name.replace('models/', '')).filter(n => n.includes('gemini')).join(', ');
      return { success: false, error: `Key Error: Ye models aapki key me available hain: ${modelNames}` };
    }
  } catch(e) {}

  return { success: false, error: lastError };
}

app.post('/api/ask', async (req, res) => {
  const { question, imageBase64, systemPrompt, selectedLangName } = req.body;

  if (!question && !imageBase64) {
    return res.status(400).json({ error: 'Sawaal ya image chahiye!' });
  }

  // Inject a strict one-shot prompt instruction
  const strictSystemPrompt = systemPrompt + "\n\nCRITICAL INSTRUCTION: You are 'Didi AI', a friendly teacher. Answer the student's question in a single, complete, and easy-to-understand response. Use simple step-by-step Hindi/Hinglish. If it is a Math question, solve it clearly.";

  // 1. Try Gemini First (Best for Image + Text)
  console.log('🚀 Calling Gemini API...');
  const geminiResult = await callGemini(question, imageBase64, strictSystemPrompt, selectedLangName || 'Hindi');
  
  if (geminiResult.success) {
    console.log('✅ Gemini API success');
    return res.json({ success: true, rawText: geminiResult.text });
  }

  // 2. Fallback to Groq (If text only and Gemini completely fails)
  console.log(`⚠️ Gemini failed (${geminiResult.error}). Trying Groq...`);
  if (!imageBase64 && GROQ_KEYS.length > 0) { // Groq doesn't natively handle images in this simple setup
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
          console.warn(`⚠️ Rate limit hit for Gemini Key. Retrying... Body: ${errBody}`);
          await sleep(5000); // Wait 5 seconds before retrying
          lastError = `Rate Limit (429) - ${errBody.substring(0, 50)}`;
          continue; // Try next key
        }

        if (resp.ok) {
          const data = await resp.json();
          const rawText = data?.choices?.[0]?.message?.content || '';
          groqKeyIdx = (groqKeyIdx + i) % GROQ_KEYS.length;
          console.log('✅ Groq API success');
          return res.json({ success: true, rawText });
        }
      } catch (e) {}
    }
  }

  return res.status(503).json({ error: true, message: `All APIs failed. Last error: ${geminiResult.error}` });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', gemini_keys: GEMINI_KEYS.length, groq_keys: GROQ_KEYS.length });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
