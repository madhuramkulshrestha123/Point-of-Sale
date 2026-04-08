const Sale = require('../models/Sale.model');
const Product = require('../models/Product.model');
const Inventory = require('../models/Inventory.model');
const Batch = require('../models/Batch.model');

// @desc    Get sales summary for dashboard (today, month, pending)
// @route   GET /api/analytics/sales-summary
// @access  Private
exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    console.log('=== Sales Summary Request ===');
    console.log('Query params:', { startDate, endDate });
    
    // Build date filter
    let dateFilter = {};
    
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      dateFilter.$gte = start;
      console.log('Start date:', start);
    }
    
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.$lte = end;
      console.log('End date:', end);
    }
    
    // Build base query with date filter
    let baseQuery = {};
    if (Object.keys(dateFilter).length > 0) {
      baseQuery.createdAt = dateFilter;
    }
    
    console.log('Base query:', JSON.stringify(baseQuery, null, 2));
    
    // Today's orders count (filtered by date range)
    const todayOrders = await Sale.countDocuments(baseQuery);
    
    console.log('Today orders (filtered):', todayOrders);
    
    // Today's sales amount (filtered by date range)
    const todaySales = await Sale.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalAmount' },
        },
      },
    ]);
    
    console.log('Today sales (filtered):', todaySales.length > 0 ? todaySales[0].total : 0);
    
    // Month sales (filtered by date range if provided)
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    
    let monthQuery = { createdAt: { $gte: monthStart } };
    // If custom date range is provided, use it instead of month
    if (Object.keys(dateFilter).length > 0) {
      monthQuery = { createdAt: dateFilter };
      console.log('Using custom date range for month sales:', JSON.stringify(monthQuery, null, 2));
    }
    
    const monthSales = await Sale.aggregate([
      { $match: monthQuery },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalAmount' },
        },
      },
    ]);
    
    console.log('Month sales:', monthSales.length > 0 ? monthSales[0].total : 0);
    
    // Pending bills count (filtered by date range if provided, otherwise shows all pending)
    let pendingQuery = {
      paymentStatus: { $in: ['pending', 'partial'] },
    };
    // If custom date range is provided, filter pending bills by that range
    if (Object.keys(dateFilter).length > 0) {
      pendingQuery.createdAt = dateFilter;
      console.log('Using custom date range for pending bills:', JSON.stringify(pendingQuery, null, 2));
    }
    const totalPending = await Sale.countDocuments(pendingQuery);
    
    console.log('Total pending (filtered):', totalPending);
    console.log('===========================\n');
    
    res.status(200).json({
      success: true,
      data: {
        todayOrders,
        todaySales: todaySales.length > 0 ? todaySales[0].total : 0,
        monthSales: monthSales.length > 0 ? monthSales[0].total : 0,
        totalPending,
      },
    });
  } catch (error) {
    console.error('Get sales summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales summary',
      error: error.message,
    });
  }
};

