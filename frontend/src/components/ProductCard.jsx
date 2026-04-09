import React, { useState } from 'react';

// Category image mapping
const categoryImageMap = {
  'engine-oils': '/imgs/engine_oil.png',
  'brake-parts': '/imgs/brake parts.png',
  'filters': '/imgs/filter.png',
  'batteries': '/imgs/battery.png',
  'spark-plugs': '/imgs/spark_plug.png',
  'accessories': '/imgs/acceosories.png',
};

// Default image for all products
const defaultCategoryImage = '/imgs/all_products.svg';

// Fallback emojis for categories
const categoryEmojis = {
  'all': '📦',
  'engine-oils': '🛢️',
  'brake-parts': '🔧',
  'filters': '🌪️',
  'batteries': '🔋',
  'spark-plugs': '⚡',
  'accessories': '✨',
};

const ProductCard = ({ product, onAddToCart, isFavorite, onToggleFavorite }) => {
  const [addedAnimation, setAddedAnimation] = useState(false);
  const isLowStock = product.stock <= 10;
  
  const handleClick = () => {
    if (product.stock > 0) {
      console.log('ProductCard handleClick - calling onAddToCart with product:', product);
      onAddToCart(product); // Pass the product data
      setAddedAnimation(true);
      setTimeout(() => setAddedAnimation(false), 300);
    }
  };
  
  return (
    <div
      onClick={handleClick}
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-lg 
                 transition-all duration-200 p-3 flex flex-col items-start
                 border border-gray-100 overflow-hidden w-full cursor-pointer h-full
                 ${addedAnimation ? 'border-green-500 scale-105 ring-2 ring-green-200' : product.stock === 0 ? 'opacity-60 cursor-not-allowed border-gray-200' : 'hover:border-green-300'}
                 active:scale-95 group md:rounded-2xl md:p-4`}
    >
      {/* Favorite Star - Top Right */}
      {onToggleFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute top-2 right-2 text-xl hover:scale-110 transition-transform z-20 md:text-lg"
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          {isFavorite ? '⭐' : '☆'}
        </button>
      )}
      
      {/* Product Image/Icon - Centered & Smaller */}
      <div className="w-full h-24 mb-2 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center overflow-hidden rounded-lg md:h-28 md:mb-3 md:rounded-xl">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Try category image first
              const catImage = categoryImageMap[product.category];
              if (catImage) {
                e.target.src = catImage;
                e.target.onerror = () => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<div class="text-3xl md:text-4xl">${categoryEmojis[product.category] || '🔧'}</div>`;
                };
              } else {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div class="text-3xl md:text-4xl">${categoryEmojis[product.category] || '🔧'}</div>`;
              }
            }}
          />
        ) : (
          <img 
            src={categoryImageMap[product.category] || defaultCategoryImage} 
            alt={product.category || 'Product'}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = `<div class="text-3xl md:text-4xl">${categoryEmojis[product.category] || '📦'}</div>`;
            }}
          />
        )}
      </div>
      
      {/* Product Info - Clean Layout */}
      <div className="flex flex-col flex-1 w-full">
        {/* Product Name - 2 lines max */}
        <h3 className="text-xs font-semibold text-gray-800 leading-tight mb-1 line-clamp-2 group-hover:text-green-700 transition-colors min-h-[2.5rem] md:text-sm">
          {product.name}
        </h3>
        
        {/* Brand/SKU - Compact */}
        {product.brand && (
          <p className="text-[10px] text-gray-500 mb-1 truncate md:text-xs">
            {product.brand}
          </p>
        )}
        
        <p className="text-[10px] text-gray-400 font-mono mb-2 truncate md:text-xs">{product.sku}</p>
        
        {/* Price Section - Highlighted */}
        <div className="mt-auto pt-2 border-t border-gray-100">
          <div className="flex items-baseline gap-1 mb-1 md:gap-2">
            <span className="text-base font-bold text-green-600 md:text-lg">₹{(product.price || 0).toLocaleString()}</span>
            {product.mrp && product.mrp !== product.price && (
              <span className="text-[10px] text-gray-400 line-through md:text-xs">₹{product.mrp.toLocaleString()}</span>
            )}
          </div>
          
          {/* Stock Badge - Small Pill */}
          {product.stock > 0 ? (
            <span className={`inline-block text-[10px] px-2 py-1 rounded-full font-medium md:text-xs ${
              product.stock <= 10 
                ? 'bg-orange-100 text-orange-700' 
                : 'bg-green-100 text-green-700'
            }`}>
              {product.stock <= 10 ? `Low: ${product.stock}` : `✓ In Stock`}
            </span>
          ) : (
            <span className="inline-block text-[10px] px-2 py-1 rounded-full font-medium bg-red-100 text-red-700 md:text-xs">
              Out of Stock
            </span>
          )}
        </div>
      </div>
      
      {/* Subtle Hover Indicator */}
      {product.stock > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-xl md:rounded-b-2xl" />
      )}
    </div>
  );
};

export default ProductCard;
