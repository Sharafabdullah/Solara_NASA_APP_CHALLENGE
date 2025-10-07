const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const Replicate = require('replicate');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Use /tmp for Vercel serverless or uploads for local
const uploadsDir = process.env.VERCEL
  ? '/tmp'
  : path.join(__dirname, 'uploads');

// Create uploads directory if it doesn't exist (only for local)
if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Initialize APIs
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Geocoding function to convert location to coordinates
async function getCoordinates(location) {
  try {
    const response = await axios.get(
      'https://geocoding-api.open-meteo.com/v1/search',
      {
        params: {
          name: location,
          count: 1,
          language: 'en',
          format: 'json',
        },
      }
    );

    if (response.data.results && response.data.results.length > 0) {
      const { latitude, longitude, name, country } = response.data.results[0];
      return { latitude, longitude, name, country };
    }
    throw new Error('Location not found');
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

// Weather API endpoint
app.post('/api/weather', async (req, res) => {
  try {
    const { location, datetime } = req.body;

    if (!location || !datetime) {
      return res
        .status(400)
        .json({ error: 'Location and datetime are required' });
    }

    // Get coordinates from location
    const coords = await getCoordinates(location);

    // Parse the datetime
    const date = new Date(datetime);
    const dateStr = date.toISOString().split('T')[0];
    const hour = date.getHours();

    // Fetch weather data from Open-Meteo
    const weatherResponse = await axios.get(
      'https://api.open-meteo.com/v1/forecast',
      {
        params: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          hourly:
            'temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover,wind_speed_10m',
          start_date: dateStr,
          end_date: dateStr,
          timezone: 'auto',
        },
      }
    );

    const hourlyData = weatherResponse.data.hourly;
    const index = hour;

    // Extract weather data for the specific hour
    const weatherData = {
      location: `${coords.name}, ${coords.country}`,
      coordinates: {
        latitude: coords.latitude,
        longitude: coords.longitude,
      },
      datetime: datetime,
      temperature: hourlyData.temperature_2m[index],
      humidity: hourlyData.relative_humidity_2m[index],
      precipitation: hourlyData.precipitation[index],
      weatherCode: hourlyData.weather_code[index],
      cloudCover: hourlyData.cloud_cover[index],
      windSpeed: hourlyData.wind_speed_10m[index],
      hourlyForecast: {
        time: hourlyData.time,
        temperature: hourlyData.temperature_2m,
        precipitation: hourlyData.precipitation,
        humidity: hourlyData.relative_humidity_2m,
        windSpeed: hourlyData.wind_speed_10m,
      },
    };

    // Interpret weather code
    weatherData.description = interpretWeatherCode(weatherData.weatherCode);

    res.json(weatherData);
  } catch (error) {
    console.error('Weather API error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to fetch weather data' });
  }
});

// Generate prompt using Gemini
app.post('/api/generate-prompt', async (req, res) => {
  try {
    const { weatherData } = req.body;

    if (!weatherData) {
      return res.status(400).json({ error: 'Weather data is required' });
    }

    // For text-only input, use gemini-pro-latest model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    // Determine time of day
    const datetime = new Date(weatherData.datetime);
    const hour = datetime.getHours();
    let timeOfDay;
    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening/dusk';
    } else {
      timeOfDay = 'night';
    }

    const promptContext = `
Given the following weather conditions at ${timeOfDay}:
- Time: ${hour}:00 (${timeOfDay})
- Weather: ${weatherData.description}
- Temperature: ${weatherData.temperature}°C
- Precipitation: ${weatherData.precipitation}mm
- Cloud Cover: ${weatherData.cloudCover}%
- Humidity: ${weatherData.humidity}%
- Wind Speed: ${weatherData.windSpeed} km/h

Create a detailed, vivid prompt for an AI image editing model to transform an image to accurately reflect these weather conditions and time of day. The prompt should describe the atmospheric effects, lighting (considering it's ${timeOfDay}), sky conditions, visibility, and any weather-related visual elements (rain, snow, fog, etc.). Make sure to emphasize the ${timeOfDay} lighting and ambiance. Keep the prompt concise but descriptive (2-3 sentences max).
`;

    const result = await model.generateContent(promptContext);
    const response = await result.response;
    const generatedPrompt = response.text();

    res.json({ prompt: generatedPrompt.trim() });
  } catch (error) {
    console.error('Gemini API error:', error);
    res
      .status(500)
      .json({ error: error.message || 'Failed to generate prompt' });
  }
});

// Process image with Replicate
app.post('/api/process-image', upload.single('image'), async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Read the uploaded file
    const imagePath = path.join(__dirname, 'uploads', req.file.filename);
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

    console.log('Processing image with Replicate...');

    // Run the model - output is a FileOutput object
    const output = await replicate.run('google/nano-banana', {
      input: {
        prompt: prompt,
        image_input: [dataUri],
      },
    });

    console.log('Replicate output:', output);

    // Get the URL from the output
    let imageUrl;
    if (output && typeof output.url === 'function') {
      imageUrl = output.url();
    } else if (typeof output === 'string') {
      imageUrl = output;
    } else if (output && output.url) {
      imageUrl = output.url;
    } else {
      imageUrl = output;
    }

    console.log('Image URL:', imageUrl);

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      modifiedImageUrl: imageUrl,
      originalFileName: req.file.originalname,
    });
  } catch (error) {
    console.error('Replicate API error:', error);
    // Clean up on error
    if (req.file) {
      const imagePath = path.join(__dirname, 'uploads', req.file.filename);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    res.status(500).json({ error: error.message || 'Failed to process image' });
  }
});

// Helper function to interpret weather codes
function interpretWeatherCode(code) {
  const weatherCodes = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Depositing rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    71: 'Slight snow fall',
    73: 'Moderate snow fall',
    75: 'Heavy snow fall',
    77: 'Snow grains',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };

  return weatherCodes[code] || 'Unknown';
}

// Start server only in development (not in Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
