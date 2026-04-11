import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Fallback emoji mapping for predefined categories
const CATEGORY_EMOJIS = {
  'Engine Oil': '🛢️',
  'Filters': '🔧',
  'Brakes': '🔴',
  'Battery': '🔋',
  'Tires': '⚫',
  'Accessories': '🔩',
};

const CATEGORY_COLORS = {
  'Engine Oil': 'from-blue-400 to-blue-600',
  'Filters': 'from-green-400 to-green-600',
  'Brakes': 'from-red-400 to-red-600',
  'Battery': 'from-yellow-400 to-yellow-600',
  'Tires': 'from-gray-600 to-gray-800',
  'Accessories': 'from-purple-400 to-purple-600',
};

const SidebarCategories = ({ selectedCategory, onSelectCategory, totalProducts }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const getEmojiForCategory = (category) => {
    return CATEGORY_EMOJIS[category] || '📦';
  };

  const getColorForCategory = (category) => {
    return CATEGORY_COLORS[category] || 'from-gray-400 to-gray-600';
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-primary-light/30">
      {/* Header */}
      <div className="p-5 border-b border-primary-light/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-2xl">📂</span>
          Categories
        </h2>
      </div>
      
      {/* Category List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {/* All Products Button */}
            <button
              onClick={() => onSelectCategory('all')}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105'
                  : 'bg-gray-50 text-gray-700 hover:bg-accent/30 hover:shadow-sm hover:scale-102'
              }`}
            >
              <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">📦</span>
              <span className="font-semibold text-sm">All Products</span>
            </button>

            {/* Category Buttons */}
            {categories.map((category) => (
              <button
                key={category._id}
                onClick={() => onSelectCategory(category.name)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
                  selectedCategory === category.name
                    ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105'
                    : 'bg-gray-50 text-gray-700 hover:bg-accent/30 hover:shadow-sm hover:scale-102'
                }`}
              >
                <span className="w-8 h-8 flex-shrink-0 group-hover:scale-110 transition-transform">
                  {category.image && category.image.startsWith('http') ? (
                    <img 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <div className={`w-full h-full rounded-md bg-gradient-to-br ${getColorForCategory(category.image)} flex items-center justify-center`}>
                      <span className="text-lg">{getEmojiForCategory(category.image)}</span>
                    </div>
                  )}
                </span>
                <span className="font-semibold text-sm truncate">{category.name}</span>
              </button>
            ))}
          </>
        )}
      </div>
      
      {/* Footer - Quick Stats */}
      <div className="p-4 border-t border-primary-light/30 bg-gradient-to-br from-accent/20 to-secondary/20">
        <div className="text-xs text-gray-700 space-y-2 font-medium">
          <div className="flex justify-between items-center">
            <span>Total Categories:</span>
            <span className="font-bold text-primary-dark bg-white px-2 py-1 rounded-lg shadow-sm">
              {categories.length}
            </span>
          </div>
          {totalProducts !== undefined && (
            <div className="flex justify-between items-center">
              <span>Total Products:</span>
              <span className="font-bold text-green-600 bg-white px-2 py-1 rounded-lg shadow-sm">
                {totalProducts}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarCategories;
