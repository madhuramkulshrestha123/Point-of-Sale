import axios from 'axios';
import {
  cacheProducts,
  getCachedProducts,
  cacheCustomers,
  getCachedCustomers,
  cacheCategories,
  getCachedCategories,
  isOnline,
} from '../utils/offlineCache';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * Fetch products with offline support
 * @returns {Promise<Array>}
 */
export const fetchProducts = async () => {
  if (isOnline()) {
    try {
      const response = await api.get('/products');
      cacheProducts(response.data);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch products from network, using cache:', error);
    }
  }
  
  // Fallback to cache
  const cached = getCachedProducts();
  if (cached) {
    return cached;
  }
  
  throw new Error('No products data available. Please connect to the internet.');
};

/**
 * Fetch customers with offline support
 * @returns {Promise<Array>}
 */
export const fetchCustomers = async () => {
  if (isOnline()) {
    try {
      const response = await api.get('/customers');
      cacheCustomers(response.data);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch customers from network, using cache:', error);
    }
  }
  
  // Fallback to cache
  const cached = getCachedCustomers();
  if (cached) {
    return cached;
  }
  
  throw new Error('No customers data available. Please connect to the internet.');
};

/**
 * Fetch categories with offline support
 * @returns {Promise<Array>}
 */
export const fetchCategories = async () => {
  if (isOnline()) {
    try {
      const response = await api.get('/categories');
      cacheCategories(response.data);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch categories from network, using cache:', error);
    }
  }
  
  // Fallback to cache
  const cached = getCachedCategories();
  if (cached) {
    return cached;
  }
  
  throw new Error('No categories data available. Please connect to the internet.');
};

/**
 * Create a sale (requires online)
 * @param {Object} saleData 
 * @returns {Promise<Object>}
 */
export const createSale = async (saleData) => {
  if (!isOnline()) {
    throw new Error('Cannot create sales while offline. Please connect to the internet.');
  }
  
  try {
    const response = await api.post('/sales', saleData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Generic GET request with caching
 * @param {string} endpoint 
 * @param {string} cacheKey 
 * @returns {Promise<any>}
 */
export const apiGet = async (endpoint, cacheKey) => {
  if (isOnline()) {
    try {
      const response = await api.get(endpoint);
      if (cacheKey) {
        localStorage.setItem(cacheKey, JSON.stringify({
          data: response.data,
          timestamp: Date.now(),
        }));
      }
      return response.data;
    } catch (error) {
      console.warn(`Failed to fetch ${endpoint} from network, using cache:`, error);
    }
  }
  
  // Fallback to cache
  if (cacheKey) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const { data } = JSON.parse(cached);
      return data;
    }
  }
  
  throw new Error(`No data available for ${endpoint}. Please connect to the internet.`);
};

/**
 * POST request (requires online)
 * @param {string} endpoint 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const apiPost = async (endpoint, data) => {
  if (!isOnline()) {
    throw new Error('Cannot make POST requests while offline. Please connect to the internet.');
  }
  
  try {
    const response = await api.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * PUT request (requires online)
 * @param {string} endpoint 
 * @param {Object} data 
 * @returns {Promise<Object>}
 */
export const apiPut = async (endpoint, data) => {
  if (!isOnline()) {
    throw new Error('Cannot make PUT requests while offline. Please connect to the internet.');
  }
  
  try {
    const response = await api.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * DELETE request (requires online)
 * @param {string} endpoint 
 * @returns {Promise<Object>}
 */
export const apiDelete = async (endpoint) => {
  if (!isOnline()) {
    throw new Error('Cannot make DELETE requests while offline. Please connect to the internet.');
  }
  
  try {
    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
