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
        // Don't call onReady yet - wait for businessInfo to load
      } else if (saleId) {
        fetchSaleDetails(saleId);
      }
    }
  }, [isOpen, saleId, saleData]);

  // Call onReady when both invoiceData and businessInfo are loaded
  useEffect(() => {
    if (invoiceData && businessInfo && onReady) {
      console.log('ThermalInvoice: Both invoice and business info loaded, calling onReady');
      setTimeout(() => onReady(), 100);
    }
  }, [invoiceData, businessInfo, onReady]);

  const fetchBusinessInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching business info from:', `${API_URL}/auth/me`);
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      console.log('Full API response:', response.data);
      
      if (response.data.success) {
        // Extract user data from the nested structure: response.data.data.user
        const userData = response.data.data.user || response.data.data;
        console.log('User data extracted:', userData);
        
        // Ensure address is properly structured
        const businessData = {
          businessName: userData.businessName || 'YOUR STORE NAME',
          name: userData.ownerName || '',
          gstNumber: userData.gstNumber || userData.gst || '',
          currency: userData.currency || 'INR',
          address: userData.address || {}
        };
        
        console.log('Setting business info:', businessData);
        setBusinessInfo(businessData);
      }
    } catch (err) {
      console.error('Error fetching business info:', err);
      console.error('Error details:', err.response?.data);
      // Set default fallback
      setBusinessInfo({
        businessName: 'YOUR STORE NAME',
        gstNumber: '',
        currency: 'INR',
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

  const handleShareBill = async () => {
    try {
      const saleData = invoiceData;
      
      // Check if Web Share API is supported
      if (navigator.share) {
        // Create a simple text with invoice details
        const shareText = `📄 Invoice: ${saleData.invoiceNumber}
💰 Amount: ${getCurrencySymbol()}${finalTotal.toFixed(2)}
📅 Date: ${dateStr}
👤 Customer: ${saleData.customer?.name || 'Walk-in Customer'}
💳 Payment: ${(saleData.paymentMethod || 'N/A').toUpperCase()}`;
        
        try {
          await navigator.share({
            title: `Invoice ${saleData.invoiceNumber}`,
            text: shareText,
          });
          console.log('Shared successfully');
        } catch (shareError) {
          if (shareError.name === 'AbortError') {
            console.log('Share canceled');
          } else {
            console.log('Share failed, falling back to clipboard');
            navigator.clipboard.writeText(shareText);
            alert('Bill details copied to clipboard!');
          }
        }
      } else {
        // Fallback: copy to clipboard
        const shareText = `Invoice: ${saleData.invoiceNumber}, Amount: ${getCurrencySymbol()}${finalTotal.toFixed(2)}, Date: ${dateStr}`;
        navigator.clipboard.writeText(shareText);
        alert('Bill details copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share bill');
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

    // Build complete HTML for print window with proper centering and styling
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
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            overflow: visible;
          }
          @page {
            size: 80mm auto;
            margin: 10mm 5mm;
          }
          @media print {
            body { 
              width: 100%;
              max-width: 320px;
              margin: 0 auto;
              padding: 0;
              overflow: visible;
            }
            /* Prevent page breaks inside elements */
            div, p, table, tr {
              page-break-inside: avoid;
            }
            /* Ensure header stays at top */
            .header-section {
              page-break-after: avoid;
            }
            /* Allow content to flow to next page naturally */
            .items-section {
              page-break-before: auto;
            }
          }
          /* Ensure centering and proper formatting */
          #print-content {
            width: 320px;
            margin: 0 auto;
            font-family: monospace;
            overflow: visible;
          }
          .header-section {
            text-align: center;
            margin-bottom: 12px;
            page-break-after: avoid;
          }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .border-t { border-top: 1px solid #000; }
          .border-b { border-bottom: 1px solid #000; }
          .border-black { border-color: #000; }
          .font-bold { font-weight: bold; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-3 { margin-top: 12px; }
          .p-4 { padding: 16px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .pt-1 { padding-top: 4px; }
          .pt-2 { padding-top: 8px; }
          .pb-1 { padding-bottom: 4px; }
          .pb-2 { padding-bottom: 8px; }
          .text-lg { font-size: 18px; }
          .text-xl { font-size: 20px; }
          .text-2xl { font-size: 24px; }
          .text-sm { font-size: 11px; }
          .text-xs { font-size: 10px; }
        </style>
      </head>
      <body>
        <div id="print-content" style="width: 320px; margin: 0 auto; padding: 16px; font-family: monospace; overflow: visible;">
          ${thermalContent.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
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

    // Build complete HTML for print window with proper centering and styling
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
            padding: 0;
            background: white;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            overflow: visible;
          }
          @page {
            size: 80mm auto;
            margin: 10mm 5mm;
          }
          @media print {
            body { 
              width: 100%;
              max-width: 320px;
              margin: 0 auto;
              padding: 0;
              overflow: visible;
            }
            /* Prevent page breaks inside elements */
            div, p, table, tr {
              page-break-inside: avoid;
            }
            /* Ensure header stays at top */
            .header-section {
              page-break-after: avoid;
            }
            /* Allow content to flow to next page naturally */
            .items-section {
              page-break-before: auto;
            }
          }
          /* Ensure centering and proper formatting */
          #print-content {
            width: 320px;
            margin: 0 auto;
            font-family: monospace;
            overflow: visible;
          }
          .header-section {
            text-align: center;
            margin-bottom: 12px;
            page-break-after: avoid;
          }
          .text-center { text-align: center; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .border-t { border-top: 1px solid #000; }
          .border-b { border-bottom: 1px solid #000; }
          .border-black { border-color: #000; }
          .font-bold { font-weight: bold; }
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-3 { margin-top: 12px; }
          .p-4 { padding: 16px; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          .pt-1 { padding-top: 4px; }
          .pt-2 { padding-top: 8px; }
          .pb-1 { padding-bottom: 4px; }
          .pb-2 { padding-bottom: 8px; }
          .text-lg { font-size: 18px; }
          .text-xl { font-size: 20px; }
          .text-2xl { font-size: 24px; }
          .text-sm { font-size: 11px; }
          .text-xs { font-size: 10px; }
        </style>
      </head>
      <body>
        <div id="print-content" style="width: 320px; margin: 0 auto; padding: 16px; font-family: monospace; overflow: visible;">
          ${thermalContent.innerHTML}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.focus();
              window.print();
              window.close();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
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

  // Show loading if business info is not yet loaded
  if (!businessInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700">Loading business info...</p>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-md max-h-[90vh] flex flex-col">
        {/* Print/Download/Share Buttons - Fixed at top */}
        <div className="flex-shrink-0 bg-white rounded-t-lg p-3 border-b sticky top-0 z-10 print:hidden">
          <div className="flex gap-2 flex-wrap justify-center">
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 shadow-md flex items-center gap-1 text-sm"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow-md flex items-center gap-1 text-sm"
            >
              📄 PDF
            </button>
            <button
              onClick={handleShareBill}
              className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 shadow-md flex items-center gap-1 text-sm"
            >
              📤 Share
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 shadow-md text-sm"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable Bill Content */}
        <div className="flex-1 overflow-y-auto bg-white rounded-b-lg">
          {/* Thermal Receipt */}
          <div id="thermal-bill-content" className="bg-white mx-auto" style={{ width: '320px', fontFamily: 'monospace' }}>
          <div className="p-4 text-black" style={{ fontSize: '11px', lineHeight: '1.4' }}>
            {/* Header Section */}
            <div className="text-center mb-3 header-section">
              <h1 className="text-lg font-bold mb-1" style={{ fontSize: '16px' }}>
                {businessInfo?.businessName || businessInfo?.name || 'YOUR STORE NAME'}
              </h1>
              {(businessInfo?.gstNumber || businessInfo?.gst) && (
                <div style={{ fontSize: '10px' }}>
                  <p>GSTIN: {businessInfo.gstNumber || businessInfo.gst}</p>
                </div>
              )}
              {businessInfo?.address && (
                <div style={{ fontSize: '10px' }}>
                  {typeof businessInfo.address === 'string' ? (
                    <p>{businessInfo.address}</p>
                  ) : (
                    <>
                      {businessInfo.address.street && <p>{businessInfo.address.street}</p>}
                      {(businessInfo.address.city || businessInfo.address.state) && (
                        <p>
                          {businessInfo.address.city}{businessInfo.address.city && businessInfo.address.state ? ', ' : ''}{businessInfo.address.state}
                        </p>
                      )}
                      {businessInfo.address.zipCode || businessInfo.address.zip && <p>{businessInfo.address.zipCode || businessInfo.address.zip}</p>}
                    </>
                  )}
                </div>
              )}
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
              {invoiceData.paymentMethod && (
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold">{(invoiceData.paymentMethod).toUpperCase()}</span>
                </div>
              )}
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
            <div className="mb-3 items-section" style={{ fontSize: '10px' }}>
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
            {Object.keys(taxBreakdownByRate).length > 0 && (
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
            )}

            {/* Payment Section */}
            <div className="mb-3" style={{ fontSize: '10px' }}>
              {invoiceData.paymentStatus && (
                <div className="flex justify-between mb-1">
                  <span>Payment Status:</span>
                  <span className="font-bold">{(invoiceData.paymentStatus).toUpperCase()}</span>
                </div>
              )}
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
    </div>
  );
};

export default ThermalInvoice;