// @desc    Get comprehensive analytics
// @route   GET /api/analytics/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res) => {
  try {
    const { store, startDate, endDate } = req.query;

    console.log('=== Dashboard Analytics Request ===');
    console.log('Query params:', { store, startDate, endDate });

    let query = {};

    if (store) query.store = store;
    
    // Handle date filtering more robustly
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
        console.log('Start date:', start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
        console.log('End date:', end);
      }
    }
    
    console.log('Final query:', JSON.stringify(query, null, 2));

    // Sales Analytics - Total Revenue = sum(finalAmount)
    const salesAnalytics = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$finalAmount' },
          totalDiscount: { $sum: '$discount' },
          totalTax: { $sum: '$tax' },
        },
      },
    ]);

    // Profit Calculation: Profit = Σ((sellingPrice - costPrice) × quantity)
    const profitData = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalProfit: {
            $sum: {
              $multiply: [
                { $subtract: ['$items.sellingPrice', '$items.costPrice'] },
                '$items.quantity'
              ]
            }
          },
        },
      },
    ]);

    const totalProfit = profitData.length > 0 ? profitData[0].totalProfit : 0;
    const totalRevenue = salesAnalytics.length > 0 ? salesAnalytics[0].totalRevenue : 0;
    const totalSales = salesAnalytics.length > 0 ? salesAnalytics[0].totalSales : 0;
    
    // Profit Margin = (Total Profit / Total Revenue) × 100
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0;
    
    // Avg Order Value = revenue / total sales
    const avgOrderValue = totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : 0;

    // Total Customers = unique customers from sales (using Set logic)
    const salesWithCustomers = await Sale.find(query).distinct('customer');
    const totalCustomers = salesWithCustomers.filter(c => c !== null).length;

    // Inventory Analytics
    const inventoryStats = await Inventory.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$totalQuantity' },
          lowStockCount: {
            $sum: {
              $cond: [{ $lt: ['$totalQuantity', '$lowStockThreshold'] }, 1, 0],
            },
          },
        },
      },
    ]);

    // Expiring Batches
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const expiringBatches = await Batch.countDocuments({
      expiryDate: { $lte: expiryDate, $gte: new Date() },
      isActive: true,
    });

    // Top Products by Revenue
    const topProducts = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalSales,
        avgOrderValue: parseFloat(avgOrderValue),
        profitMargin: parseFloat(profitMargin),
        totalProfit,
        totalCustomers,
        totalDiscount: salesAnalytics[0]?.totalDiscount || 0,
        totalTax: salesAnalytics[0]?.totalTax || 0,
        inventory: inventoryStats[0] || {
          totalProducts: 0,
          totalQuantity: 0,
          lowStockCount: 0,
        },
        alerts: {
          expiringBatches,
          lowStockItems: inventoryStats[0]?.lowStockCount || 0,
        },
        topProducts,
      },
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message,
    });
  }
};

// @desc    Get revenue chart data
// @route   GET /api/analytics/revenue-chart
// @access  Private
exports.getRevenueChartData = async (req, res) => {
  try {
    const { store, period = 'daily' } = req.query;

    let query = {};
    if (store) query.store = store;

    let groupBy;
    let sortQuery;
    let dateRange;
    
    if (period === 'today') {
      // Group by hour for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: today };
      
      groupBy = {
        hour: { $hour: '$createdAt' },
      };
      sortQuery = { '_id.hour': 1 };
    } else if (period === 'week') {
      // Last 7 days - group by day
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: sevenDaysAgo };
      
      groupBy = {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      };
      sortQuery = { '_id.date': 1 };
    } else {
      // Last 30 days - group by day
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      query.createdAt = { $gte: thirtyDaysAgo };
      
      groupBy = {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
      };
      sortQuery = { '_id.date': 1 };
    }

    const revenueData = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: sortQuery },
    ]);

    console.log(`Revenue chart data for ${period}:`, revenueData.length, 'records');

    res.status(200).json({
      success: true,
      data: { revenueData },
    });
  } catch (error) {
    console.error('Get revenue chart data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue chart data',
      error: error.message,
    });
  }
};

// @desc    Get category breakdown
// @route   GET /api/analytics/category-breakdown
// @access  Private
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const { store, startDate, endDate } = req.query;

    console.log('=== Category Breakdown Request ===');
    console.log('Query params:', { store, startDate, endDate });

    let query = {};
    if (store) query.store = store;
    
    // Handle date filtering with proper time boundaries
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
        console.log('Start date:', start);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
        console.log('End date:', end);
      }
    }
    
    console.log('Category query:', JSON.stringify(query, null, 2));

    // First, get all products and create a category map
    const allProducts = await Product.find({}, { _id: 1, category: 1 });
    const productCategoryMap = {};
    allProducts.forEach(product => {
      productCategoryMap[product._id.toString()] = product.category || 'Uncategorized';
    });

    // Get sales data
    const sales = await Sale.find(query).populate('items.product', 'category');
    
    // Build category breakdown
    const categoryMap = {};
    
    sales.forEach(sale => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach(item => {
          let category = 'Uncategorized';
          
          // Try to get category from populated product
          if (item.product && item.product.category) {
            category = item.product.category;
          }
          // Fallback to using the product ID to look up category
          else if (item.product) {
            const productId = item.product.toString();
            if (productCategoryMap[productId]) {
              category = productCategoryMap[productId];
            }
          }
          
          if (!categoryMap[category]) {
            categoryMap[category] = {
              _id: category,
              revenue: 0,
              quantity: 0
            };
          }
          
          categoryMap[category].revenue += (item.subtotal || 0);
          categoryMap[category].quantity += (item.quantity || 0);
        });
      }
    });

    // Convert to array and sort by revenue
    const categoryData = Object.values(categoryMap).sort((a, b) => b.revenue - a.revenue);

    console.log('Category breakdown result:', categoryData);

    res.status(200).json({
      success: true,
      data: { categoryData },
    });
  } catch (error) {
    console.error('Get category breakdown error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category breakdown',
      error: error.message,
    });
  }
};

