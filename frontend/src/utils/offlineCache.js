// Offline cache management utility

const CACHE_KEYS = {
  PRODUCTS: 'pos_products_cache',
  CUSTOMERS: 'pos_customers_cache',
  CATEGORIES: 'pos_categories_cache',
  CART: 'pos_cart_cache',
  SETTINGS: 'pos_settings_cache',
};

const CACHE_DURATION = {
  PRODUCTS: 60 * 60 * 1000, // 1 hour
  CUSTOMERS: 60 * 60 * 1000, // 1 hour
  CATEGORIES: 60 * 60 * 1000, // 1 hour
  CART: 24 * 60 * 60 * 1000, // 24 hours
  SETTINGS: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Cache data in localStorage with timestamp
 */
export const cacheData = (key, data) => {
  try {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(cacheEntry));
    return true;
  } catch (error) {
    console.error('Failed to cache data:', error);
    return false;
  }
};

/**
 * Get cached data from localStorage
 * @param {string} key - Cache key
 * @param {number} maxAge - Maximum age in milliseconds (optional)
 * @returns {any|null} - Cached data or null if expired/not found
 */
export const getCachedData = (key, maxAge = null) => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    
    // Check if cache is expired
    if (maxAge && (Date.now() - timestamp) > maxAge) {
      localStorage.removeItem(key);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to get cached data:', error);
    return null;
  }
};

/**
 * Clear specific cache
 */
export const clearCache = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Failed to clear cache:', error);
    return false;
  }
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  try {
    Object.values(CACHE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.error('Failed to clear all caches:', error);
    return false;
  }
};

/**
 * Cache products data
 */
export const cacheProducts = (products) => {
  return cacheData(CACHE_KEYS.PRODUCTS, products);
};

/**
 * Get cached products
 */
export const getCachedProducts = () => {
  return getCachedData(CACHE_KEYS.PRODUCTS, CACHE_DURATION.PRODUCTS);
};

/**
 * Cache customers data
 */
export const cacheCustomers = (customers) => {
  return cacheData(CACHE_KEYS.CUSTOMERS, customers);
};

/**
 * Get cached customers
 */
export const getCachedCustomers = () => {
  return getCachedData(CACHE_KEYS.CUSTOMERS, CACHE_DURATION.CUSTOMERS);
};

/**
 * Cache categories data
 */
export const cacheCategories = (categories) => {
  return cacheData(CACHE_KEYS.CATEGORIES, categories);
};

/**
 * Get cached categories
 */
export const getCachedCategories = () => {
  return getCachedData(CACHE_KEYS.CATEGORIES, CACHE_DURATION.CATEGORIES);
};

/**
 * Cache cart data
 */
export const cacheCart = (cart) => {
  return cacheData(CACHE_KEYS.CART, cart);
};

/**
 * Get cached cart
 */
export const getCachedCart = () => {
  return getCachedData(CACHE_KEYS.CART, CACHE_DURATION.CART);
};

/**
 * Check if online
 */
export const isOnline = () => {
  return navigator.onLine;
};

/**
 * Get network status
 */
export const getNetworkStatus = () => {
  return {
    isOnline: isOnline(),
    connection: navigator.connection?.effectiveType || 'unknown',
  };
};

/**
 * Setup network status listeners
 */
export const setupNetworkListeners = (callback) => {
  const updateStatus = () => {
    callback({
      isOnline: navigator.onLine,
      connection: navigator.connection?.effectiveType || 'unknown',
    });
  };

  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);

  // Initial status
  updateStatus();

  // Return cleanup function
  return () => {
    window.removeEventListener('online', updateStatus);
    window.removeEventListener('offline', updateStatus);
  };
};

export { CACHE_KEYS };
