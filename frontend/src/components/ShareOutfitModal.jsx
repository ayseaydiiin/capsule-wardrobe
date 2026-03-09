import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';

const ShareOutfitModal = ({ isOpen, onClose, outfitItems, weatherData, onPostCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setError('Başlık gereklidir');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const postData = {
        title,
        description,
        outfitItems: {
          top: outfitItems?.top?._id,
          bottom: outfitItems?.bottom?._id,
          shoes: outfitItems?.shoes?._id,
          outerwear: outfitItems?.outerwear?._id,
          accessories: outfitItems?.accessories?.map(a => a._id) || [],
        },
        weather: weatherData ? {
          temperature: weatherData.temperature,
          condition: weatherData.condition,
        } : null,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      await axiosInstance.post('/posts', postData);
      
      // Reset form
      setTitle('');
      setDescription('');
      setTags('');
      
      if (onPostCreated) {
        onPostCreated();
      }
      
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">Kombini Paylaş</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Outfit Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Kombiniz</h3>
            <div className="space-y-1 text-sm">
              {outfitItems?.top && (
                <p className="text-gray-600">👕 Üst: {outfitItems.top.category}</p>
              )}
              {outfitItems?.bottom && (
                <p className="text-gray-600">👖 Alt: {outfitItems.bottom.category}</p>
              )}
              {outfitItems?.shoes && (
                <p className="text-gray-600">👟 Ayakkabı: {outfitItems.shoes.category}</p>
              )}
              {outfitItems?.outerwear && (
                <p className="text-gray-600">🧥 Dış Giyim: {outfitItems.outerwear.category}</p>
              )}
              {outfitItems?.accessories?.length > 0 && (
                <p className="text-gray-600">
                  ✨ Aksesuarlar: {outfitItems.accessories.length}
                </p>
              )}
              {weatherData && (
                <p className="text-blue-600 text-xs mt-2">
                  🌡️ {weatherData.temperature}°C - {weatherData.description}
                </p>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Rainy Day Vibes"
              maxLength={100}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Açıklama
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu kombinle neler yapabileceğinizi anlatın..."
              maxLength={500}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{description.length}/500</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiketler
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Virgülle ayırın: casual, winter, elegant"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 flex items-center justify-center space-x-2"
          >
            <Send size={18} />
            <span>{loading ? 'Paylaşılıyor...' : 'Paylaş'}</span>
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ShareOutfitModal;
