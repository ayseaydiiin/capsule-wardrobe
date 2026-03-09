import React from 'react';
import { motion } from 'framer-motion';
import { Shirt, ShirtIcon, Footprints, Layers, Sparkles } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OutfitSuggestion = ({ weatherData }) => {
  const [suggestion, setSuggestion] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (weatherData && weatherData.suggestion) {
      setSuggestion(weatherData.suggestion);
    }
  }, [weatherData]);

  if (!weatherData) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-soft text-center text-gray-500">
        <p>Hava durumu yükleniyor...</p>
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-soft text-center text-gray-500">
        <p>Henüz kıyafet eklenmemiş. İlk kıyafetinizi ekleyerek başlayın!</p>
      </div>
    );
  }

  const outfitItems = [
    { key: 'top', label: 'Üst Giyim', icon: Shirt, item: suggestion.top },
    { key: 'bottom', label: 'Alt Giyim', icon: ShirtIcon, item: suggestion.bottom },
    { key: 'shoes', label: 'Ayakkabı', icon: Footprints, item: suggestion.shoes },
    { key: 'outerwear', label: 'Dış Giyim', icon: Layers, item: suggestion.outerwear },
  ].filter(item => item.item);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl p-6 shadow-soft"
    >
      {outfitItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Sparkles size={48} className="mx-auto mb-4 text-gray-300" />
          <p>Uygun kombin bulunamadı. Daha fazla kıyafet ekleyin.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {outfitItems.map((outfitItem, index) => {
            const Icon = outfitItem.icon;
            return (
              <motion.div
                key={outfitItem.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-soft-gray rounded-xl p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="bg-white p-3 rounded-xl">
                    <Icon size={32} className="text-charcoal" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-charcoal mb-2">{outfitItem.label}</p>
                    {outfitItem.item.imageURL ? (
                      <img
                        src={outfitItem.item.imageURL.startsWith('http') ? outfitItem.item.imageURL : `${API_BASE_URL.replace('/api', '')}${outfitItem.item.imageURL}`}
                        alt={outfitItem.label}
                        className="w-24 h-24 object-contain rounded-xl bg-white p-2"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
                        <Icon size={32} className="text-gray-300" />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">{outfitItem.item.color}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      
      {suggestion.accessories && suggestion.accessories.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-sm font-medium text-charcoal mb-3">Aksesuarlar</p>
          <div className="flex space-x-3">
            {suggestion.accessories.map((accessory, index) => (
              <div key={index} className="w-16 h-16 bg-soft-gray rounded-xl p-2">
                {accessory.imageURL ? (
                  <img
                    src={accessory.imageURL.startsWith('http') ? accessory.imageURL : `${API_BASE_URL.replace('/api', '')}${accessory.imageURL}`}
                    alt="Aksesuar"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full bg-white rounded-lg"></div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default OutfitSuggestion;
