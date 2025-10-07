# Weather Image Modifier 🌤️

An AI-powered web application that transforms images based on weather conditions. Built for the NASA Space Apps Challenge 2024.

## Features

- 📸 **Image Upload**: Easy drag-and-drop or click-to-upload interface
- 🌍 **Location-Based**: Enter any location worldwide
- ⏰ **Date & Time Selection**: Choose specific date and time for weather data
- 🌦️ **Weather Integration**: Real-time weather data from Open-Meteo API
- 🤖 **AI Prompt Generation**: Uses Google Gemini to create contextual prompts
- 🎨 **Image Processing**: Transforms images using Replicate's nano-banana model
- 📊 **Weather Visualization**: Interactive charts showing 24-hour forecast
- ⬇️ **Download Results**: Save your weather-modified images

## Tech Stack

### Backend

- **Node.js** with Express
- **Replicate API** for image processing (nano-banana model)
- **Google Gemini API** for AI prompt generation
- **Open-Meteo API** for weather data
- **Multer** for file uploads

### Frontend

- **Vanilla JavaScript**
- **HTML5 & CSS3**
- **Chart.js** for data visualization

## Prerequisites

Before you begin, ensure you have:

- Node.js (v16 or higher) installed
- A Replicate API token
- A Google Gemini API key

## Installation

1. **Clone or navigate to the project directory**

   ```bash
   cd "d:\University\Competitions\NASA APP CHALLENGE"
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your API keys:

   ```env
   REPLICATE_API_TOKEN=your_replicate_token_here
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

## Getting API Keys

### Replicate API Token

1. Go to [Replicate](https://replicate.com/)
2. Sign up or log in
3. Navigate to [API Tokens](https://replicate.com/account/api-tokens)
4. Create a new token and copy it

### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key

## Usage

1. **Start the server**

   ```bash
   npm start
   ```

   For development with auto-restart:

   ```bash
   npm run dev
   ```

2. **Open your browser**

   Navigate to: `http://localhost:3000`

3. **Use the application**
   - Upload an image from your device
   - Enter the location (e.g., "New York", "Paris", "Tokyo")
   - Select the date and time
   - Click "Process Image"
   - Wait for the AI to generate your weather-modified image
   - View weather charts and download the result

## How It Works

1. **Image Upload**: User uploads an image via the web interface
2. **Weather Fetch**: System retrieves weather data for the specified location and time
3. **Prompt Generation**: Gemini AI generates a detailed prompt based on weather conditions
4. **Image Processing**: Replicate's nano-banana model applies weather effects to the image
5. **Results Display**: Modified image and weather charts are displayed
6. **Download**: User can download the modified image

## Project Structure

```
NASA APP CHALLENGE/
├── public/
│   ├── index.html      # Frontend HTML
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── uploads/            # Temporary image storage (auto-created)
├── imgs/               # Sample images
├── server.js           # Backend server
├── package.json        # Dependencies
├── .env               # Environment variables (create this)
├── .env.example       # Environment template
└── README.md          # This file
```

## API Endpoints

### POST `/api/weather`

Fetch weather data for a location and datetime.

**Request Body:**

```json
{
  "location": "New York",
  "datetime": "2024-10-07T14:30:00"
}
```

### POST `/api/generate-prompt`

Generate an AI prompt based on weather conditions.

**Request Body:**

```json
{
  "weatherData": {
    /* weather object */
  }
}
```

### POST `/api/process-image`

Process image with AI using generated prompt.

**Form Data:**

- `image`: Image file
- `prompt`: Generated prompt string

## Weather Data

The application uses Open-Meteo API which provides:

- Temperature
- Humidity
- Precipitation
- Cloud cover
- Wind speed
- Weather codes
- 24-hour forecasts

## Troubleshooting

### Port already in use

Change the PORT in `.env` file to a different number (e.g., 3001)

### API Key errors

- Ensure your `.env` file is in the root directory
- Verify API keys are correct and active
- Check if you have sufficient API credits

### Image processing fails

- Ensure image is under 10MB
- Check internet connection
- Verify Replicate API token is valid

### Weather data not found

- Check location spelling
- Try using city names instead of addresses
- Ensure date is within the forecast range

## Credits

- **Open-Meteo**: Free weather API
- **Replicate**: AI model hosting
- **Google Gemini**: AI prompt generation
- **Chart.js**: Data visualization

## License

MIT License - Feel free to use this project for your own purposes.

## Support

For issues or questions, please refer to:

- [Replicate Documentation](https://replicate.com/docs)
- [Google Gemini Documentation](https://ai.google.dev/docs)
- [Open-Meteo Documentation](https://open-meteo.com/en/docs)

---

**Built with ❤️ for NASA Space Apps Challenge 2024**
