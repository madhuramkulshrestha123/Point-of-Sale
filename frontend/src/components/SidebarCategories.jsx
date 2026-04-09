import React from 'react';

// Category images mapping - using real PNG images
const categories = [
  { id: 'all', name: 'All Products', icon: '/imgs/all_products.svg', useEmoji: false },
  { id: 'engine-oils', name: 'Engine Oils', icon: '/imgs/engine_oil.png', useEmoji: false },
  { id: 'brake-parts', name: 'Brake Parts', icon: '/imgs/brake parts.png', useEmoji: false },
  { id: 'filters', name: 'Filters', icon: '/imgs/filter.png', useEmoji: false },
  { id: 'batteries', name: 'Batteries', icon: '/imgs/battery.png', useEmoji: false },
  { id: 'spark-plugs', name: 'Spark Plugs', icon: '/imgs/spark_plug.png', useEmoji: false },
  { id: 'accessories', name: 'Accessories', icon: '/imgs/acceosories.png', useEmoji: false },
];

const SidebarCategories = ({ selectedCategory, onSelectCategory }) => {
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
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              selectedCategory === category.id
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105'
                : 'bg-gray-50 text-gray-700 hover:bg-accent/30 hover:shadow-sm hover:scale-102'
            }`}
          >
            <span className="w-8 h-8 flex-shrink-0 group-hover:scale-110 transition-transform">
              <img 
                src={category.icon} 
                alt={category.name}
                className="w-full h-full object-contain"
                onError={(e) => {
                  // Fallback to emoji if image fails
                  const emojiMap = {
                    'all': '📦',
                    'engine-oils': '🛢️',
                    'brake-parts': '🔧',
                    'filters': '🌪️',
                    'batteries': '🔋',
                    'spark-plugs': '⚡',
                    'accessories': '✨'
                  };
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = emojiMap[category.id] || '📦';
                }}
              />
            </span>
            <span className="font-semibold text-sm">{category.name}</span>
          </button>
        ))}
      </div>
      
      {/* Footer - Quick Stats */}
      <div className="p-4 border-t border-primary-light/30 bg-gradient-to-br from-accent/20 to-secondary/20">
        <div className="text-xs text-gray-700 space-y-2 font-medium">
          <div className="flex justify-between items-center">
            <span>Total Products:</span>
            <span className="font-bold text-primary-dark bg-white px-2 py-1 rounded-lg shadow-sm">24</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Low Stock:</span>
            <span className="font-bold text-orange-600 bg-accent px-2 py-1 rounded-lg shadow-sm">5</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarCategories;
