import React, { useState, useEffect } from 'react';
import { Cloud, CloudRain, Sun, Snowflake, Gauge, Droplets } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const WeatherCard = ({ onWeatherLoad }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getWeather = async (lat = null, lon = null) => {
    try {
      setLoading(true);
      
      // If coordinates not provided, try to get user's location
      if (!lat || !lon) {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              await fetchWeatherData(latitude, longitude);
            },
            async (err) => {
              console.warn('Konum izni verilmedi, varsayılan konum kullanılıyor (İstanbul)');
              // Fallback to Istanbul coordinates if location permission denied
              await fetchWeatherData(41.0082, 28.9784);
            },
            { timeout: 5000 }
          );
        } else {
          // Fallback to Istanbul if geolocation not supported
          await fetchWeatherData(41.0082, 28.9784);
        }
      } else {
        await fetchWeatherData(lat, lon);
      }
    } catch (err) {
      setError('Bir hata oluştu');
      setLoading(false);
      console.error('Weather fetch error:', err);
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    try {
      const response = await axiosInstance.get(`/weather-suggestion`, {
        params: { lat, lon }
      });
      
      setWeather(response.data.weather);
      if (onWeatherLoad) {
        onWeatherLoad(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Weather API error:', err);
      if (err.response?.status === 500 && err.response?.data?.error?.includes('API key')) {
        setError('Hava durumu API anahtarı yapılandırılmamış. Lütfen backend .env dosyasına OPENWEATHER_API_KEY ekleyin.');
      } else {
        setError('Hava durumu verisi alınamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) {
      return CloudRain;
    } else if (conditionLower.includes('snow')) {
      return Snowflake;
    } else if (conditionLower.includes('cloud')) {
      return Cloud;
    } else if (conditionLower.includes('wind')) {
      return Gauge;
    }
    return Sun;
  };

  const getWeatherColor = (condition) => {
    const conditionLower = condition?.toLowerCase() || '';
    if (conditionLower.includes('rain') || conditionLower.includes('snow')) {
      return 'bg-blue-100 text-blue-700';
    } else if (conditionLower.includes('cloud')) {
      return 'bg-gray-100 text-gray-700';
    }
    return 'bg-yellow-100 text-yellow-700';
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="animate-pulse flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 shadow-soft"
      >
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={getWeather}
            className="mt-2 text-sm text-charcoal hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      </motion.div>
    );
  }

  if (!weather) return null;

  const WeatherIcon = getWeatherIcon(weather.condition);
  const weatherColorClass = getWeatherColor(weather.condition);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-soft"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`${weatherColorClass} p-3 rounded-xl`}>
            <WeatherIcon size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-charcoal">{weather.temperature}°C</h3>
            <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Droplets size={16} />
            <span>%{weather.humidity}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Gauge size={16} />
            <span>{weather.windSpeed} km/h</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherCard;
