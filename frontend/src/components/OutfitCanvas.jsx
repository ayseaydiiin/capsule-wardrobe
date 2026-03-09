import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { motion } from 'framer-motion';
import { Trash2, Download, Share2 } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import ClothingItem from './ClothingItem';
import ShareOutfitModal from './ShareOutfitModal';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const OutfitCanvas = () => {
  const [clothes, setClothes] = useState([]);
  const [outfitItems, setOutfitItems] = useState({
    top: null,
    bottom: null,
    shoes: null,
    outerwear: null,
    accessories: []
  });
  const [loading, setLoading] = useState(true);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    fetchClothes();
  }, []);

  const fetchClothes = async () => {
    try {
      const response = await axiosInstance.get(`/clothes`);
      setClothes(response.data.data);
    } catch (error) {
      console.error('Error fetching clothes:', error);
    } finally {
      setLoading(false);
    }
  };

  const [{ isOver }, drop] = useDrop({
    accept: 'clothing',
    drop: (item, monitor) => {
      const category = item.category;
      
      if (category === 'Aksesuar') {
        setOutfitItems(prev => ({
          ...prev,
          accessories: [...prev.accessories, item]
        }));
      } else {
        setOutfitItems(prev => ({
          ...prev,
          [getCategoryKey(category)]: item
        }));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  });

  const getCategoryKey = (category) => {
    const mapping = {
      'Üst Giyim': 'top',
      'Alt Giyim': 'bottom',
      'Ayakkabı': 'shoes',
      'Dış Giyim': 'outerwear'
    };
    return mapping[category] || 'top';
  };

  const removeItem = (category) => {
    setOutfitItems(prev => ({
      ...prev,
      [category]: null
    }));
  };

  const removeAccessory = (index) => {
    setOutfitItems(prev => ({
      ...prev,
      accessories: prev.accessories.filter((_, i) => i !== index)
    }));
  };

  const clearCanvas = () => {
    setOutfitItems({
      top: null,
      bottom: null,
      shoes: null,
      outerwear: null,
      accessories: []
    });
  };

  const groupedClothes = clothes.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-charcoal mb-2">Kombin Oluştur</h2>
          <p className="text-gray-600">Kıyafetleri sürükleyip bırakarak kombin oluşturun</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowShareModal(true)}
          disabled={!outfitItems.top && !outfitItems.bottom && !outfitItems.shoes}
          className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Share2 size={20} />
          <span>Paylaş</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <div
            ref={drop}
            className={`bg-white rounded-xl p-8 shadow-soft min-h-[600px] transition-all duration-200 ${
              isOver ? 'bg-soft-gray border-2 border-charcoal border-dashed' : ''
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-charcoal">Kombin Alanı</h3>
              <button
                onClick={clearCanvas}
                className="text-sm text-red-600 hover:text-red-700 flex items-center space-x-1"
              >
                <Trash2 size={16} />
                <span>Temizle</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Top */}
              <div className="bg-soft-gray rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                {outfitItems.top ? (
                  <ClothingItem item={outfitItems.top} onRemove={() => removeItem('top')} />
                ) : (
                  <p className="text-gray-400 text-sm">Üst Giyim</p>
                )}
              </div>

              {/* Outerwear */}
              {outfitItems.outerwear && (
                <div className="bg-soft-gray rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                  <ClothingItem item={outfitItems.outerwear} onRemove={() => removeItem('outerwear')} />
                </div>
              )}

              {/* Bottom */}
              <div className="bg-soft-gray rounded-xl p-4 min-h-[120px] flex items-center justify-center">
                {outfitItems.bottom ? (
                  <ClothingItem item={outfitItems.bottom} onRemove={() => removeItem('bottom')} />
                ) : (
                  <p className="text-gray-400 text-sm">Alt Giyim</p>
                )}
              </div>

              {/* Shoes */}
              <div className="bg-soft-gray rounded-xl p-4 min-h-[100px] flex items-center justify-center">
                {outfitItems.shoes ? (
                  <ClothingItem item={outfitItems.shoes} onRemove={() => removeItem('shoes')} />
                ) : (
                  <p className="text-gray-400 text-sm">Ayakkabı</p>
                )}
              </div>

              {/* Accessories */}
              {outfitItems.accessories.length > 0 && (
                <div className="bg-soft-gray rounded-xl p-4">
                  <p className="text-sm text-gray-600 mb-2">Aksesuarlar</p>
                  <div className="flex space-x-2 flex-wrap gap-2">
                    {outfitItems.accessories.map((accessory, index) => (
                      <div key={index} className="relative">
                        <ClothingItem
                          item={accessory}
                          onRemove={() => removeAccessory(index)}
                          size="small"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Clothes Library */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-soft sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h3 className="text-xl font-semibold text-charcoal mb-4">Kıyafetlerim</h3>
            
            {Object.keys(groupedClothes).length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">
                Henüz kıyafet eklenmemiş
              </p>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedClothes).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-sm font-medium text-gray-600 mb-2">{category}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {items.map((item) => (
                        <ClothingItem
                          key={item._id}
                          item={item}
                          draggable
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <ShareOutfitModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        outfitItems={outfitItems}
      />
    </div>
  );
};

export default OutfitCanvas;
