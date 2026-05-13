const fetch = require('node-fetch');

const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

async function chatCompletion(payload) {
  try {
    const response = await fetch(NVIDIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

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
        temperature: 0.4
      })
    });

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