const fetch = require('node-fetch');

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

// Default model — 'chatbot' ya koi bhi invalid model naam NVIDIA reject kar deta hai
const NVIDIA_DEFAULT_MODEL = 'meta/llama-3.1-8b-instruct';

async function chatCompletion(payload) {
  try {
    // FIX 1: stream: false force karo — warna NVIDIA SSE streaming deta hai jo JSON.parse fail karta hai
    // FIX 2: Model naam fix — agar 'chatbot' ya kuch invalid aaya to default use karo
    const body = {
      ...payload,
      model: (payload.model && payload.model !== 'chatbot') ? payload.model : NVIDIA_DEFAULT_MODEL,
      stream: false
    };

    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // FIX 3: response.ok check — error pe json() mat karo, text lo
    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errText.slice(0, 300)}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      content: data?.choices?.[0]?.message?.content || ''
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function visionRequest(imageBase64, prompt, systemPrompt = '') {
  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.2-90b-vision-instruct',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2048,
        temperature: 0.4,
        stream: false   // FIX: streaming band karo
      })
    });

    // FIX: response.ok check
    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errText.slice(0, 300)}`
      };
    }

    const data = await response.json();

    return {
      success: true,
      content: data?.choices?.[0]?.message?.content || ''
    };

  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  chatCompletion,
  visionRequest
};
