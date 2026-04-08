import React from 'react';

const FavoritesBar = ({ favorites, products, onAddToCart }) => {
  const favoriteProducts = products.filter(p => favorites.includes(p._id));
  
  if (favoriteProducts.length === 0) {
    return (
      <div className="bg-gradient-to-r from-accent/20 to-secondary/20 border-b border-primary-light/30 px-4 py-2.5">
        <p className="text-xs text-gray-600 text-center font-medium">
          ⭐ Click the star icon on products to add them here for quick access
        </p>
      </div>
    );
  }
  
  return (
    <div className="bg-gradient-to-r from-accent/30 via-secondary/20 to-primary-light/20 border-b border-primary-light/30 px-4 py-3 shadow-inner">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="text-sm font-bold text-gray-700 whitespace-nowrap flex items-center gap-1">
          <span className="text-lg">⭐</span> Quick Access:
        </span>
        {favoriteProducts.map(product => {
          const createProductData = () => ({
            id: product._id,
            name: product.name,
            price: product.sellingPrice || 0,
            mrp: product.mrp || 0,
            sku: product.sku || '',
            category: product.category || '',
            brand: product.brand || '',
            stock: product.stockQuantity || 0,
            image: product.image || '',
            gstRate: product.gstRate || 18, // Include GST rate
          });
          
          return (
            <button
              key={product._id}
              onClick={() => {
                const data = createProductData();
                console.log('Favorites - Adding to cart:', data.name, 'Price:', data.price);
                onAddToCart(data);
              }}
              className="flex-shrink-0 bg-white border-2 border-primary rounded-xl px-3 py-2 hover:shadow-md transition-all active:scale-95 flex items-center gap-2 group hover:border-primary-dark"
              title={product.name}
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-gradient-to-br from-primary-light/20 to-secondary/20 flex items-center justify-center">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => e.target.parentElement.innerHTML = '🔧'}
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-gray-800 truncate max-w-[120px] group-hover:text-primary-dark transition-colors">
                  {product.name}
                </p>
                <p className="text-xs text-price font-extrabold">₹{createProductData().price}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesBar;
