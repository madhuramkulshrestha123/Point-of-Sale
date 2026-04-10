import React, { useState, useEffect } from 'react';
import usePOSStore from '../store/posStore';
import axios from 'axios';
import PaymentModal from './PaymentModal';

const API_URL = import.meta.env.VITE_API_URL;

const CheckoutModal = ({ isOpen, onClose }) => {
  const { getTotal, clearCart, customer, cart, getSubtotal, getDiscountAmount, getTaxAmount } = usePOSStore();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const [createdSaleData, setCreatedSaleData] = useState(null);
  
  // Reset state when checkout modal opens/closes
  useEffect(() => {
    console.log('CheckoutModal: isOpen changed to', isOpen);
    if (!isOpen) {
      setShowPaymentModal(false);
      setCreatedSaleId(null);
      setCreatedSaleData(null);
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  const total = getTotal();
  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const taxAmount = getTaxAmount();
  
  const handleProceedToPayment = async () => {
    setProcessing(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Validate cashier ID
      const cashierId = user?._id || user?.id;
      if (!cashierId) {
        setError('User information not found. Please login again.');
        return;
      }
      
      // If customer is registered, create/update customer record
      let customerId = customer.type === 'registered' ? customer.id : null;
      
      // If customer has name and phone but no ID (new customer from Add button), create them
      if (customer.type === 'registered' && customer.name && customer.phone && !customer.id) {
        try {
          const customerResponse = await axios.post(
            `${API_URL}/customers`,
            {
              name: customer.name,
              phone: customer.phone,
              address: customer.address ? { street: customer.address } : {},
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (customerResponse.data.success) {
            customerId = customerResponse.data.data.customer._id;
          }
        } catch (err) {
          console.error('Error creating customer:', err);
          // Continue without customer ID if creation fails
        }
      }
      
      // Validate cart items have all required fields
      const validatedItems = cart.map(item => {
        // Ensure price is a valid number
        const sellingPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
        const costPrice = typeof item.costPrice === 'number' ? item.costPrice : parseFloat(item.costPrice) || 0;
        const quantity = typeof item.quantity === 'number' ? item.quantity : parseInt(item.quantity) || 1;
        const productId = item.id || item._id;
        
        if (!productId) {
          console.error('Item missing product ID:', item);
        }
        
        return {
          product: productId, // This should be the product _id
          quantity: quantity,
          sellingPrice: sellingPrice,
          costPrice: costPrice,
          discount: 0,
          subtotal: sellingPrice * quantity,
          taxRate: item.taxRate || 18,
        };
      });
      
      // Log for debugging
      console.log('Validated items:', validatedItems);
      console.log('Cart items:', cart.map(i => ({ id: i.id, price: i.price, costPrice: i.costPrice })));
      
      // Prepare sale data
      const saleData = {
        customer: customerId,
        cashier: cashierId,
        items: validatedItems,
        totalAmount: subtotal,
        discount: discountAmount,
        tax: taxAmount,
        finalAmount: total,
        paymentMethod: 'cash', // Default, will be updated in payment page
        notes: '',
        isPending: false, // This will create a paid sale
      };
      
      console.log('Sending sale data:', saleData);
      
      // Create the sale
      const response = await axios.post(
        `${API_URL}/sales`,
        saleData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      console.log('Sale response:', response.data);
      
      if (response.data.success) {
        // Set the sale ID and data to open payment modal
        const saleId = response.data.data.sale._id;
        const saleData = response.data.data.sale;
        console.log('Sale created successfully, opening payment modal for:', saleId);
        setCreatedSaleId(saleId);
        setCreatedSaleData(saleData);
        setShowPaymentModal(true);
        // Don't close checkout modal yet - will close after payment success
      }
    } catch (err) {
      console.error('Error creating sale:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.message || 'Failed to proceed to payment');
    } finally {
      setProcessing(false);
    }
  };
  
  const handlePaymentSuccess = (message) => {
    console.log('Payment successful:', message);
    // Close checkout modal after payment success
    onClose();
  };
  
  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fade-in border-4 border-primary-light/30 relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-extrabold text-gray-800 mb-2">Checkout</h2>
          <p className="text-gray-600 font-medium">Review your bill and proceed to payment</p>
        </div>
        
        {/* Bill Summary */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 space-y-3 border-2 border-blue-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">Subtotal:</span>
            <span className="font-semibold text-gray-800">₹{subtotal.toLocaleString()}</span>
          </div>
          
          {discountAmount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span className="font-medium">Discount:</span>
              <span className="font-semibold">-₹{discountAmount.toLocaleString()}</span>
            </div>
          )}
          
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">GST:</span>
            <span className="font-semibold text-gray-800">₹{taxAmount.toLocaleString()}</span>
          </div>
          
          <div className="border-t-2 border-gray-300 pt-4 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total Amount:</span>
              <span className="text-3xl font-extrabold text-green-600">₹{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleProceedToPayment}
            disabled={processing}
            className="w-full px-6 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Creating Sale...' : 'Proceed to Payment'}
          </button>
          
          <button
            onClick={onClose}
            disabled={processing}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={processing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl disabled:cursor-not-allowed"
        >
          ×
        </button>
      </div>
    </div>
    
    {/* Payment Modal */}
    <PaymentModal
      isOpen={showPaymentModal}
      onClose={() => setShowPaymentModal(false)}
      saleId={createdSaleId}
      saleData={createdSaleData}
      onSuccess={handlePaymentSuccess}
    />
    </>
  );
};

export default CheckoutModal;
