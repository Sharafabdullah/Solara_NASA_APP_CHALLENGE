# 🚀 Quick Start Guide

## Current Status

✅ Server is running on http://localhost:3000
✅ All dependencies installed
✅ Frontend ready
✅ Backend configured

## ⚠️ ACTION REQUIRED: Add Your Gemini API Key

1. **Get your Gemini API Key:**

   - Visit: https://makersuite.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the generated key

2. **Update the .env file:**

   - Open the `.env` file in the project root
   - Replace `YOUR_GEMINI_API_KEY_HERE` with your actual key
   - Save the file

3. **Restart the server:**
   ```bash
   # Stop the current server (Ctrl+C in terminal)
   npm start
   ```

## 🎯 How to Use the App

1. **Open your browser** at: http://localhost:3000

2. **Upload an image:**

   - Click the upload area or drag & drop an image
   - Supported formats: JPG, PNG, JPEG

3. **Set location:**

   - Enter any location (e.g., "New York", "London", "Tokyo")

4. **Choose date & time:**

   - Select when you want the weather conditions from
   - Default is set to current date/time

5. **Click "Process Image":**

   - Wait for weather data to load
   - AI generates a prompt based on weather
   - Replicate processes your image (this takes ~30-60 seconds)
   - View results with weather charts

6. **Download your result:**
   - Click the download button to save the modified image

## 📊 Features You'll See

- **Weather Information Card** - Current conditions at your selected time
- **Temperature Chart** - 24-hour temperature forecast
- **Precipitation Chart** - Rainfall/snowfall throughout the day
- **Before/After Images** - Original vs weather-modified
- **AI Prompt Display** - See what prompt Gemini generated

## 🔧 Troubleshooting

### "Failed to generate prompt" error

→ Make sure you've added your Gemini API key to the `.env` file

### "Failed to process image" error

→ Check your Replicate API token is valid

### Port already in use

→ Change PORT in `.env` to 3001 or another number

### Image upload fails

→ Ensure image is under 10MB

## 🌐 API Keys Setup

### Your Replicate Token

Get your token from: https://replicate.com/account/api-tokens

```
REPLICATE_API_TOKEN="your-replicate-token-here"
```

### Gemini API Key

Get it from: https://makersuite.google.com/app/apikey

## 📁 Project Files

```
NASA APP CHALLENGE/
├── public/
│   ├── index.html      # Main web page
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── server.js           # Backend server
├── package.json        # Dependencies
├── .env               # API keys (EDIT THIS!)
└── README.md          # Full documentation
```

## 🎨 Technologies Used

- **Backend:** Node.js + Express
- **Image AI:** Replicate (nano-banana model)
- **Prompt AI:** Google Gemini
- **Weather:** Open-Meteo API (free, no key needed)
- **Charts:** Chart.js
- **Frontend:** Vanilla JavaScript

## 💡 Example Usage

1. Upload a photo of a sunny library
2. Set location: "Seattle, WA"
3. Set date: Today at 6 PM
4. System fetches weather (maybe rainy)
5. Gemini creates prompt: "Transform to show heavy rain, wet surfaces, dark clouds..."
6. Replicate modifies image to look rainy
7. Download your weather-transformed image!

## 🎯 Next Steps

1. ✅ Add your Gemini API key to `.env`
2. ✅ Restart the server
3. ✅ Open http://localhost:3000
4. ✅ Upload an image and test!

---

**Need Help?** Check README.md for full documentation.
