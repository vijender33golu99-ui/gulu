// ============================================================
//  VBS Free Tuition — SECURE BACKEND SERVER
//  API keys yahaan safe hain — frontend ko kabhi nahi milte!
//  Hostinger Node.js par deploy karo
// ============================================================

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const path = require('path');
const mongoose = require('mongoose');
const Tesseract = require('tesseract.js');
const nvidiaService = require('./services/nvidiaService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ── Static Files ─────────────────────────────────────────────
// Aapke files root mein hain, isliye '.' use kar rahe hain
app.use(express.static(__dirname));

// ── ENV se API Keys lo ──────────────────────────────────────
const NVIDIA_KEY = process.env.NVIDIA_API_KEY;
const DEEPSEEK_KEY = process.env.DEEPSEEK_API_KEY;
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY;

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
console.log(`🔑 NVIDIA key status:      ${NVIDIA_KEY ? 'Loaded' : 'Not Found'}`);
console.log(`🔑 DeepSeek key status:    ${DEEPSEEK_KEY ? 'Loaded' : 'Not Found'}`);
console.log(`🔑 Gemini keys loaded:     ${GEMINI_KEYS.length}`);
console.log(`🔑 Groq keys loaded:       ${GROQ_KEYS.length}`);
console.log(`🔑 OpenRouter key status:  ${OPENROUTER_KEY ? 'Loaded' : 'Not Found'}`);

// ── MongoDB Connection ────────────────────────────────────────
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
} else {
  console.warn('⚠️  MONGODB_URI not set — cache disabled');
}

// ── AI Cache Schema ───────────────────────────────────────────
const aiCacheSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const AiCache = mongoose.models.AiCache || mongoose.model('AiCache', aiCacheSchema);

// ── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    nvidia_key: !!NVIDIA_KEY,
    deepseek_key: !!DEEPSEEK_KEY,
    gemini_keys: GEMINI_KEYS.length,
    groq_keys: GROQ_KEYS.length,
    openrouter_key: !!OPENROUTER_KEY,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ══════════════════════════════════════════════════════════════
