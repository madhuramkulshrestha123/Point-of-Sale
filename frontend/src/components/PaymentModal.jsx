import React, { useState, useEffect } from 'react';
import axios from 'axios';
import usePOSStore from '../store/posStore';
import ThermalInvoice from './ThermalInvoice';

const API_URL = import.meta.env.VITE_API_URL;

const PaymentModal = ({ isOpen, onClose, saleId, saleData, onSuccess }) => {
  const { clearCart } = usePOSStore();
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [processing, setProcessing] = useState(false);
  const [currentSaleData, setCurrentSaleData] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastCompletedSaleId, setLastCompletedSaleId] = useState(null);


  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setError('');
      setPaymentMethod('cash');
      setCurrentSaleData(null);
      setIsLoading(false);
      
      // If saleData is passed directly (e.g., from CheckoutModal), use it
      if (saleData) {
        console.log('PaymentModal: Using saleData passed directly:', saleData);
        setCurrentSaleData(saleData);
      } else if (saleId) {
        // Otherwise try to fetch (for pending bills from history)
        fetchSaleDetails(saleId);
      }
    }
  }, [isOpen, saleId, saleData]);



  const fetchSaleDetails = async (id) => {
    try {
      setIsLoading(true);
      console.log('PaymentModal: Fetching sale details for ID:', id);
      const token = localStorage.getItem('token');
      
      // Try to fetch from sales endpoint (for pending bills)
      try {
        const response = await axios.get(`${API_URL}/sales/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (response.data.success && response.data.data.sale) {
          console.log('PaymentModal: Sale details fetched successfully:', response.data.data.sale);
          setCurrentSaleData(response.data.data.sale);
          return;
        }
      } catch (err) {
        console.log('Sale endpoint failed:', err.response?.data?.message || err.message);
      }
      
      // If saleData is passed directly, use it
      if (saleData) {
        console.log('PaymentModal: Using saleData passed directly:', saleData);
        setCurrentSaleData(saleData);
      } else {
        setError('Sale details not found');
      }
    } catch (err) {
      console.error('Error fetching sale details:', err);
      setError('Failed to load sale details');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async (printAfter = false) => {
    if (!currentSaleData) return;

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      // Create payment record
      const response = await axios.post(
        `${API_URL}/payments`,
        {
          saleId: currentSaleData._id,
          invoiceNumber: currentSaleData.invoiceNumber,
          amount: currentSaleData.finalAmount,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        clearCart();
        const paymentId = response.data.data.payment._id;
        let paymentSaleData = response.data.data.payment.sale || currentSaleData;
        
        // Ensure the sale data has the payment method and status from the payment
        if (paymentSaleData) {
          paymentSaleData = {
            ...paymentSaleData,
            paymentMethod: response.data.data.payment.paymentMethod || paymentSaleData.paymentMethod,
            paymentStatus: response.data.data.payment.status || paymentSaleData.paymentStatus || 'paid',
            amountPaid: response.data.data.payment.amount || paymentSaleData.amountPaid,
          };
        }
        
        console.log('Payment successful');
        console.log('Payment sale data:', paymentSaleData);
        
        // Set the sale data for invoice
        setLastCompletedSaleId(paymentId);
        setCurrentSaleData(paymentSaleData);
        setShowInvoice(true);
        
        // Don't call onSuccess or onClose yet - let user interact with invoice modal
        onSuccess?.('Payment completed successfully');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveAsPending = async () => {
    if (!currentSaleData) return;

    setProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/payments/save-cart`,
        {
          saleId: currentSaleData._id,
          invoiceNumber: currentSaleData.invoiceNumber,
          amount: currentSaleData.finalAmount,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        clearCart();
        onSuccess?.('Bill saved as pending');
        onClose();
      }
    } catch (err) {
      console.error('Save as pending error:', err);
      setError(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  // Show loading state while fetching sale data
  if (isLoading || (!currentSaleData && saleId)) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading sale details...</p>
        </div>
      </div>
    );
  }

  if (!currentSaleData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-gray-600 font-medium">No sale data available</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl disabled:cursor-not-allowed z-10"
        >
          ×
        </button>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 pb-4">
            {/* Header */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment</h1>
              <p className="text-gray-600">Complete your transaction</p>
            </div>

            {/* Bill Summary */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6 mb-6 border border-blue-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Bill Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Invoice Number:</span>
                  <span className="font-mono font-semibold text-gray-800">
                    {currentSaleData.invoiceNumber}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-semibold text-gray-800">
                    {currentSaleData.items?.length || 0}
                  </span>
                </div>
                <div className="border-t border-gray-300 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-800">Total Amount:</span>
                    <span className="text-3xl font-extrabold text-green-600">
                      ₹{currentSaleData.finalAmount?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Select Payment Method</h2>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'cash'
                      ? 'border-green-500 bg-green-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💵</div>
                    <div className="text-sm font-semibold text-gray-800">Cash</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-purple-500 bg-purple-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <div className="text-sm font-semibold text-gray-800">UPI</div>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-6 rounded-lg border-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">💳</div>
                    <div className="text-sm font-semibold text-gray-800">Card</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons at Bottom */}
        <div className="flex-shrink-0 bg-white border-t p-6 rounded-b-xl">
          <div className="space-y-3">
            <button
              onClick={() => handlePayment(true)}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-bold text-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
            >
              {processing ? 'Processing...' : (
                <>
                  <span>🧾</span>
                  <span>Pay & Print ₹{currentSaleData.finalAmount?.toLocaleString()}</span>
                </>
              )}
            </button>

            <button
              onClick={() => handlePayment(false)}
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {processing ? 'Processing...' : `Pay ₹${currentSaleData.finalAmount?.toLocaleString()}`}
            </button>

            <button
              onClick={handleSaveAsPending}
              disabled={processing}
              className="w-full py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save as Pending
            </button>

            <button
              onClick={onClose}
              disabled={processing}
              className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
    
    {/* Thermal Invoice Modal - Shows thermal bill with Print, Share, Close options */}
    <ThermalInvoice
      isOpen={showInvoice}
      onClose={() => {
        setShowInvoice(false);
        onClose();
      }}
      saleId={lastCompletedSaleId}
      saleData={currentSaleData}
    />
    </>
  );
};

export default PaymentModal;
