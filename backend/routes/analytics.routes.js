const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getRevenueChartData,
  getCategoryBreakdown,
  getSalesSummary,
  getTopProducts,
  getProfitAnalysis,
  getRevenueTrend,
} = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/revenue-chart', protect, getRevenueChartData);
router.get('/revenue-trend', protect, getRevenueTrend);
router.get('/category-breakdown', protect, getCategoryBreakdown);
router.get('/sales-summary', protect, getSalesSummary);
router.get('/top-products', protect, getTopProducts);
router.get('/profit-analysis', protect, getProfitAnalysis);

module.exports = router;