//  MAIN AI ENDPOINT  →  POST /api/ask
// ══════════════════════════════════════════════════════════════
app.post('/api/ask', async (req, res) => {
  const { question, imageBase64, systemPrompt, selectedLangName, useCase = 'chatbot' } = req.body;

  if (!question && !imageBase64) {
    return res.status(400).json({ error: 'Sawaal ya image chahiye!' });
  }

  let rawText = '';
  let apiSuccess = false;
  let lastErrorMsg = 'API se connection nahi hua';

  // ── MongoDB Cache Lookup (text questions only) ─────────────
  if (!imageBase64 && question && mongoose.connection.readyState === 1) {
    try {
      const cached = await AiCache.findOne({ question }).lean();
      if (cached) {
        console.log('✅ CACHE HIT — returning cached answer');
        return res.json({ success: true, rawText: cached.answer, fromCache: true });
      } else {
        console.log('🔍 CACHE MISS — proceeding to AI providers');
      }
    } catch (cacheErr) {
      console.warn('⚠️ Cache lookup error (skipping):', cacheErr.message);
    }
  }

  // ── OCR: Extract text from image (non-blocking) ─────────────
  let ocrText = '';
  if (imageBase64) {
    try {
      console.log('🔍 OCR START — extracting text from image...');
      const imageBuffer = Buffer.from(imageBase64, 'base64');
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng+hin', {
        logger: () => { }   // suppress per-step logs
      });
      ocrText = (text || '').trim();
      if (ocrText.length > 3) {
        console.log(`✅ OCR SUCCESS — extracted ${ocrText.length} chars`);
      } else {
        console.log('⚠️ OCR SUCCESS but no useful text found — using vision only');
        ocrText = '';
      }
    } catch (ocrErr) {
      console.warn('❌ OCR FAILED — continuing with vision only:', ocrErr.message);
      ocrText = '';   // safe fallback — never blocks AI call
    }
  }

  // Build enriched question for AI prompts
  // If OCR found text, append it so text-only providers can also attempt it
  const enrichedQuestion = ocrText
    ? `${question || 'Solve this problem.'}

[OCR Extracted Text from Image]:
${ocrText}`
    : (question || '');

  // ── PRIORITY 0: NVIDIA Build API ───────────────────────────────
  if (NVIDIA_KEY && NVIDIA_KEY !== 'nvapi-your-key-here') {
    try {
      console.log('🚀 Trying NVIDIA Build API...');
      let result;

      if (imageBase64) {
        const visionPrompt = (enrichedQuestion || 'Explain the image. Solve step by step.')
          + `\n\nCRITICAL: Answer in ${selectedLangName}. Return JSON format.`;
        result = await nvidiaService.visionRequest(imageBase64, visionPrompt, systemPrompt);
      } else {
        const userMsg = (enrichedQuestion || 'Explain in detail.')
          + `\n\n[Answer in ${selectedLangName}. Return JSON format.]`;

        result = await nvidiaService.chatCompletion({
          model: useCase,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ],
          response_format: { type: 'json_object' }
        });
      }

      if (result && result.success) {
        rawText = result.content;
        apiSuccess = true;
        console.log('✅ NVIDIA API success');
      } else {
        lastErrorMsg = `NVIDIA Error: ${result?.error || 'Unknown error'}`;
        console.warn('⚠️ NVIDIA API failed:', lastErrorMsg);
      }
    } catch (e) {
      console.error('❌ NVIDIA Integration error:', e.message);
      lastErrorMsg = e.message;
    }
  }

  // ── PRIORITY 1: DeepSeek V3 ──────────────────────────────
  // Skips raw image (no vision), but uses OCR-enriched text if available
  if (!apiSuccess && DEEPSEEK_KEY && (!imageBase64 || ocrText)) {
    try {
      console.log('🚀 Trying DeepSeek V3...');
      const userMsg = (enrichedQuestion || 'Explain in detail.')
        + `\n\nAnswer in ${selectedLangName}. Return JSON format.`;

      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + DEEPSEEK_KEY
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.4
        }),
        timeout: 60000
      });

      if (resp.ok) {
        const data = await resp.json();
        rawText = data?.choices?.[0]?.message?.content || '';
        if (rawText.length > 5) {
          apiSuccess = true;
          console.log('✅ DeepSeek V3 success');

          // Unified cache save happens after all providers (see below)
        }
      } else {
        const errBody = await resp.text();
        lastErrorMsg = `DeepSeek Error ${resp.status}: ${errBody}`;
        console.warn('⚠️ DeepSeek API failed:', lastErrorMsg);
      }
    } catch (e) {
      console.error('❌ DeepSeek error:', e.message);
      lastErrorMsg = e.message;
    }
  }

  // ── PRIORITY 2: Gemini API ─────────────────────────────────
  if (!apiSuccess && GEMINI_KEYS.length > 0) {
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const gKey = GEMINI_KEYS[(geminiKeyIdx + i) % GEMINI_KEYS.length];
      const geminiModel = 'gemini-2.0-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${gKey}`;

      const parts = [];
      if (imageBase64) {
        parts.push({ inlineData: { mimeType: 'image/jpeg', data: imageBase64 } });
      }
      const userMsg = (enrichedQuestion || 'Explain in detail.') + `\n\nAnswer in ${selectedLangName}. JSON format.`;
      parts.push({ text: userMsg });

      try {
        const resp = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents: [{ role: 'user', parts }],
            generationConfig: { temperature: 0.4, responseMimeType: 'application/json' }
          }),
          timeout: 60000
        });

        if (resp.ok) {
          const gData = await resp.json();
          rawText = gData?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (rawText.length > 5) {
            apiSuccess = true;
            geminiKeyIdx = (geminiKeyIdx + i) % GEMINI_KEYS.length;
            console.log('✅ Gemini API success');
            break;
          }
        }
      } catch (e) {
        console.error('❌ Gemini error:', e.message);
      }
    }
  }

  // ── PRIORITY 3: Groq Fallback ──────────────────────────────
  if (!apiSuccess && GROQ_KEYS.length > 0) {
    // ... (Groq logic remains same but simplified for safety)
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      const keyToUse = GROQ_KEYS[(groqKeyIdx + i) % GROQ_KEYS.length];
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + keyToUse },
          body: JSON.stringify({
            model: imageBase64 ? 'meta-llama/llama-4-scout-17b-16e-instruct' : 'llama-3.3-70b-versatile',
            response_format: { type: 'json_object' },
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: enrichedQuestion + `\n\nAnswer in ${selectedLangName}. JSON.` }
            ]
          }),
          timeout: 60000
        });
        if (resp.ok) {
          const data = await resp.json();
          rawText = data?.choices?.[0]?.message?.content || '';
          apiSuccess = true;
          console.log('✅ Groq API success');
          break;
        }
      } catch (e) { }
    }
  }

  // ── PRIORITY 4: OpenRouter Emergency Fallback ─────────────
  if (!apiSuccess && OPENROUTER_KEY && !imageBase64) {
    try {
      console.log('🚨 OPENROUTER FALLBACK — trying OpenRouter...');
      const userMsg = (question || 'Explain in detail.')
        + `\n\nAnswer in ${selectedLangName}. Return JSON format.`;

      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENROUTER_KEY,
          'HTTP-Referer': 'https://vbstuition.com',
          'X-Title': 'VBS Free Tuition'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMsg }
          ],
          temperature: 0.4
        }),
        timeout: 60000
      });

      if (resp.ok) {
        const data = await resp.json();
        rawText = data?.choices?.[0]?.message?.content || '';
        if (rawText.length > 5) {
          apiSuccess = true;
          console.log('✅ OPENROUTER SUCCESS — response received');
        }
      } else {
        const errBody = await resp.text();
        lastErrorMsg = `OpenRouter Error ${resp.status}: ${errBody}`;
        console.warn('❌ OPENROUTER FAILED:', lastErrorMsg);
      }
    } catch (e) {
      console.error('❌ OPENROUTER FAILED — exception:', e.message);
      lastErrorMsg = e.message;
    }
  }

  if (!apiSuccess) {
    return res.status(503).json({ error: true, message: `All APIs failed. Last error: ${lastErrorMsg}` });
  }

  // ── Unified Cache Save ────────────────────────────────────
  if (!imageBase64 && question && mongoose.connection.readyState === 1) {
    AiCache.create({ question, answer: rawText })
      .then(() => console.log('💾 CACHE SAVED — answer stored in MongoDB'))
      .catch(err => console.warn('⚠️ Cache save error:', err.message));
  }

  return res.json({ success: true, rawText });
});

