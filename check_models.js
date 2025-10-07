// check_models.js
const axios = require('axios');
require('dotenv').config();

async function listModels() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Error: GEMINI_API_KEY not found in .env file');
      return;
    }
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);

    console.log('Available models (supporting generateContent):');
    response.data.models.forEach(model => {
      if (model.supportedGenerationMethods.includes('generateContent')) {
        console.log('-', model.name);
      }
    });

  } catch (error) {
    console.error('Error listing models:', error.response ? error.response.data : error.message);
  }
}

listModels();