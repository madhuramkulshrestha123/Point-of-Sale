import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PinVerificationModal from '../PinVerificationModal';

const API_URL = import.meta.env.VITE_API_URL;
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

// Predefined category images/icons
const CATEGORY_IMAGES = [
  { name: 'Engine Oil', icon: '🛢️', color: 'from-blue-400 to-blue-600' },
  { name: 'Filters', icon: '🔧', color: 'from-green-400 to-green-600' },
  { name: 'Brakes', icon: '🔴', color: 'from-red-400 to-red-600' },
  { name: 'Battery', icon: '🔋', color: 'from-yellow-400 to-yellow-600' },
  { name: 'Tires', icon: '⚫', color: 'from-gray-600 to-gray-800' },
  { name: 'Accessories', icon: '🔩', color: 'from-purple-400 to-purple-600' },
];

const ManageCategoriesModal = ({ isOpen, onClose, onSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      resetForm();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const resetForm = () => {
    setSelectedCategory(null);
    setIsAddMode(false);
    setIsEditMode(false);
    setCategoryName('');
    setSelectedImage(null);
    setUploadedImageUrl(null);
    setShowDeleteConfirm(false);
    setDeleteError('');
    setShowUploadModal(false);
    setSelectedFile(null);
    setShowPinModal(false);
    setPendingDelete(false);
  };

  const handleCategorySelect = (e) => {
    const value = e.target.value;
    
    // Handle empty selection
    if (!value) {
      resetForm();
      return;
    }
    
    if (value === 'add-new') {
      setIsAddMode(true);
      setSelectedCategory(null);
      setCategoryName('');
      setSelectedImage(null);
    } else {
      const category = categories.find(c => c._id === value);
      if (category) {
        setSelectedCategory(category);
        setIsAddMode(false);
        setIsEditMode(false);
        setCategoryName(category.name);
        setSelectedImage(category.image);
      }
    }
  };

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (!selectedImage) {
      alert('Please select a category image');
      return;
    }

    // Use uploaded image URL or predefined image name
    const imageData = selectedImage === 'custom' ? uploadedImageUrl : selectedImage;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/categories`,
        { name: categoryName.trim(), image: imageData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchCategories();
        onSuccess(response.data.data.category);
        resetForm();
      }
    } catch (err) {
      console.error('Error adding category:', err);
      alert(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!categoryName.trim()) {
      alert('Please enter a category name');
      return;
    }

    if (!selectedImage) {
      alert('Please select a category image');
      return;
    }

    // Use uploaded image URL or predefined image name
    const imageData = selectedImage === 'custom' ? uploadedImageUrl : selectedImage;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_URL}/categories/${selectedCategory._id}`,
        { name: categoryName.trim(), image: imageData },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchCategories();
        onSuccess(response.data.data.category);
        setIsEditMode(false);
        setSelectedCategory(response.data.data.category);
      }
    } catch (err) {
      console.error('Error updating category:', err);
      alert(err.response?.data?.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async () => {
    // Show PIN verification modal
    setPendingDelete(true);
    setShowPinModal(true);
  };

  const handlePinVerified = async () => {
    try {
      setLoading(true);
      setDeleteError('');
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${API_URL}/categories/${selectedCategory._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await fetchCategories();
        resetForm();
        setShowDeleteConfirm(false);
        setShowPinModal(false);
        setPendingDelete(false);
      }
    } catch (err) {
      console.error('Error deleting category:', err);
      setDeleteError(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) {
      alert('Please select an image file');
      return;
    }

    try {
      setUploadingImage(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await axios.post(
        `${API_URL}/upload/category-image`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setUploadedImageUrl(response.data.data.imageUrl);
        setSelectedImage('custom');
        setShowUploadModal(false);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const getImageData = (imageName) => {
    // If it's a URL (custom uploaded image), return default styling
    if (imageName && imageName.startsWith('http')) {
      return { icon: null, color: 'from-gray-400 to-gray-600', isUrl: true };
    }
    return CATEGORY_IMAGES.find(img => img.name === imageName) || CATEGORY_IMAGES[0];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
          <h2 className="text-xl font-bold">Manage Categories</h2>
          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Select Category
            </label>
            <select
              value={selectedCategory?._id || ''}
              onChange={handleCategorySelect}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
              style={{ minHeight: '48px' }}
            >
              <option value="">-- Select a Category --</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
              <option value="add-new">+ Add New Category</option>
            </select>
          </div>

          {/* View/Edit Existing Category */}
          {selectedCategory && !isAddMode && (
            <div className="space-y-4">
              {/* Category Card */}
              <div className="bg-gray-50 rounded-lg p-6 border-2 border-gray-200">
                <div className="flex items-center gap-4">
                  {getImageData(selectedImage).isUrl ? (
                    <img
                      src={selectedImage}
                      alt={categoryName}
                      className="w-20 h-20 rounded-xl object-cover shadow-lg"
                    />
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getImageData(selectedImage).color} flex items-center justify-center text-4xl shadow-lg`}
                    >
                      {getImageData(selectedImage).icon}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{categoryName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Category</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {!isEditMode ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                    style={{ minHeight: '48px' }}
                  >
                    Edit Category
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                    style={{ minHeight: '48px' }}
                  >
                    Delete Category
                  </button>
                </div>
              ) : (
                /* Edit Form */
                <div className="space-y-4">
                  {/* Category Name Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={categoryName}
                      onChange={(e) => setCategoryName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                      placeholder="Enter category name"
                    />
                  </div>

                  {/* Image Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category Image
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {CATEGORY_IMAGES.map((img) => (
                        <button
                          key={img.name}
                          onClick={() => {
                            setSelectedImage(img.name);
                            setUploadedImageUrl(null);
                          }}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedImage === img.name
                              ? 'border-green-500 shadow-md'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className={`w-16 h-16 mx-auto rounded-lg bg-gradient-to-br ${img.color} flex items-center justify-center text-2xl mb-2`}
                          >
                            {img.icon}
                          </div>
                          <p className="text-xs text-gray-600 text-center font-medium">{img.name}</p>
                        </button>
                      ))}
                      
                      {/* Upload Custom Image Button */}
                      <button
                        onClick={() => setShowUploadModal(true)}
                        className={`p-4 rounded-lg border-2 border-dashed transition-all ${
                          selectedImage === 'custom'
                            ? 'border-green-500 bg-green-50 shadow-md'
                            : 'border-gray-300 hover:border-primary'
                        }`}
                      >
                        <div className="w-16 h-16 mx-auto rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <p className="text-xs text-gray-600 text-center font-medium">Upload</p>
                      </button>
                    </div>
                    
                    {/* Show uploaded image preview */}
                    {selectedImage === 'custom' && uploadedImageUrl && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-32 object-cover rounded-lg" />
                        <p className="text-xs text-green-700 mt-2 text-center font-medium">✓ Image uploaded</p>
                      </div>
                    )}
                  </div>

                  {/* Save/Cancel Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleUpdateCategory}
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ minHeight: '48px' }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditMode(false);
                        setCategoryName(selectedCategory.name);
                        setSelectedImage(selectedCategory.image);
                      }}
                      className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                      style={{ minHeight: '48px' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add New Category */}
          {isAddMode && (
            <div className="space-y-4">
              {/* Category Name Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                  placeholder="Enter category name"
                />
              </div>

              {/* Image Selector */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category Image
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {CATEGORY_IMAGES.map((img) => (
                    <button
                      key={img.name}
                      onClick={() => {
                        setSelectedImage(img.name);
                        setUploadedImageUrl(null);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedImage === img.name
                          ? 'border-green-500 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-16 h-16 mx-auto rounded-lg bg-gradient-to-br ${img.color} flex items-center justify-center text-2xl mb-2`}
                      >
                        {img.icon}
                      </div>
                      <p className="text-xs text-gray-600 text-center font-medium">{img.name}</p>
                    </button>
                  ))}
                  
                  {/* Upload Custom Image Button */}
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className={`p-4 rounded-lg border-2 border-dashed transition-all ${
                      selectedImage === 'custom'
                        ? 'border-green-500 bg-green-50 shadow-md'
                        : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <div className="w-16 h-16 mx-auto rounded-lg bg-gray-100 flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-600 text-center font-medium">Upload</p>
                  </button>
                </div>
                
                {/* Show uploaded image preview */}
                {selectedImage === 'custom' && uploadedImageUrl && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <img src={uploadedImageUrl} alt="Uploaded" className="w-full h-32 object-cover rounded-lg" />
                    <p className="text-xs text-green-700 mt-2 text-center font-medium">✓ Image uploaded</p>
                  </div>
                )}
              </div>

              {/* Add/Cancel Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddCategory}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '48px' }}
                >
                  {loading ? 'Adding...' : 'Add Category'}
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  style={{ minHeight: '48px' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Delete Confirmation Dialog */}
          {showDeleteConfirm && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-800 mb-2">Delete Category</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Are you sure you want to delete "<span className="font-semibold">{selectedCategory?.name}</span>"?
                  </p>
                  {deleteError && (
                    <p className="text-sm text-red-600 mb-3 font-medium bg-red-100 px-3 py-2 rounded">
                      {deleteError}
                    </p>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteCategory}
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteError('');
                      }}
                      className="flex-1 px-4 py-2.5 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PIN Verification Modal */}
      {showPinModal && (
        <PinVerificationModal
          isOpen={showPinModal}
          onClose={() => {
            setShowPinModal(false);
            setPendingDelete(false);
          }}
          onSuccess={handlePinVerified}
          actionType="category"
          itemName={selectedCategory?.name}
        />
      )}

      {/* Image Upload Modal Overlay */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-lg font-bold">Upload Custom Image</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* File Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    console.log('File selected:', e.target.files[0]);
                    handleFileSelect(e);
                  }}
                  capture="environment"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  id="category-image-upload"
                />
                <p className="text-xs text-gray-500 mt-1">Choose from gallery or take a photo</p>
              </div>

              {/* Preview */}
              {selectedFile && (
                <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                  <div className="flex items-center gap-3">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 font-medium truncate">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    console.log('Upload button clicked');
                    handleImageUpload();
                  }}
                  disabled={!selectedFile || uploadingImage}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ minHeight: '48px' }}
                >
                  {uploadingImage ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Uploading...
                    </span>
                  ) : (
                    'Upload & Use'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  style={{ minHeight: '48px' }}
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

export default ManageCategoriesModal;
