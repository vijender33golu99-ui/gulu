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
  .split(',').map(k => k.trim()).filter(k => k && k.startsWith('AIza'));

const GROQ_KEYS = (process.env.GROQ_API_KEYS || '')
  .split(',').map(k => k.trim()).filter(k => k && k.startsWith('gsk_'));

let geminiKeyIdx = 0;
let groqKeyIdx = 0;

console.log(`✅ Server start ho raha hai...`);
console.log(`🔑 Gemini keys loaded: ${GEMINI_KEYS.length}`);
console.log(`🔑 Groq keys loaded:   ${GROQ_KEYS.length}`);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ── GROQ (text only, free tier bahut generous hai) ──────────────────────────
async function callGroq(question, systemPrompt, langName) {
  if (GROQ_KEYS.length === 0) return { success: false, error: 'No Groq keys' };
  if (!question) return { success: false, error: 'No question for Groq' };

  for (let i = 0; i < GROQ_KEYS.length; i++) {
    const keyToUse = GROQ_KEYS[(groqKeyIdx + i) % GROQ_KEYS.length];
    try {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keyToUse },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question + `\n\nAnswer in ${langName}.` }
          ]
        }),
        timeout: 60000
      });

      if (resp.status === 429) {
        console.warn(`⚠️ Groq rate limit key ${i + 1}. 3s wait...`);
        await sleep(3000);
        continue;
      }

      if (resp.ok) {
        const data = await resp.json();
        const rawText = data?.choices?.[0]?.message?.content || '';
        if (rawText.length > 5) {
          groqKeyIdx = (groqKeyIdx + i) % GROQ_KEYS.length;
          console.log('✅ Groq success');
          return { success: true, text: rawText };
        }
      } else {
        const errBody = await resp.text();
        console.error(`Groq Error key ${i+1}:`, resp.status, errBody.substring(0, 100));
      }
    } catch (e) {
      console.error(`❌ Groq network error key ${i+1}:`, e.message);
    }
  }
  return { success: false, error: 'All Groq keys failed' };
}

// ── GEMINI (image + text, limited free quota) ────────────────────────────────
async function callGemini(question, imageBase64, systemPrompt, langName) {
  if (GEMINI_KEYS.length === 0) return { success: false, error: 'No Gemini keys' };

  // 2.0-flash sabse zyada free RPM (15/min), baaki fallback
  // Sirf 2.0 models — 2.5-flash = 500/day, 2.5-pro = 50/day (jaldi khatam). 2.0-flash = 1500/day
  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.0-flash-lite'];
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
      parts.push({ text: (question || 'Please answer in detail.') + `\n\nAnswer in ${langName}.` });

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
          lastError = `Rate Limit 429 on ${model} - ${errBody.substring(0, 100)}`;
          console.warn(`⚠️ Gemini 429: ${model} key ${i+1}. 2s wait...`);
          await sleep(2000);
          continue;
        }

        if (resp.ok) {
          const gData = await resp.json();
          const rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
          console.error(`Gemini ${resp.status} on ${model} key ${i+1}`);
          allKeysRateLimited = false;
          if (resp.status === 404) break; // model not available, next model try karo
        }
      } catch (e) {
        lastError = e.message;
        allKeysRateLimited = false;
        console.error('❌ Gemini network error:', e.message);
      }
    }

    if (allKeysRateLimited) {
      console.warn(`⏳ ${model} sab keys 429. 3s baad agla model...`);
      await sleep(3000);
    }
  }
  return { success: false, error: lastError };
}

// ── MAIN ROUTE ────────────────────────────────────────────────────────────────
app.post('/api/ask', async (req, res) => {
  const { question, imageBase64, systemPrompt, selectedLangName } = req.body;

  if (!question && !imageBase64) {
    return res.status(400).json({ error: 'Sawaal ya image chahiye!' });
  }

  const lang = selectedLangName || 'Hindi';
  const strictSystemPrompt = (systemPrompt || '') +
    "\n\nCRITICAL INSTRUCTION: You are 'Didi AI', a friendly teacher. Answer the student's question in a single, complete, and easy-to-understand response. Use simple step-by-step Hindi/Hinglish. If it is a Math question, solve it clearly.";

  // ── STRATEGY ──────────────────────────────────────────────────────────────
  // Image hai → sirf Gemini kar sakta hai (vision chahiye)
  // Text only → pehle Groq (quota unlimited jaise), Gemini sirf backup
  // ─────────────────────────────────────────────────────────────────────────

  if (imageBase64) {
    // IMAGE: Gemini primary, Groq se text-only fallback
    console.log('🖼️ Image request → Gemini try kar raha hai...');
    const geminiResult = await callGemini(question, imageBase64, strictSystemPrompt, lang);
    if (geminiResult.success) return res.json({ success: true, rawText: geminiResult.text });

    // Image samajh nahi aaya, question text hai toh Groq se try karo
    if (question) {
      console.log('⚠️ Gemini image failed, Groq se sirf text answer de raha hai...');
      const groqResult = await callGroq(question, strictSystemPrompt, lang);
      if (groqResult.success) return res.json({ success: true, rawText: '(Image analysis unavailable)\n\n' + groqResult.text });
    }

    return res.status(503).json({ error: true, message: `All APIs failed. ${geminiResult.error}` });

  } else {
    // TEXT ONLY: Groq primary (fast + no daily quota), Gemini sirf backup
    console.log('💬 Text request → Groq try kar raha hai (primary)...');
    const groqResult = await callGroq(question, strictSystemPrompt, lang);
    if (groqResult.success) return res.json({ success: true, rawText: groqResult.text });

    console.log('⚠️ Groq failed, Gemini backup try kar raha hai...');
    const geminiResult = await callGemini(question, null, strictSystemPrompt, lang);
    if (geminiResult.success) return res.json({ success: true, rawText: geminiResult.text });

    return res.status(503).json({ error: true, message: `All APIs failed. Groq: ${groqResult.error} | Gemini: ${geminiResult.error}` });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', gemini_keys: GEMINI_KEYS.length, groq_keys: GROQ_KEYS.length });
});

// Diagnostic: fetch which Gemini models are available
app.get('/api/models', async (req, res) => {
  if (GEMINI_KEYS.length === 0) return res.json({ error: 'No Gemini keys loaded' });
  try {
    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_KEYS[0]}&pageSize=50`);
    const data = await resp.json();
    if (data.models) {
      const geminiModels = data.models
        .filter(m => m.name.includes('gemini'))
        .map(m => ({ name: m.name.replace('models/', ''), methods: m.supportedGenerationMethods || [] }));
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
