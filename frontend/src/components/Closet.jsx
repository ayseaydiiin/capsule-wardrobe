import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const categories = ['Tümü', 'Üst Giyim', 'Alt Giyim', 'Ayakkabı', 'Dış Giyim', 'Aksesuar'];

const Closet = () => {
  const [clothes, setClothes] = useState([]);
  const [filteredClothes, setFilteredClothes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    fetchClothes();
  }, []);

  useEffect(() => {
    filterClothes();
  }, [clothes, searchTerm, selectedCategory, selectedColor]);

  const fetchClothes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'Tümü') {
        params.category = selectedCategory;
      }
      if (selectedColor) {
        params.color = selectedColor;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axiosInstance.get(`/clothes`, { params });
      setClothes(response.data.data);
      setFilteredClothes(response.data.data);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterClothes = () => {
    let filtered = [...clothes];

    if (selectedCategory !== 'Tümü') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedColor) {
      filtered = filtered.filter(item =>
        item.color.toLowerCase().includes(selectedColor.toLowerCase())
      );
    }

    setFilteredClothes(filtered);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bu kıyafeti silmek istediğinize emin misiniz?')) {
      try {
        await axiosInstance.delete(`/clothes/${id}`);
        setClothes(clothes.filter(item => item._id !== id));
      } catch (error) {
        console.error('Error deleting clothing:', error);
        alert('Silme işlemi başarısız oldu');
      }
    }
  };

  const uniqueColors = [...new Set(clothes.map(item => item.color))];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-charcoal mb-4">Dijital Dolabım</h2>
        
        {/* Search and Filters */}
        <div className="bg-white rounded-xl p-4 shadow-soft mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Kıyafet ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                    selectedCategory === category
                      ? 'bg-charcoal text-white'
                      : 'bg-soft-gray text-charcoal hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Color Filter */}
          {uniqueColors.length > 0 && (
            <div className="mt-4 flex items-center space-x-2 flex-wrap gap-2">
              <span className="text-sm text-gray-600">Renk:</span>
              <button
                onClick={() => setSelectedColor('')}
                className={`px-3 py-1 rounded-lg text-sm ${
                  !selectedColor
                    ? 'bg-charcoal text-white'
                    : 'bg-soft-gray text-charcoal'
                }`}
              >
                Tümü
              </button>
              {uniqueColors.slice(0, 10).map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-1 rounded-lg text-sm ${
                    selectedColor === color
                      ? 'bg-charcoal text-white'
                      : 'bg-soft-gray text-charcoal'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clothes Grid */}
      {filteredClothes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-soft">
          <p className="text-gray-500 text-lg">Henüz kıyafet eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {filteredClothes.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-xl p-4 shadow-soft hover:shadow-lg transition-all duration-200 group relative"
              >
                <div className="relative">
                  <img
                    src={item.imageURL.startsWith('http') ? item.imageURL : `${API_BASE_URL.replace('/api', '')}${item.imageURL}`}
                    alt={item.category}
                    className="w-full h-48 object-contain rounded-xl bg-soft-gray p-2"
                  />
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3">
                  <p className="text-sm font-medium text-charcoal">{item.category}</p>
                  <p className="text-xs text-gray-600">{item.color}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs bg-soft-gray px-2 py-1 rounded">
                      Kalınlık: {item.thickness}/5
                    </span>
                    {item.waterproof && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Su Geçirmez
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Closet;
