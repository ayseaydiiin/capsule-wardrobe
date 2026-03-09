import React from 'react';
import { useDrag } from 'react-dnd';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const ClothingItem = ({ item, onRemove, draggable = false, size = 'normal' }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'clothing',
    item: item,
    canDrag: draggable,
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const sizeClasses = {
    small: 'w-16 h-16',
    normal: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  if (!item || !item.imageURL) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-200 rounded-xl flex items-center justify-center`}>
        <span className="text-gray-400 text-xs">Resim yok</span>
      </div>
    );
  }

  return (
    <motion.div
      ref={draggable ? drag : null}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: isDragging ? 0.5 : 1, 
        scale: isDragging ? 0.9 : 1 
      }}
      className={`relative ${sizeClasses[size]} ${draggable ? 'cursor-move' : ''} ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <img
        src={item.imageURL.startsWith('http') ? item.imageURL : `${API_BASE_URL.replace('/api', '')}${item.imageURL}`}
        alt={item.category}
        className={`w-full h-full object-contain rounded-xl bg-white p-2 shadow-soft ${
          draggable ? 'hover:shadow-lg transition-shadow duration-200' : ''
        }`}
      />
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors duration-200"
        >
          <X size={14} />
        </button>
      )}
    </motion.div>
  );
};

export default ClothingItem;
