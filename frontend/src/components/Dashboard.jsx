import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import WeatherCard from './WeatherCard';
import OutfitSuggestion from './OutfitSuggestion';

const Dashboard = () => {
  const [weatherData, setWeatherData] = useState(null);

  const handleWeatherLoad = (data) => {
    setWeatherData(data);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h2 className="text-3xl font-bold text-charcoal">Hoş Geldiniz</h2>
            <p className="text-gray-600 mt-1">Bugünün hava durumuna göre kombin önerileriniz</p>
          </div>
          <Link
            to="/add"
            className="flex items-center space-x-2 bg-charcoal text-white px-6 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-200 shadow-soft"
          >
            <Plus size={20} />
            <span>Hızlı Ekle</span>
          </Link>
        </motion.div>

        {/* Weather Card */}
        <WeatherCard onWeatherLoad={handleWeatherLoad} />

        {/* Today's Outfit Suggestion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="text-charcoal" size={24} />
            <h3 className="text-2xl font-semibold text-charcoal">Bugünün Kombini</h3>
          </div>
          <OutfitSuggestion weatherData={weatherData} />
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
