const express = require('express');
const router = express.Router();
const axios = require('axios');
const Clothing = require('../models/Clothing');
const { protect } = require('../middleware/auth');

const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// GET /api/weather-suggestion - Get weather-based outfit suggestion
router.get('/', protect, async (req, res) => {
  try {
    const { lat, lon, city } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Check if API key is configured
    if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'your_openweather_api_key') {
      console.warn('OPENWEATHER_API_KEY is not configured. Using mock weather data.');
      // Return mock weather data for development
      const mockWeather = {
        temperature: 20,
        condition: 'clear',
        description: 'açık',
        humidity: 60,
        windSpeed: 15
      };
      
      const suggestion = await generateOutfitSuggestion(mockWeather, req.userId);
      
      return res.json({
        success: true,
        weather: {
          temperature: mockWeather.temperature,
          condition: mockWeather.condition,
          description: mockWeather.description,
          humidity: mockWeather.humidity,
          windSpeed: mockWeather.windSpeed
        },
        suggestion
      });
    }

    // Fetch weather data from OpenWeatherMap
    const weatherResponse = await axios.get(OPENWEATHER_BASE_URL, {
      params: {
        lat,
        lon,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'tr'
      }
    });

    const weatherData = weatherResponse.data;
    const temperature = weatherData.main.temp;
    const condition = weatherData.weather[0].main.toLowerCase();
    const description = weatherData.weather[0].description;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind?.speed || 0;

    // Weather-based outfit suggestion logic
    const suggestion = await generateOutfitSuggestion({
      temperature,
      condition,
      description,
      humidity,
      windSpeed
    }, req.userId);

    res.json({
      success: true,
      weather: {
        temperature: Math.round(temperature),
        condition,
        description,
        humidity,
        windSpeed: Math.round(windSpeed * 3.6) // Convert m/s to km/h
      },
      suggestion
    });
  } catch (error) {
    console.error('Error fetching weather suggestion:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch weather data'
    });
  }
});

// Outfit suggestion algorithm
async function generateOutfitSuggestion(weather, userId) {
  const { temperature, condition, humidity, windSpeed } = weather;
  const suggestions = {
    top: null,
    bottom: null,
    shoes: null,
    outerwear: null,
    accessories: []
  };

  // Determine base layer thickness
  let baseThickness = 3;
  if (temperature < 5) baseThickness = 5;
  else if (temperature < 10) baseThickness = 4;
  else if (temperature < 15) baseThickness = 3;
  else if (temperature < 20) baseThickness = 2;
  else baseThickness = 1;

  // Check if rain/snow
  const isRainy = condition.includes('rain') || condition.includes('drizzle');
  const isSnowy = condition.includes('snow');
  const isCold = temperature < 15;
  const isWindy = windSpeed > 20; // km/h

  try {
    // Get only user's available clothes
    const allClothes = await Clothing.find({ userId });

    // Filter and select top
    const tops = allClothes.filter(item => item.category === 'Üst Giyim');
    if (tops.length > 0) {
      const suitableTops = tops.filter(top => {
        if (isCold) {
          return top.thickness >= baseThickness - 1;
        }
        return top.thickness <= baseThickness + 1;
      });
      suggestions.top = suitableTops.length > 0 
        ? suitableTops[Math.floor(Math.random() * suitableTops.length)]
        : tops[Math.floor(Math.random() * tops.length)];
    }

    // Filter and select bottom
    const bottoms = allClothes.filter(item => item.category === 'Alt Giyim');
    if (bottoms.length > 0) {
      const suitableBottoms = bottoms.filter(bottom => {
        if (isCold) {
          return bottom.thickness >= baseThickness - 1;
        }
        return bottom.thickness <= baseThickness + 1;
      });
      suggestions.bottom = suitableBottoms.length > 0
        ? suitableBottoms[Math.floor(Math.random() * suitableBottoms.length)]
        : bottoms[Math.floor(Math.random() * bottoms.length)];
    }

    // Filter and select shoes
    const shoes = allClothes.filter(item => item.category === 'Ayakkabı');
    if (shoes.length > 0) {
      if (isRainy || isSnowy) {
        const waterproofShoes = shoes.filter(shoe => shoe.waterproof === true);
        suggestions.shoes = waterproofShoes.length > 0
          ? waterproofShoes[Math.floor(Math.random() * waterproofShoes.length)]
          : shoes[Math.floor(Math.random() * shoes.length)];
      } else {
        suggestions.shoes = shoes[Math.floor(Math.random() * shoes.length)];
      }
    }

    // Filter and select outerwear (if cold or rainy)
    if (isCold || isRainy || isSnowy || isWindy) {
      const outerwear = allClothes.filter(item => item.category === 'Dış Giyim');
      if (outerwear.length > 0) {
        if (isRainy || isSnowy) {
          const waterproofOuterwear = outerwear.filter(item => item.waterproof === true);
          suggestions.outerwear = waterproofOuterwear.length > 0
            ? waterproofOuterwear[Math.floor(Math.random() * waterproofOuterwear.length)]
            : outerwear[Math.floor(Math.random() * outerwear.length)];
        } else {
          const suitableOuterwear = outerwear.filter(item => {
            if (temperature < 5) return item.thickness >= 4;
            if (temperature < 10) return item.thickness >= 3;
            return item.thickness >= 2;
          });
          suggestions.outerwear = suitableOuterwear.length > 0
            ? suitableOuterwear[Math.floor(Math.random() * suitableOuterwear.length)]
            : outerwear[Math.floor(Math.random() * outerwear.length)];
        }
      }
    }

    // Add accessories if very cold
    if (temperature < 5) {
      const accessories = allClothes.filter(item => item.category === 'Aksesuar');
      if (accessories.length > 0) {
        suggestions.accessories = accessories.slice(0, Math.min(2, accessories.length));
      }
    }

    return suggestions;
  } catch (error) {
    console.error('Error generating outfit suggestion:', error);
    return suggestions;
  }
}

module.exports = router;
