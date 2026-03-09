import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const categories = ['Üst Giyim', 'Alt Giyim', 'Ayakkabı', 'Dış Giyim', 'Aksesuar'];
const colors = ['Siyah', 'Beyaz', 'Gri', 'Mavi', 'Kırmızı', 'Yeşil', 'Sarı', 'Kahverengi', 'Pembe', 'Turuncu', 'Mor', 'Bej'];

const AddItem = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [category, setCategory] = useState('Üst Giyim');
  const [color, setColor] = useState('');
  const [thickness, setThickness] = useState(3);
  const [waterproof, setWaterproof] = useState(false);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      alert('Lütfen bir resim dosyası seçin');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Lütfen bir resim seçin');
      return;
    }

    if (!color) {
      alert('Lütfen bir renk seçin');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      formData.append('color', color);
      formData.append('thickness', thickness.toString());
      formData.append('waterproof', waterproof.toString());
      if (tags) {
        formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim())));
      }

      const response = await axiosInstance.post(`/clothes`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('Kıyafet başarıyla eklendi!');
        navigate('/closet');
      }
    } catch (error) {
      console.error('Error adding clothing:', error);
      alert('Kıyafet eklenirken bir hata oluştu: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-8 shadow-soft"
      >
        <h2 className="text-3xl font-bold text-charcoal mb-6">Yeni Kıyafet Ekle</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Kıyafet Fotoğrafı
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-charcoal bg-soft-gray'
                  : 'border-gray-300 hover:border-charcoal'
              }`}
            >
              {preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-600 mb-2">
                    Fotoğrafı buraya sürükleyin veya tıklayın
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-charcoal text-white px-6 py-2 rounded-xl cursor-pointer hover:bg-opacity-90 transition-all duration-200"
                  >
                    Dosya Seç
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Renk
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {colors.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setColor(col)}
                  className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 ${
                    color === col
                      ? 'border-charcoal bg-charcoal text-white'
                      : 'border-gray-200 text-charcoal hover:border-charcoal'
                  }`}
                >
                  {col}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Veya özel renk girin"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full mt-2 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal"
            />
          </div>

          {/* Thickness */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Kalınlık: {thickness}/5
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={thickness}
              onChange={(e) => setThickness(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>İnce</span>
              <span>Kalın</span>
            </div>
          </div>

          {/* Waterproof */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="waterproof"
              checked={waterproof}
              onChange={(e) => setWaterproof(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-charcoal focus:ring-charcoal"
            />
            <label htmlFor="waterproof" className="text-sm font-medium text-charcoal">
              Su Geçirmez
            </label>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Etiketler (virgülle ayırın)
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Örn: kış, günlük, resmi"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-charcoal"
            />
          </div>

          {/* Submit Button */}
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-charcoal text-white px-6 py-3 rounded-xl hover:bg-opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  <span>Yükleniyor...</span>
                </>
              ) : (
                <span>Kıyafeti Ekle</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/closet')}
              className="px-6 py-3 border border-gray-200 rounded-xl text-charcoal hover:bg-soft-gray transition-all duration-200"
            >
              İptal
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AddItem;
