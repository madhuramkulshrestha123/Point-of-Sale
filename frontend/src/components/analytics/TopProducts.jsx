import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

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

const TopProducts = ({ dateRange = 'week' }) => {
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculate date range based on selection
  const getDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    if (dateRange === 'today') {
      startDate = now.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateRange === 'week') {
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(now.getDate() + mondayOffset);
      startOfWeek.setHours(0, 0, 0, 0);
      startDate = startOfWeek.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (dateRange === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      startDate = startOfMonth.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    }

    return { startDate, endDate };
  };

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const { startDate, endDate } = getDateRange();
        
        const response = await axios.get(`${API_URL}/analytics/dashboard`, {
          params: { startDate, endDate },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          const products = response.data.data.topProducts || [];
          
          // Transform products data
          const transformedProducts = products.map((product, index) => ({
            id: product._id,
            rank: index + 1,
            name: product.productName || 'Unknown Product',
            category: product.productDetails?.[0]?.category?.name || 'Uncategorized',
            unitsSold: product.totalQuantity,
            revenue: product.totalRevenue,
            image: product.productDetails?.[0]?.image || null,
          }));

          setTopProducts(transformedProducts);
        }
      } catch (error) {
        console.error('Error fetching top products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading products...</p>
        </div>
      </div>
    );
  }

  if (topProducts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
            <p className="text-sm text-gray-500 mt-1">Best performers this period</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">No products data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-primary-light/30 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Top Selling Products</h3>
          <p className="text-sm text-gray-500 mt-1">Best performers this period</p>
        </div>
        <button className="text-xs text-primary font-semibold hover:text-primary-dark transition-colors">
          View All →
        </button>
      </div>

      <div className="space-y-4">
        {topProducts.map((product) => (
          <div 
            key={product.id}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/10 transition-colors group"
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm">
              {product.rank}
            </div>

            {/* Product Image */}
            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-primary-light/20 to-secondary/20 overflow-hidden flex items-center justify-center">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Try category image first
                    const catImage = categoryImageMap[product.category?.toLowerCase()];
                    if (catImage) {
                      e.target.src = catImage;
                      e.target.onerror = () => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `<span class="text-2xl">${categoryEmojis[product.category?.toLowerCase()] || '🔧'}</span>`;
                      };
                    } else {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `<span class="text-2xl">${categoryEmojis[product.category?.toLowerCase()] || '🔧'}</span>`;
                    }
                  }}
                />
              ) : (
                <img 
                  src={categoryImageMap[product.category?.toLowerCase()] || defaultCategoryImage} 
                  alt={product.category || 'Product'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<span class="text-2xl">${categoryEmojis[product.category?.toLowerCase()] || '📦'}</span>`;
                  }}
                />
              )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{product.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
            </div>

            {/* Stats */}
            <div className="text-right">
              <p className="text-sm font-bold text-price">₹{product.revenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-0.5">{product.unitsSold} sold</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopProducts;
