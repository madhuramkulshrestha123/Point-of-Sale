import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

const InvoiceShare = ({ isOpen, onClose, saleData }) => {
  const [generating, setGenerating] = useState(false);
  const invoiceRef = useRef(null);

  if (!isOpen || !saleData) return null;

  const getCurrencySymbol = () => {
    const currencySymbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'AED': 'د.إ',
    };
    return currencySymbols[saleData.currency || 'INR'] || '₹';
  };

  const formatNumber = (num) => {
    return (num || 0).toFixed(2);
  };

  // Calculate totals
  const subtotal = saleData.items?.reduce((sum, item) => {
    const itemSubtotal = item.subtotal || ((item.sellingPrice || 0) * (item.quantity || 0));
    return sum + itemSubtotal;
  }, 0) || 0;

  const taxBreakdownByRate = {};
  saleData.items?.forEach(item => {
    const rate = item.taxRate || item.product?.gstRate || 18;
    const itemAmount = item.subtotal || ((item.sellingPrice || 0) * (item.quantity || 0));
    const itemTax = (itemAmount * rate) / 100;
    
    if (!taxBreakdownByRate[rate]) {
      taxBreakdownByRate[rate] = { taxable: 0, tax: 0 };
    }
    taxBreakdownByRate[rate].taxable += itemAmount;
    taxBreakdownByRate[rate].tax += itemTax;
  });

  const totalTax = Object.values(taxBreakdownByRate).reduce((sum, data) => sum + data.tax, 0);
  const discount = saleData.discount || 0;
  const finalTotal = saleData.finalAmount || (subtotal - discount + totalTax);

  const currencySymbol = getCurrencySymbol();
  const saleDate = new Date(saleData.createdAt);
  const dateStr = !isNaN(saleDate.getTime()) ? saleDate.toLocaleDateString('en-IN') : 'N/A';
  const timeStr = !isNaN(saleDate.getTime()) ? saleDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A';

  const handleShare = async () => {
    if (!invoiceRef.current) return;

    setGenerating(true);

    try {
      // Generate canvas from HTML
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 3, // High quality
        backgroundColor: '#ffffff',
        useCORS: true,
        logging: false,
        width: 320,
        windowWidth: 320,
      });

      // Convert to JPEG
      const image = canvas.toDataURL('image/jpeg', 1.0);

      // Try Web Share API
      if (navigator.share && navigator.canShare) {
        try {
          const response = await fetch(image);
          const blob = await response.blob();
          const file = new File([blob], `invoice-${saleData.invoiceNumber}.jpg`, {
            type: 'image/jpeg',
          });

          const shareData = {
            files: [file],
            title: `Invoice ${saleData.invoiceNumber}`,
            text: `Invoice from ${saleData.businessName || 'POS System'}\nAmount: ${currencySymbol}${finalTotal.toFixed(2)}`,
          };

          await navigator.share(shareData);
          onClose();
          return;
        } catch (shareError) {
          if (shareError.name === 'AbortError') {
            // User canceled share
            return;
          }
          console.log('Share failed, falling back to download:', shareError);
        }
      }

      // Fallback: Download image
      const link = document.createElement('a');
      link.download = `invoice-${saleData.invoiceNumber}.jpg`;
      link.href = image;
      link.click();
      
      alert('Invoice image downloaded!');
      onClose();
    } catch (error) {
      console.error('Error generating invoice image:', error);
      alert('Failed to generate invoice image');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Share Modal */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
          <h2 className="text-xl font-bold mb-4">Share Invoice</h2>
          <p className="text-gray-600 mb-4">Generate and share the invoice as an image</p>
          
          {generating ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
              <p className="text-gray-600">Generating invoice image...</p>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleShare}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
              >
                <span>📤</span>
                <span>Generate & Share Invoice</span>
              </button>
              
              <button
                onClick={onClose}
                className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hidden Invoice for Image Generation */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <div
          ref={invoiceRef}
          style={{
            width: '320px',
            fontFamily: 'monospace',
            backgroundColor: '#ffffff',
            color: '#000000',
            padding: '16px',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '12px' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              {(saleData.businessName || saleData.storeName || 'YOUR STORE NAME').toUpperCase()}
            </h1>
            {saleData.gstNumber && (
              <p style={{ fontSize: '10px', marginBottom: '2px' }}>
                GSTIN: {saleData.gstNumber}
              </p>
            )}
            {saleData.address && (
              <div style={{ fontSize: '10px' }}>
                {typeof saleData.address === 'string' ? (
                  <p>{saleData.address}</p>
                ) : (
                  <>
                    {saleData.address.street && <p>{saleData.address.street}</p>}
                    {(saleData.address.city || saleData.address.state) && (
                      <p>
                        {saleData.address.city}{saleData.address.city && saleData.address.state ? ', ' : ''}{saleData.address.state}
                      </p>
                    )}
                    {(saleData.address.zipCode || saleData.address.zip) && <p>{saleData.address.zipCode || saleData.address.zip}</p>}
                  </>
                )}
              </div>
            )}
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '8px', marginBottom: '4px' }}>
              POS INVOICE
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Invoice Info */}
          <div style={{ fontSize: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Bill No:</span>
              <span style={{ fontWeight: 'bold' }}>{saleData.invoiceNumber}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Date:</span>
              <span>{dateStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Time:</span>
              <span>{timeStr}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Customer:</span>
              <span>{saleData.customer?.name || 'Walk-in Customer'}</span>
            </div>
            {saleData.paymentMethod && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment:</span>
                <span style={{ fontWeight: 'bold' }}>{saleData.paymentMethod.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Items Header */}
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px' }}>
              <span style={{ width: '25px' }}>#</span>
              <span style={{ flex: 1 }}>Item</span>
              <span style={{ width: '30px' }}>Qty</span>
              <span style={{ width: '50px', textAlign: 'right' }}>Rate</span>
              <span style={{ width: '55px', textAlign: 'right' }}>Amt</span>
            </div>
          </div>

          {/* Items */}
          <div style={{ fontSize: '10px', marginBottom: '12px' }}>
            {saleData.items?.map((item, index) => {
              const productName = item.product?.name || item.productName || 'Product';
              const quantity = item.quantity || 0;
              const sellingPrice = item.sellingPrice || 0;
              const amount = item.subtotal || (quantity * sellingPrice);
              
              return (
                <div key={index} style={{ marginBottom: '6px', paddingBottom: '6px', borderBottom: '1px dotted #ccc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ width: '25px' }}>{index + 1}</span>
                    <span style={{ flex: 1 }}>{productName}</span>
                    <span style={{ width: '30px' }}>{quantity}</span>
                    <span style={{ width: '50px', textAlign: 'right' }}>{sellingPrice.toFixed(2)}</span>
                    <span style={{ width: '55px', textAlign: 'right' }}>{amount.toFixed(2)}</span>
                  </div>
                  {item.taxRate > 0 && (
                    <div style={{ fontSize: '9px', color: '#666', marginLeft: '25px' }}>
                      GST @ {item.taxRate}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Tax Breakdown */}
          <div style={{ fontSize: '10px', marginBottom: '12px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Tax Details</p>
            {Object.entries(taxBreakdownByRate).map(([rate, data]) => (
              <div key={rate} style={{ marginBottom: '2px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>CGST @ {parseFloat(rate) / 2}%:</span>
                  <span>{currencySymbol}{(data.tax / 2).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>SGST @ {parseFloat(rate) / 2}%:</span>
                  <span>{currencySymbol}{(data.tax / 2).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Total Section */}
          <div style={{ fontSize: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Subtotal:</span>
              <span>{currencySymbol}{formatNumber(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>Discount:</span>
                <span>-{currencySymbol}{formatNumber(discount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Total Tax:</span>
              <span>{currencySymbol}{formatNumber(totalTax)}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '2px solid #000', margin: '8px 0' }}></div>

          {/* Final Total */}
          <div style={{ textAlign: 'center', marginBottom: '12px', fontSize: '14px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>TOTAL PAID</p>
            <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '8px 0' }}>
              {currencySymbol}{formatNumber(finalTotal)}
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Payment Info */}
          <div style={{ fontSize: '10px', marginBottom: '12px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Payment Method:</span>
              <span style={{ fontWeight: 'bold' }}>{(saleData.paymentMethod || 'N/A').toUpperCase()}</span>
            </div>
            {saleData.paymentStatus && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status:</span>
                <span style={{ fontWeight: 'bold' }}>{saleData.paymentStatus.toUpperCase()}</span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>Thank You!</p>
            <p>Visit Again!</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvoiceShare;
