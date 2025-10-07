// API base URL
const API_BASE = 'http://localhost:3000/api';

// State
let uploadedImage = null;
let weatherData = null;
let generatedPrompt = null;
let isProcessing = false;

// DOM Elements
const imageInput = document.getElementById('imageInput');
const uploadArea = document.getElementById('uploadArea');
const imagePreview = document.getElementById('imagePreview');
const locationInput = document.getElementById('location');
const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const processBtn = document.getElementById('processBtn');
const loadingIndicator = document.getElementById('loadingIndicator');
const loadingText = document.getElementById('loadingText');
const weatherSection = document.getElementById('weatherSection');
const weatherInfo = document.getElementById('weatherInfo');
const chartsSection = document.getElementById('chartsSection');
const resultsSection = document.getElementById('resultsSection');
const originalImage = document.getElementById('originalImage');
const modifiedImage = document.getElementById('modifiedImage');
const downloadBtn = document.getElementById('downloadBtn');
const promptText = document.getElementById('promptText');

// Chart instances
let temperatureChart = null;
let precipitationChart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Set default date and time to now
  const now = new Date();
  dateInput.value = now.toISOString().split('T')[0];
  timeInput.value = now.toTimeString().slice(0, 5);

  setupEventListeners();
});

function setupEventListeners() {
  // Image upload
  uploadArea.addEventListener('click', () => imageInput.click());
  imageInput.addEventListener('change', handleImageSelect);

  // Drag and drop
  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      imageInput.files = e.dataTransfer.files;
      handleImageSelect({ target: { files: [file] } });
    }
  });

  // Check inputs to enable/disable button
  locationInput.addEventListener('input', checkInputs);
  dateInput.addEventListener('change', checkInputs);
  timeInput.addEventListener('change', checkInputs);

  // Process button click
  processBtn.addEventListener('click', processImage);
}

function handleImageSelect(event) {
  const file = event.target.files[0];
  if (file) {
    uploadedImage = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.src = e.target.result;
      imagePreview.classList.add('show');
      document.querySelector('.upload-content').style.display = 'none';

      // Check if button should be enabled
      checkInputs();
    };
    reader.readAsDataURL(file);
  }
}

function checkInputs() {
  // Enable button only if all required fields are filled
  const allFilled =
    uploadedImage &&
    locationInput.value.trim() &&
    dateInput.value &&
    timeInput.value;

  processBtn.disabled = !allFilled;
}

async function processImage() {
  // Prevent multiple simultaneous processes
  if (isProcessing) {
    return;
  }

  // Validation
  if (!uploadedImage) {
    alert('Please upload an image first!');
    return;
  }

  if (!locationInput.value || !dateInput.value || !timeInput.value) {
    alert('Please fill in all location and time fields!');
    return;
  }

  // Mark as processing
  isProcessing = true;
  showLoading(true);
  hideResults();

  try {
    // Step 1: Fetch weather data
    loadingText.textContent = 'Fetching weather data...';
    weatherData = await fetchWeather();
    displayWeatherInfo(weatherData);
    displayWeatherCharts(weatherData);

    // Step 2: Generate prompt with Gemini
    loadingText.textContent = 'Generating AI prompt with Gemini...';
    generatedPrompt = await generatePrompt(weatherData);

    // Step 3: Process image with Replicate
    loadingText.textContent =
      'Processing image with AI (this may take a minute)...';
    const result = await processImageWithReplicate(
      uploadedImage,
      generatedPrompt
    );

    // Display results
    displayResults(result);
    showLoading(false);
  } catch (error) {
    console.error('Error:', error);
    alert(`Error: ${error.message}`);
    showLoading(false);
  } finally {
    isProcessing = false;
  }
}

async function fetchWeather() {
  const datetime = `${dateInput.value}T${timeInput.value}:00`;

  const response = await fetch(`${API_BASE}/weather`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      location: locationInput.value,
      datetime: datetime,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch weather data');
  }

  return await response.json();
}

async function generatePrompt(weatherData) {
  const response = await fetch(`${API_BASE}/generate-prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ weatherData }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate prompt');
  }

  const data = await response.json();
  return data.prompt;
}

async function processImageWithReplicate(image, prompt) {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('prompt', prompt);

  const response = await fetch(`${API_BASE}/process-image`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process image');
  }

  return await response.json();
}

function displayWeatherInfo(data) {
  weatherInfo.innerHTML = `
        <div class="weather-description">
            <strong>${data.description}</strong> in ${data.location}
        </div>
        <div class="weather-card">
            <h3>Temperature</h3>
            <p>${data.temperature}°C</p>
        </div>
        <div class="weather-card">
            <h3>Humidity</h3>
            <p>${data.humidity}%</p>
        </div>
        <div class="weather-card">
            <h3>Precipitation</h3>
            <p>${data.precipitation} mm</p>
        </div>
        <div class="weather-card">
            <h3>Cloud Cover</h3>
            <p>${data.cloudCover}%</p>
        </div>
        <div class="weather-card">
            <h3>Wind Speed</h3>
            <p>${data.windSpeed} km/h</p>
        </div>
    `;
  weatherSection.style.display = 'block';
}

function displayWeatherCharts(data) {
  const hourlyData = data.hourlyForecast;

  // Extract labels (hours)
  const labels = hourlyData.time.map((time) => {
    const date = new Date(time);
    return date.getHours() + ':00';
  });

  // Temperature Chart
  const tempCtx = document.getElementById('temperatureChart');
  if (temperatureChart) {
    temperatureChart.destroy();
  }
  temperatureChart = new Chart(tempCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Temperature (°C)',
          data: hourlyData.temperature,
          borderColor: '#f7cc63',
          backgroundColor: 'rgba(247, 204, 99, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#ffffff' },
        },
      },
      scales: {
        y: {
          ticks: { color: '#cccccc' },
          grid: { color: '#4a4a4a' },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#4a4a4a' },
        },
      },
    },
  });

  // Precipitation Chart
  const precipCtx = document.getElementById('precipitationChart');
  if (precipitationChart) {
    precipitationChart.destroy();
  }
  precipitationChart = new Chart(precipCtx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Precipitation (mm)',
          data: hourlyData.precipitation,
          backgroundColor: '#058ed9',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#ffffff' },
        },
      },
      scales: {
        y: {
          ticks: { color: '#cccccc' },
          grid: { color: '#4a4a4a' },
        },
        x: {
          ticks: { color: '#cccccc' },
          grid: { color: '#4a4a4a' },
        },
      },
    },
  });

  chartsSection.style.display = 'block';
}

function displayResults(result) {
  // Display modified image below the input
  modifiedImage.src = result.modifiedImageUrl;

  // Setup download button
  downloadBtn.href = result.modifiedImageUrl;
  downloadBtn.download = `solara-weather-modified-${result.originalFileName}`;
  downloadBtn.style.display = 'inline-flex';

  // Display prompt
  promptText.textContent = generatedPrompt;
  document.getElementById('promptSection').style.display = 'block';

  resultsSection.style.display = 'block';

  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showLoading(show) {
  loadingIndicator.style.display = show ? 'block' : 'none';
}

function hideResults() {
  weatherSection.style.display = 'none';
  chartsSection.style.display = 'none';
  resultsSection.style.display = 'none';
}
