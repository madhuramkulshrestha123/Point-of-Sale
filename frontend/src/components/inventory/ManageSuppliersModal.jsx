import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ManageSuppliersModal = ({ isOpen, onClose, onSuccess }) => {
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [mode, setMode] = useState('select'); // select, view, edit, add
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    gstNumber: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchSuppliers();
    }
  }, [isOpen]);

  const fetchSuppliers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/suppliers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setSuppliers(response.data.data.suppliers);
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Failed to load suppliers');
    }
  };

  const handleSupplierSelect = (e) => {
    const value = e.target.value;
    setError('');
    
    if (value === 'add-new') {
      setMode('add');
      resetForm();
    } else {
      const supplier = suppliers.find(s => s._id === value);
      if (supplier) {
        setSelectedSupplier(supplier);
        setFormData({
          name: supplier.name,
          contactPerson: supplier.contactPerson || '',
          phone: supplier.phone || '',
          email: supplier.email || '',
          address: supplier.address ? 
            `${supplier.address.street || ''} ${supplier.address.city || ''} ${supplier.address.state || ''} ${supplier.address.zipCode || ''}`.trim() 
            : '',
          gstNumber: supplier.gstin || '',
        });
        setMode('view');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSupplier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/suppliers`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        fetchSuppliers();
        setSelectedSupplier(response.data.data.supplier);
        setMode('view');
        onSuccess && onSuccess(response.data.data.supplier);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add supplier');
      console.error('Add supplier error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSupplier = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/suppliers/${selectedSupplier._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        fetchSuppliers();
        setSelectedSupplier(response.data.data.supplier);
        setMode('view');
        onSuccess && onSuccess(response.data.data.supplier);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update supplier');
      console.error('Update supplier error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSupplier = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/suppliers/${selectedSupplier._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        fetchSuppliers();
        setSelectedSupplier(null);
        setMode('select');
        setShowDeleteConfirm(false);
        onSuccess && onSuccess(null);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete supplier');
      console.error('Delete supplier error:', err);
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      gstNumber: '',
    });
    setError('');
  };

  const handleEditClick = () => {
    setMode('edit');
  };

  const handleCancelEdit = () => {
    if (selectedSupplier) {
      setFormData({
        name: selectedSupplier.name,
        contactPerson: selectedSupplier.contactPerson || '',
        phone: selectedSupplier.phone || '',
        email: selectedSupplier.email || '',
        address: selectedSupplier.address ? 
          `${selectedSupplier.address.street || ''} ${selectedSupplier.address.city || ''} ${selectedSupplier.address.state || ''} ${selectedSupplier.address.zipCode || ''}`.trim() 
          : '',
        gstNumber: selectedSupplier.gstin || '',
      });
      setMode('view');
    } else {
      setMode('select');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-2xl md:rounded-2xl shadow-2xl w-full md:max-w-2xl max-h-[95vh] md:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-dark text-white px-4 py-4 md:px-6 md:py-5 rounded-t-2xl flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold md:text-xl">Manage Suppliers</h2>
            <p className="text-xs opacity-90 mt-0.5">Add, edit, or manage suppliers</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            style={{ minHeight: '44px', minWidth: '44px' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 md:p-6 space-y-4">
          {/* Supplier Selection Dropdown */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Supplier
            </label>
            <select
              value={selectedSupplier?._id || ''}
              onChange={handleSupplierSelect}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm font-medium"
            >
              <option value="">-- Select a Supplier --</option>
              {suppliers.map((supplier) => (
                <option key={supplier._id} value={supplier._id}>
                  {supplier.name}
                </option>
              ))}
              <option value="add-new">+ Add New Supplier</option>
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* View Supplier Details */}
          {mode === 'view' && selectedSupplier && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-5 rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">{selectedSupplier.name}</h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Contact Person</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedSupplier.contactPerson || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Phone</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedSupplier.phone || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Email</p>
                      <p className="text-sm font-medium text-gray-800">
                        {selectedSupplier.email || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Address</p>
                    <p className="text-sm font-medium text-gray-800">
                      {selectedSupplier.address ? 
                        `${selectedSupplier.address.street || ''} ${selectedSupplier.address.city || ''}, ${selectedSupplier.address.state || ''} ${selectedSupplier.address.zipCode || ''}`.trim()
                        : 'N/A'}
                    </p>
                  </div>

                  {selectedSupplier.gstin && (
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">GST Number</p>
                      <p className="text-sm font-mono font-medium text-gray-800">
                        {selectedSupplier.gstin}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleEditClick}
                  className="flex-1 px-4 py-2.5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                >
                  Edit Supplier
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete Supplier
                </button>
              </div>
            </div>
          )}

          {/* Add/Edit Supplier Form */}
          {(mode === 'add' || mode === 'edit') && (
            <form onSubmit={mode === 'add' ? handleAddSupplier : handleUpdateSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Supplier Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter supplier name"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  placeholder="Enter contact person name"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Enter full address"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  GST Number
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleInputChange}
                  placeholder="Enter GST number"
                  className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : mode === 'add' ? 'Add Supplier' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Empty State */}
          {mode === 'select' && !selectedSupplier && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 font-medium">Select a supplier to view details</p>
              <p className="text-gray-400 text-sm mt-1">or add a new supplier</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="bg-red-500 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-lg font-bold">Confirm Delete</h3>
              <button onClick={() => setShowDeleteConfirm(false)} className="text-white hover:text-gray-200">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-700 mb-4">
                Are you sure you want to delete this supplier?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800 font-medium">
                  This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteSupplier}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Supplier'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageSuppliersModal;
