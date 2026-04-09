import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const ThermalInvoice = ({ isOpen, onClose, saleId, saleData, onReady }) => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [businessInfo, setBusinessInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBusinessInfo();
      if (saleData) {
        console.log('ThermalInvoice: Using saleData passed directly');
        setInvoiceData(saleData);
        if (onReady) {
          setTimeout(() => onReady(), 100);
        }
      } else if (saleId) {
        fetchSaleDetails(saleId);
      }
    }
  }, [isOpen, saleId, saleData]);

  const fetchBusinessInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        console.log('Business Info fetched:', response.data.data.user);
        setBusinessInfo(response.data.data.user);
      }
    } catch (err) {
      console.error('Error fetching business info:', err);
      // Set default fallback
      setBusinessInfo({
        businessName: 'YOUR STORE NAME',
        gstNumber: '',
        address: {}
      });
    }
  };

  const fetchSaleDetails = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // First try to fetch from payments endpoint
      try {
        const response = await axios.get(`${API_URL}/payments/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success && response.data.data.payment?.sale) {
          setInvoiceData(response.data.data.payment.sale);
          return;
        }
      } catch (paymentErr) {
        // If payment not found, try sales endpoint
        console.log('Payment not found, trying sales endpoint...');
      }
      
      // Fallback: try sales endpoint directly
      try {
        const saleResponse = await axios.get(`${API_URL}/sales/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (saleResponse.data.success) {
          setInvoiceData(saleResponse.data.data.sale);
          return;
        }
      } catch (saleErr) {
        console.log('Sales endpoint also failed');
      }
      
      // Last resort: use saleData if provided
      if (saleData) {
        setInvoiceData(saleData);
      }
    } catch (err) {
      console.error('Error fetching sale details:', err);
      // Use saleData as fallback
      if (saleData) {
        setInvoiceData(saleData);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice');
      return;
    }

    // Get ONLY the thermal bill content (not the modal wrapper)
    const thermalContent = document.getElementById('thermal-bill-content');
    if (!thermalContent) {
      alert('Could not find invoice content');
      return;
    }

    // Build complete HTML for print window
    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: monospace;
            width: 320px;
            margin: 0 auto;
            padding: 16px;
          }
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        ${thermalContent.innerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    if (!printWindow) {
      alert('Please allow pop-ups to save as PDF');
      return;
    }

    const thermalContent = document.getElementById('thermal-bill-content');
    if (!thermalContent) {
      alert('Could not find invoice content');
      return;
    }

    const printHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoiceData.invoiceNumber}</title>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: monospace;
            width: 320px;
            margin: 0 auto;
            padding: 16px;
          }
          @page {
            size: 80mm auto;
            margin: 5mm;
          }
          @media print {
            body { margin: 0; padding: 10px; }
          }
        </style>
      </head>
      <body>
        ${thermalContent.innerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoiceData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-700">No invoice data available</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-black text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const getCurrencySymbol = () => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AED': 'د.إ',
    };
    return currencySymbols[businessInfo?.currency || 'INR'] || '₹';
  };

  const subtotal = invoiceData.items?.reduce((sum, item) => {
    const itemSubtotal = item.subtotal || ((item.sellingPrice || 0) * (item.quantity || 0));
    return sum + itemSubtotal;
  }, 0) || 0;
  
  // Calculate tax breakdown by rate
  const taxBreakdownByRate = {};
  invoiceData.items?.forEach(item => {
    const rate = item.taxRate || item.product?.gstRate || 18;
    const itemAmount = item.subtotal || ((item.sellingPrice || 0) * (item.quantity || 0));
    const itemTax = (itemAmount * rate) / 100;
    
    if (!taxBreakdownByRate[rate]) {
      taxBreakdownByRate[rate] = { taxable: 0, tax: 0 };
    }
    taxBreakdownByRate[rate].taxable += itemAmount;
    taxBreakdownByRate[rate].tax += itemTax;
  });
  
  // Total tax amount
  const totalTax = Object.values(taxBreakdownByRate).reduce((sum, data) => sum + data.tax, 0);
  const discount = invoiceData.discount || 0;
  const finalTotal = invoiceData.finalAmount || (subtotal - discount + totalTax);

  const currencySymbol = getCurrencySymbol();

  // Format date and time
  const saleDate = new Date(invoiceData.createdAt);
  const isValidDate = !isNaN(saleDate.getTime());
  const dateStr = isValidDate ? saleDate.toLocaleDateString('en-IN') : 'N/A';
  const timeStr = isValidDate ? saleDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  console.log('ThermalInvoice - invoiceData:', invoiceData);
  console.log('ThermalInvoice - items:', invoiceData.items);
  console.log('ThermalInvoice - subtotal:', subtotal, 'finalTotal:', finalTotal);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
      <div className="relative">
        {/* Print/Download Buttons */}
        <div className="absolute -top-12 right-0 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-md flex items-center gap-2"
          >
            🖨️ Print Bill
          </button>
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md flex items-center gap-2"
          >
            📄 Save as PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 shadow-md"
          >
            ✕ Close
          </button>
        </div>

        {/* Thermal Receipt - Add ID for print isolation */}
        <div id="thermal-bill-content" className="bg-white mx-auto" style={{ width: '320px', fontFamily: 'monospace' }}>
          <div className="p-4 text-black" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            {/* Header Section */}
            <div className="text-center mb-3">
              <h1 className="text-lg font-bold mb-1" style={{ fontSize: '16px' }}>
                {businessInfo?.businessName || 'YOUR STORE NAME'}
              </h1>
              {businessInfo?.gstNumber ? (
                <div style={{ fontSize: '10px' }}>
                  <p>GSTIN: {businessInfo.gstNumber}</p>
                </div>
              ) : null}
              {businessInfo?.address ? (
                <div style={{ fontSize: '10px' }}>
                  {businessInfo.address.street && <p>{businessInfo.address.street}</p>}
                  {businessInfo.address.city && <p>{businessInfo.address.city}</p>}
                  {businessInfo.address.state && <p>{businessInfo.address.state}</p>}
                  {businessInfo.address.zipCode && <p>{businessInfo.address.zipCode}</p>}
                </div>
              ) : null}
              <div className="mt-2 mb-1" style={{ fontSize: '14px' }}>
                <strong>POS Invoice</strong>
              </div>
            </div>

            {/* Bill Info */}
            <div className="mb-3" style={{ fontSize: '10px' }}>
              <div className="flex justify-between">
                <span>Bill No:</span>
                <span className="font-bold">{invoiceData.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Date:</span>
                <span>{dateStr}</span>
              </div>
              <div className="flex justify-between">
                <span>Time:</span>
                <span>{timeStr}</span>
              </div>
              <div className="flex justify-between">
                <span>Buyer Name:</span>
                <span>{invoiceData.customer?.name || 'Walk-in Customer'}</span>
              </div>
            </div>

            <div className="border-t border-b border-black py-1 mb-3" style={{ fontSize: '9px' }}>
              <div className="flex justify-between">
                <span>Printed: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Items Table Header */}
            <div className="mb-2" style={{ fontSize: '10px' }}>
              <div className="flex justify-between font-bold border-b border-black pb-1">
                <span style={{ width: '25px' }}>Sl</span>
                <span style={{ flex: 1 }}>Description</span>
                <span style={{ width: '40px' }}>HSN</span>
                <span style={{ width: '30px' }}>Qty</span>
                <span style={{ width: '45px' }}>Rate</span>
                <span style={{ width: '40px' }}>Disc</span>
                <span style={{ width: '50px' }}>Amount</span>
              </div>
            </div>

            {/* Items */}
            <div className="mb-3" style={{ fontSize: '10px' }}>
              {invoiceData.items?.map((item, index) => {
                const productName = item.product?.name || item.productName || 'Product';
                const hsnCode = item.product?.hsnCode || item.hsnCode || 'N/A';
                const quantity = item.quantity || 0;
                const sellingPrice = item.sellingPrice || 0;
                const disc = item.discount || 0;
                const amount = item.subtotal || (quantity * sellingPrice - disc);
                const taxRate = item.taxRate || item.product?.gstRate || 18;
                const itemTax = (amount * taxRate) / 100;
                const cgst = itemTax / 2;
                const sgst = itemTax / 2;
                
                return (
                  <div key={index} className="mb-2 pb-2 border-b border-gray-200">
                    <div className="flex justify-between mb-1">
                      <span style={{ width: '25px' }}>{index + 1}</span>
                      <span style={{ flex: 1 }}>{productName}</span>
                      <span style={{ width: '40px' }}>{hsnCode}</span>
                      <span style={{ width: '30px' }}>{quantity} Nos</span>
                      <span style={{ width: '45px' }}>{sellingPrice.toFixed(2)}</span>
                      <span style={{ width: '40px' }}>{disc.toFixed(2)}</span>
                      <span style={{ width: '50px' }}>{amount.toFixed(2)}</span>
                    </div>
                    {taxRate > 0 && (
                      <div className="flex justify-between text-gray-600 ml-[25px]" style={{ fontSize: '9px' }}>
                        <span className="flex-1">Tax @ {taxRate}%</span>
                        <span>CGST: {cgst.toFixed(2)} | SGST: {sgst.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subtotal Section */}
            <div className="border-t border-black pt-2 mb-3" style={{ fontSize: '10px' }}>
              <div className="flex justify-between mb-1">
                <span>Subtotal:</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between mb-1">
                  <span>Discount:</span>
                  <span>-{currencySymbol}{discount.toFixed(2)}</span>
                </div>
              )}
              
              {/* Tax Breakdown by Rate */}
              {Object.entries(taxBreakdownByRate).map(([rate, data]) => (
                <div key={rate}>
                  <div className="flex justify-between mb-1">
                    <span>CGST @ {parseFloat(rate)/2}%:</span>
                    <span>{currencySymbol}{(data.tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>SGST @ {parseFloat(rate)/2}%:</span>
                    <span>{currencySymbol}{(data.tax / 2).toFixed(2)}</span>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between font-bold border-t border-black pt-1 mt-1">
                <span>Total:</span>
                <span className="text-lg">{currencySymbol}{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Tax Breakdown */}
            <div className="border-t border-b border-black py-2 mb-3" style={{ fontSize: '9px' }}>
              <p className="font-bold mb-1">Tax Breakdown</p>
              {Object.entries(taxBreakdownByRate).map(([rate, data]) => (
                <div key={rate}>
                  <div className="flex justify-between mb-1">
                    <span>CGST @ {parseFloat(rate)/2}%:</span>
                    <span>{currencySymbol}{(data.tax / 2).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span>SGST @ {parseFloat(rate)/2}%:</span>
                    <span>{currencySymbol}{(data.tax / 2).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment Section */}
            <div className="mb-3" style={{ fontSize: '10px' }}>
              <div className="flex justify-between mb-1">
                <span>Payment Method:</span>
                <span className="font-bold">{(invoiceData.paymentMethod || 'N/A').toUpperCase()}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Payment Status:</span>
                <span>{(invoiceData.paymentStatus || 'N/A').toUpperCase()}</span>
              </div>
            </div>

            {/* Final Total */}
            <div className="border-t-2 border-black pt-2 mb-3 text-center" style={{ fontSize: '14px' }}>
              <p className="font-bold">Total Paid</p>
              <p className="text-2xl font-bold my-1">{currencySymbol}{finalTotal.toFixed(2)}</p>
              <div className="border-t border-b border-black py-1 my-2">
                <span>Thank You!</span>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-4" style={{ fontSize: '11px' }}>
              <p className="font-bold">Thank You!</p>
              <p>Visit Again!</p>
            </div>

            {/* Print timestamp */}
            <div className="text-center mt-3 pt-2 border-t border-gray-300" style={{ fontSize: '8px', color: '#666' }}>
              <p>Printed: {new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThermalInvoice;