// @desc    Get top selling products
// @route   GET /api/analytics/top-products
// @access  Private
exports.getTopProducts = async (req, res) => {
  try {
    const { store, startDate, endDate, limit = 10 } = req.query;

    let query = {};
    if (store) query.store = store;
    
    // Handle date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const topProducts = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          category: { $first: '$items.category' },
          totalQuantitySold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
          totalCost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: 1,
          category: 1,
          unitsSold: '$totalQuantitySold',
          revenue: '$totalRevenue',
          cost: '$totalCost',
          profit: { $subtract: ['$totalRevenue', '$totalCost'] },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: topProducts,
    });
  } catch (error) {
    console.error('Get top products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top products',
      error: error.message,
    });
  }
};

// @desc    Get profit analysis
// @route   GET /api/analytics/profit-analysis
// @access  Private
exports.getProfitAnalysis = async (req, res) => {
  try {
    const { store, startDate, endDate } = req.query;

    let query = {};
    if (store) query.store = store;
    
    // Handle date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const profitData = await Sale.aggregate([
      { $match: query },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$items.subtotal' },
          totalCost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
          totalQuantity: { $sum: '$items.quantity' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRevenue: 1,
          totalCost: 1,
          netProfit: { $subtract: ['$totalRevenue', '$totalCost'] },
          profitMargin: {
            $cond: {
              if: { $gt: ['$totalRevenue', 0] },
              then: {
                $multiply: [
                  { $divide: [{ $subtract: ['$totalRevenue', '$totalCost'] }, '$totalRevenue'] },
                  100
                ]
              },
              else: 0
            }
          },
          avgOrderValue: {
            $cond: {
              if: { $gt: ['$totalQuantity', 0] },
              then: { $divide: ['$totalRevenue', '$totalQuantity'] },
              else: 0
            }
          },
        },
      },
    ]);

    const result = profitData.length > 0 ? profitData[0] : {
      totalRevenue: 0,
      totalCost: 0,
      netProfit: 0,
      profitMargin: 0,
      avgOrderValue: 0,
    };

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Get profit analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profit analysis',
      error: error.message,
    });
  }
};

// @desc    Get revenue trend data (for charts)
// @route   GET /api/analytics/revenue-trend
// @access  Private
exports.getRevenueTrend = async (req, res) => {
  try {
    const { store, startDate, endDate } = req.query;

    let query = {};
    if (store) query.store = store;
    
    // Handle date filtering
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Determine grouping based on date range
    const dateFilter = query.createdAt || {};
    const isSingleDay = dateFilter.$gte && dateFilter.$lte && 
      (new Date(dateFilter.$lte) - new Date(dateFilter.$gte)) < 86400000;

    let groupBy;
    if (isSingleDay) {
      groupBy = { hour: { $hour: '$createdAt' } };
    } else {
      groupBy = { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } };
    }

    const trendData = await Sale.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$finalAmount' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: trendData,
    });
  } catch (error) {
    console.error('Get revenue trend error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue trend',
      error: error.message,
    });
  }
};