// ── Tawk AI Endpoint ──────────────────────────────────────────
// Helper: returns true for status codes that mean "hard failure / no credit"
function isTawkHardFail(status) {
  return [401, 402, 403, 429].includes(status);
}

// Helper: returns true when an error-body string signals quota / auth issues
function isTawkQuotaError(bodyText) {
  const t = (bodyText || '').toLowerCase();
  return t.includes('insufficient balance') ||
    t.includes('invalid api key') ||
    t.includes('quota exceeded') ||
    t.includes('rate limit') ||
    t.includes('unauthorized') ||
    t.includes('payment required');
}

app.post('/api/tawk-ai', async (req, res) => {
  const { message, visitor } = req.body;

  if (!message) return res.status(400).json({ error: 'Message exists validation failed' });

  console.log('📨 Incoming Tawk AI message:', message);

  const SYSTEM_PROMPT = 'You are Didi AI, a helpful and fun teacher for VBS Free Tuition.';
  const failures = []; // collect per-provider error details

  // ── PROVIDER 1: DeepSeek ─────────────────────────────────────
  if (DEEPSEEK_KEY) {
    const providerName = 'DeepSeek';
    console.log('🔄 Trying provider:', providerName);
    try {
      const resp = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + DEEPSEEK_KEY },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message }
          ]
        }),
        timeout: 60000
      });
      console.log('📡 DeepSeek status:', resp.status);
      if (resp.ok) {
        const data = await resp.json();
        console.log('🧠 DeepSeek raw response:', JSON.stringify(data).slice(0, 200));
        const reply = data?.choices?.[0]?.message?.content || '';
        if (reply) {
          console.log('✅ Provider success:', providerName);
          return res.json({ success: true, reply });
        }
      }
      const errBody = await resp.text().catch(() => '');
      const errMsg = `HTTP ${resp.status}: ${errBody.slice(0, 120)}`;
      console.log('❌ Provider failed:', providerName, errMsg);
      failures.push({ provider: providerName, error: errMsg });
    } catch (e) {
      console.log('❌ Provider failed:', providerName, e.message);
      failures.push({ provider: providerName, error: e.message });
    }
  }

  // ── PROVIDER 2: Groq ─────────────────────────────────────────
  if (GROQ_KEYS.length > 0) {
    const providerName = 'Groq';
    console.log('🔄 Trying provider:', providerName);
    for (let i = 0; i < GROQ_KEYS.length; i++) {
      const key = GROQ_KEYS[(groqKeyIdx + i) % GROQ_KEYS.length];
      try {
        const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: message }
            ]
          }),
          timeout: 60000
        });
        if (resp.ok) {
          const data = await resp.json();
          const reply = data?.choices?.[0]?.message?.content || '';
          if (reply) {
            groqKeyIdx = (groqKeyIdx + i) % GROQ_KEYS.length;
            console.log('✅ Provider success:', providerName);
            return res.json({ success: true, reply });
          }
        }
        const errBody = await resp.text().catch(() => '');
        const errMsg = `HTTP ${resp.status}: ${errBody.slice(0, 120)}`;
        // If this key is rate-limited/invalid, try the next Groq key
        if (isTawkHardFail(resp.status) || isTawkQuotaError(errBody)) continue;
        console.log('❌ Provider failed:', providerName, errMsg);
        failures.push({ provider: providerName, error: errMsg });
        break;
      } catch (e) {
        console.log('❌ Provider failed:', providerName, e.message);
        failures.push({ provider: providerName, error: e.message });
        break;
      }
    }
    // If all Groq keys were cycled through without success, log once
    if (!failures.find(f => f.provider === providerName)) {
      const msg = 'All Groq keys exhausted';
      console.log('❌ Provider failed:', providerName, msg);
      failures.push({ provider: providerName, error: msg });
    }
  }

  // ── PROVIDER 3: OpenRouter ───────────────────────────────────
  if (OPENROUTER_KEY) {
    const providerName = 'OpenRouter';
    console.log('🔄 Trying provider:', providerName);
    try {
      const resp = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + OPENROUTER_KEY,
          'HTTP-Referer': 'https://vbscomputersystem.in',
          'X-Title': 'VBS Free Tuition'
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3-0324:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: message }
          ]
        }),
        timeout: 60000
      });
      if (resp.ok) {
        const data = await resp.json();
        const reply = data?.choices?.[0]?.message?.content || '';
        if (reply) {
          console.log('✅ Provider success:', providerName);
          return res.json({ success: true, reply });
        }
      }
      const errBody = await resp.text().catch(() => '');
      const errMsg = `HTTP ${resp.status}: ${errBody.slice(0, 120)}`;
      console.log('❌ Provider failed:', providerName, errMsg);
      failures.push({ provider: providerName, error: errMsg });
    } catch (e) {
      console.log('❌ Provider failed:', providerName, e.message);
      failures.push({ provider: providerName, error: e.message });
    }
  }

  // ── PROVIDER 4: Gemini ───────────────────────────────────────
  if (GEMINI_KEYS.length > 0) {
    const providerName = 'Gemini';
    console.log('🔄 Trying provider:', providerName);
    for (let i = 0; i < GEMINI_KEYS.length; i++) {
      const key = GEMINI_KEYS[(geminiKeyIdx + i) % GEMINI_KEYS.length];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;
      try {
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: [{ role: 'user', parts: [{ text: message }] }],
            generationConfig: { temperature: 0.7 }
          }),
          timeout: 60000
        });
        if (resp.ok) {
          const data = await resp.json();
          const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (reply) {
            geminiKeyIdx = (geminiKeyIdx + i) % GEMINI_KEYS.length;
            console.log('✅ Provider success:', providerName);
            return res.json({ success: true, reply });
          }
        }
        const errBody = await resp.text().catch(() => '');
        const errMsg = `HTTP ${resp.status}: ${errBody.slice(0, 120)}`;
        if (isTawkHardFail(resp.status) || isTawkQuotaError(errBody)) continue;
        console.log('❌ Provider failed:', providerName, errMsg);
        failures.push({ provider: providerName, error: errMsg });
        break;
      } catch (e) {
        console.log('❌ Provider failed:', providerName, e.message);
        failures.push({ provider: providerName, error: e.message });
        break;
      }
    }
    if (!failures.find(f => f.provider === providerName)) {
      const msg = 'All Gemini keys exhausted';
      console.log('❌ Provider failed:', providerName, msg);
      failures.push({ provider: providerName, error: msg });
    }
  }

  // ── All providers failed ──────────────────────────────────────
  console.error('❌ Tawk AI route error: all providers failed', JSON.stringify(failures));
  return res.status(503).json({
    error: true,
    message: 'All AI providers failed. Please try again later.',
    failures
  });
});
console.log('✅ Tawk AI route registered');

// ── Math Endpoint ────────────────────────────────────────────


app.post('/api/math', async (req, res) => {
  return app._router.handle({ ...req, url: '/api/ask', method: 'POST' }, res, () => res.status(500).json({ error: 'Internal routing error' }));
});

// ── Catch-all ────────────────────────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ── Start ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
