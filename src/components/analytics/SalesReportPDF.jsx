import React, { useRef, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const SalesReportPDF = ({ dateRange, analyticsData }) => {
  const pdfRef = useRef(null);
  const [businessInfo, setBusinessInfo] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [profitData, setProfitData] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Fetch additional data for PDF
  useEffect(() => {
    const fetchPDFData = async () => {
      if (!analyticsData) return;

      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');

      // Set business info from user profile
      setBusinessInfo({
        name: (user.businessName || 'POINT OF SALE SYSTEM').toUpperCase(),
        address: user.address ? 
          (typeof user.address === 'string' ? user.address : 
          `${user.address.street || ''}${user.address.city ? ', ' + user.address.city : ''}${user.address.state ? ', ' + user.address.state : ''} ${user.address.zipCode || ''}`.trim()) : '',
        gst: user.gstNumber || '',
        phone: user.phone || '',
        email: user.email || '',
      });

      try {
        // Fetch category breakdown
        const categoryResponse = await axios.get(`${API_URL}/analytics/category-breakdown`, {
          params: { dateRange },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (categoryResponse.data.success) {
          setCategoryData(categoryResponse.data.data || []);
        }

        // Fetch top products
        const productsResponse = await axios.get(`${API_URL}/analytics/top-products`, {
          params: { dateRange, limit: 10 },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (productsResponse.data.success) {
          setTopProducts(productsResponse.data.data || []);
        }

        // Fetch revenue trend data
        const revenueResponse = await axios.get(`${API_URL}/analytics/revenue-trend`, {
          params: { dateRange },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (revenueResponse.data.success) {
          setRevenueChartData(revenueResponse.data.data || []);
        }

        // Fetch profit analysis
        const profitResponse = await axios.get(`${API_URL}/analytics/profit-analysis`, {
          params: { dateRange },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (profitResponse.data.success) {
          setProfitData(profitResponse.data.data || {});
        }
      } catch (error) {
        console.error('Error fetching PDF data:', error);
      }
    };

    fetchPDFData();
  }, [dateRange, analyticsData]);

  // Format date range for display
  const formatDateRange = () => {
    const now = new Date();
    let startDate, endDate;

    if (dateRange === 'today') {
      startDate = now;
      endDate = now;
    } else if (dateRange === 'week') {
      const startOfWeek = new Date(now);
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(now.getDate() + mondayOffset);
      startDate = startOfWeek;
      endDate = now;
    } else if (dateRange === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = now;
    }

    const formatDate = (date) => {
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return {
      from: formatDate(startDate),
      to: formatDate(endDate),
    };
  };

  // Generate PDF
  const generatePDF = async () => {
    if (!pdfRef.current) return;

    setGenerating(true);

    try {
      const element = pdfRef.current;
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `sales-report-${dateStr}.pdf`;

      const opt = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          scrollY: 0,
          windowWidth: 800,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      };

      await html2pdf().from(element).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (!analyticsData) return null;

  const dates = formatDateRange();

  return (
    <>
      {/* Export Button */}
      <button
        onClick={generatePDF}
        disabled={generating}
        className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all items-center gap-2 disabled:opacity-50"
      >
        {generating ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </>
        )}
      </button>

      {/* Hidden PDF Template */}
      <div className="hidden">
        <div ref={pdfRef} className="pdf-template">
          {/* Page 1: Header & KPIs */}
          <div className="pdf-page">
            {/* Business Header */}
            <div className="pdf-header">
              <h1 className="business-name">{businessInfo?.name || 'POINT OF SALE SYSTEM'}</h1>
              {businessInfo?.address && <p className="info-text">{businessInfo.address}</p>}
              {businessInfo?.gst && <p className="info-text">GST: {businessInfo.gst}</p>}
              {(businessInfo?.phone || businessInfo?.email) && (
                <p className="info-text">
                  {businessInfo.phone} {businessInfo.email && `| ${businessInfo.email}`}
                </p>
              )}
              <div className="divider"></div>
            </div>

            {/* Report Info */}
            <div className="report-info">
              <div className="report-title">
                <h2>Sales Analytics Report</h2>
              </div>
              <div className="date-range">
                <p><strong>From:</strong> {dates.from}</p>
                <p><strong>To:</strong> {dates.to}</p>
              </div>
            </div>

            {/* KPI Summary */}
            <div className="kpi-section">
              <div className="kpi-grid">
                <div className="kpi-card">
                  <h4>Total Revenue</h4>
                  <p className="kpi-value">₹{(analyticsData.totalRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="kpi-card">
                  <h4>Total Sales</h4>
                  <p className="kpi-value">{analyticsData.totalSales || 0}</p>
                </div>
                <div className="kpi-card">
                  <h4>Avg Order Value</h4>
                  <p className="kpi-value">₹{(analyticsData.avgOrderValue || 0).toLocaleString()}</p>
                </div>
                <div className="kpi-card">
                  <h4>Profit Margin</h4>
                  <p className="kpi-value">{(analyticsData.profitMargin || 0).toFixed(1)}%</p>
                </div>
                <div className="kpi-card">
                  <h4>Total Customers</h4>
                  <p className="kpi-value">{analyticsData.totalCustomers || 0}</p>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            {categoryData.length > 0 && (
              <div className="section">
                <h3 className="section-title">Sales by Category</h3>
                <div className="category-list">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="category-item">
                      <span className="category-name">{cat.categoryName || cat._id}</span>
                      <span className="category-value">₹{(cat.revenue || 0).toLocaleString()}</span>
                      <span className="category-percent">{(cat.percentage || 0).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pdf-footer">
              <p>Generated on: {new Date().toLocaleString('en-IN')}</p>
              <p>Generated by POS System</p>
            </div>
          </div>

          {/* Page 2: Top Products & Profit Analysis */}
          <div className="pdf-page">
            {topProducts.length > 0 && (
              <div className="section">
                <h3 className="section-title">Top Selling Products</h3>
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((product, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{product.productName || product.name}</td>
                        <td>{product.category || 'N/A'}</td>
                        <td className="text-center">{product.quantitySold || product.unitsSold || 0}</td>
                        <td>₹{(product.revenue || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {profitData && (
              <div className="section">
                <h3 className="section-title">Profit Analysis</h3>
                <div className="profit-details">
                  <div className="profit-item">
                    <span className="profit-label">Total Revenue</span>
                    <span className="profit-value">₹{(profitData.totalRevenue || analyticsData.totalRevenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="profit-item">
                    <span className="profit-label">Total Cost</span>
                    <span className="profit-value">₹{(profitData.totalCost || 0).toLocaleString()}</span>
                  </div>
                  <div className="profit-item highlight">
                    <span className="profit-label">Net Profit</span>
                    <span className="profit-value">₹{(profitData.netProfit || 0).toLocaleString()}</span>
                  </div>
                  <div className="profit-item">
                    <span className="profit-label">Profit Margin</span>
                    <span className="profit-value">{(profitData.profitMargin || analyticsData.profitMargin || 0).toFixed(2)}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pdf-footer">
              <p>Generated on: {new Date().toLocaleString('en-IN')}</p>
              <p>Generated by POS System</p>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Styles */}
      <style>{`
        .pdf-template {
          font-family: 'Arial', 'Helvetica', sans-serif;
          color: #000;
          background: white;
        }

        .pdf-page {
          padding: 20px 15px;
          background: white;
          page-break-after: always;
        }

        .pdf-page:last-child {
          page-break-after: avoid;
        }

        .pdf-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .business-name {
          font-size: 22px;
          font-weight: bold;
          text-transform: uppercase;
          margin: 0 0 8px 0;
          color: #000;
          letter-spacing: 1px;
        }

        .info-text {
          font-size: 11px;
          color: #666;
          margin: 4px 0;
        }

        .divider {
          border-top: 2px solid #ddd;
          margin-top: 12px;
        }

        .report-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 24px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e5e5e5;
        }

        .report-title h2 {
          font-size: 18px;
          font-weight: bold;
          margin: 0;
          color: #000;
        }

        .date-range {
          text-align: right;
          font-size: 12px;
          color: #333;
        }

        .date-range p {
          margin: 4px 0;
        }

        .kpi-section {
          margin-bottom: 24px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .kpi-card {
          border: 1px solid #ddd;
          padding: 12px;
          border-radius: 4px;
          background: #fafafa;
        }

        .kpi-card h4 {
          margin: 0 0 6px 0;
          font-size: 11px;
          color: #666;
          font-weight: 600;
          text-transform: uppercase;
        }

        .kpi-value {
          margin: 0;
          font-size: 20px;
          font-weight: bold;
          color: #000;
        }

        .section {
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin: 0 0 12px 0;
          color: #000;
          border-bottom: 2px solid #000;
          padding-bottom: 6px;
        }

        .category-list {
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 12px;
          border-bottom: 1px solid #f0f0f0;
          font-size: 12px;
        }

        .category-item:last-child {
          border-bottom: none;
        }

        .category-item:nth-child(even) {
          background: #fafafa;
        }

        .category-name {
          font-weight: 600;
          color: #000;
        }

        .category-value {
          font-weight: bold;
          color: #000;
        }

        .category-percent {
          color: #666;
          font-size: 11px;
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        .products-table thead {
          background: #f5f5f5;
        }

        .products-table th {
          padding: 10px 8px;
          text-align: left;
          font-weight: 600;
          color: #000;
          border-bottom: 2px solid #ddd;
        }

        .products-table td {
          padding: 10px 8px;
          border-bottom: 1px solid #f0f0f0;
          color: #333;
        }

        .products-table tbody tr:nth-child(even) {
          background: #fafafa;
        }

        .text-center {
          text-align: center !important;
        }

        .profit-details {
          border: 1px solid #ddd;
          border-radius: 4px;
          padding: 12px;
        }

        .profit-item {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
          font-size: 12px;
        }

        .profit-item:last-child {
          border-bottom: none;
        }

        .profit-label {
          font-weight: 600;
          color: #333;
        }

        .profit-value {
          font-weight: bold;
          color: #000;
          font-size: 13px;
        }

        .profit-item.highlight {
          background: #f5f5f5;
          margin: 0 -12px;
          padding: 12px;
          border-radius: 4px;
        }

        .pdf-footer {
          margin-top: 30px;
          padding-top: 12px;
          border-top: 1px solid #ddd;
          text-align: center;
          font-size: 9px;
          color: #999;
        }

        .pdf-footer p {
          margin: 2px 0;
        }

        @media print {
          .pdf-template {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </>
  );
};

export default SalesReportPDF;
