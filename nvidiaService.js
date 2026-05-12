const axios = require('axios');

/**
 * NVIDIA Build AI Service
 * Handles communication with NVIDIA NIM (Inference Microservices)
 */
class NvidiaService {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY;
    this.baseUrl = 'https://integrate.api.nvidia.com/v1';
    
    // Recommended models based on use-cases
    this.models = {
      chatbot: 'meta/llama-3.1-70b-instruct',
      coding: 'meta/llama-3.1-405b-instruct',
      vision: 'meta/llama-3.2-11b-vision-instruct',
      fast: 'meta/llama-3.1-8b-instruct',
      reasoning: 'deepseek-ai/deepseek-r1'
    };
  }

  /**
   * Main request handler for NVIDIA AI
   * @param {Object} options - Request options
   * @param {string} options.model - Model ID or use-case key
   * @param {Array} options.messages - Array of message objects
   * @param {number} options.temperature - Sampling temperature
   * @param {number} options.max_tokens - Max tokens to generate
   */
  async chatCompletion({ model, messages, temperature = 0.5, max_tokens = 1024, response_format = null }) {
    if (!this.apiKey) {
      throw new Error('NVIDIA_API_KEY is not configured in .env');
    }

    // Map use-case keys to actual model IDs
    const modelId = this.models[model] || model;

    const payload = {
      model: modelId,
      messages: messages,
      temperature: temperature,
      top_p: 0.7,
      max_tokens: max_tokens,
      stream: false
    };

    if (response_format) {
      payload.response_format = response_format;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/chat/completions`, payload, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000 // 60 seconds timeout
      });

      return {
        success: true,
        data: response.data,
        content: response.data.choices[0].message.content
      };
    } catch (error) {
      console.error('NVIDIA API Error:', error.response?.data || error.message);
      
      let errorMessage = 'Failed to connect to NVIDIA AI';
      if (error.response?.status === 401) errorMessage = 'Invalid NVIDIA API Key';
      if (error.response?.status === 429) errorMessage = 'NVIDIA API Rate limit exceeded';
      if (error.code === 'ECONNABORTED') errorMessage = 'NVIDIA API request timed out';

      return {
        success: false,
        error: errorMessage,
        details: error.response?.data || error.message
      };
    }
  }

  /**
   * Helper for Vision tasks (Image Understanding)
   */
  async visionRequest(imageBase64, text, systemPrompt) {
    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: text },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      }
    ];

    return this.chatCompletion({
      model: 'vision',
      messages,
      max_tokens: 2048
    });
  }
}

module.exports = new NvidiaService();
