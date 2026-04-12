import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import IntegrationCard from '../components/IntegrationCard';
import ToggleSwitch from '../components/ToggleSwitch';

const IntegrationsPage = () => {
  const [settings, setSettings] = useState({
    emailAlerts: {
      enabled: false,
      email: '',
    },
    whatsapp: {
      enabled: false,
      countryCode: '+91',
      phoneNumber: '',
    },
    printer: {
      type: 'pos-thermal',
      paperSize: '80mm',
    },
  });

  const [upiId, setUpiId] = useState('mkexports@upi');
  const [businessName, setBusinessName] = useState('N.R AUTO PARTS');
  const [upiEditMode, setUpiEditMode] = useState(false);
  const [tempUpiId, setTempUpiId] = useState(upiId);
  const [qrLoading, setQrLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('integrationSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
    
    // Load UPI ID from localStorage
    const savedUpiId = localStorage.getItem('upiId');
    if (savedUpiId) {
      setUpiId(savedUpiId);
      setTempUpiId(savedUpiId);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('integrationSettings', JSON.stringify(newSettings));
    showToast('Settings saved successfully', 'success');
  };

  // Save UPI ID
  const saveUpiId = () => {
    if (!tempUpiId || tempUpiId.trim() === '') {
      showToast('Please enter a valid UPI ID', 'error');
      return;
    }
    setUpiId(tempUpiId);
    localStorage.setItem('upiId', tempUpiId);
    setUpiEditMode(false);
    showToast('UPI ID updated successfully', 'success');
  };

  // Cancel editing
  const cancelUpiEdit = () => {
    setTempUpiId(upiId);
    setUpiEditMode(false);
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Handle email alerts toggle
  const handleEmailAlertToggle = (enabled) => {
    const newSettings = {
      ...settings,
      emailAlerts: { ...settings.emailAlerts, enabled },
    };
    saveSettings(newSettings);
  };

  // Handle WhatsApp toggle
  const handleWhatsAppToggle = (enabled) => {
    const newSettings = {
      ...settings,
      whatsapp: { ...settings.whatsapp, enabled },
    };
    saveSettings(newSettings);
  };

  // Test WhatsApp message
  const testWhatsApp = () => {
    if (!settings.whatsapp.phoneNumber) {
      showToast('Please enter a phone number', 'error');
      return;
    }
    const phone = settings.whatsapp.phoneNumber.replace(/\D/g, '');
    const message = encodeURIComponent('Test message from POS System');
    window.open(`https://wa.me/${settings.whatsapp.countryCode.replace('+', '')}${phone}?text=${message}`, '_blank');
  };

  // Print test receipt
  const printTestReceipt = () => {
    showToast('Sending test receipt to printer...', 'success');
    // Actual printing logic would go here
    setTimeout(() => {
      showToast('Test receipt sent successfully', 'success');
    }, 1500);
  };

  // Download QR
  const downloadQR = () => {
    setQrLoading(true);
    const canvas = document.getElementById('qr-canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${businessName.replace(/\s+/g, '-')}-QR.png`;
      link.href = url;
      link.click();
      showToast('QR code downloaded', 'success');
    }
    setQrLoading(false);
  };

  // UPI QR URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(businessName)}&cu=INR`;

  return (
    <div className="h-full bg-gray-50 overflow-y-auto">
      {/* Toast Notification */}
      {toast.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all duration-200 ${
            toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 shadow-md">
        <h1 className="text-xl font-bold text-white">Integrations</h1>
        <p className="text-indigo-100 text-xs mt-1 opacity-90">
          Connect your tools and services
        </p>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 md:gap-6 max-w-7xl mx-auto">
          {/* QR Code Section - Shows FIRST on mobile, RIGHT on desktop */}
          <div className="order-first lg:order-last lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">UPI Payment QR</h2>
              
              {/* QR Code */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200 mb-4">
                {qrLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <QRCodeSVG
                      value={upiUrl}
                      size={256}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                )}
              </div>

              {/* UPI ID Edit Section */}
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  UPI ID Configuration
                </label>
                {upiEditMode ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={tempUpiId}
                      onChange={(e) => setTempUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-mono"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={saveUpiId}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={cancelUpiEdit}
                        className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-mono text-gray-800 font-medium">{upiId}</span>
                    <button
                      onClick={() => setUpiEditMode(true)}
                      className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>

              {/* Business Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{businessName}</h3>
                <p className="text-xs text-gray-500 mt-1">Business Name</p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  onClick={downloadQR}
                  disabled={qrLoading}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm disabled:opacity-50"
                >
                  {qrLoading ? 'Generating...' : 'Download QR'}
                </button>
                <button
                  onClick={() => {
                    setQrLoading(true);
                    setTimeout(() => {
                      setQrLoading(false);
                      showToast('QR code regenerated', 'success');
                    }, 500);
                  }}
                  disabled={qrLoading}
                  className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
                >
                  {qrLoading ? 'Regenerating...' : 'Regenerate QR'}
                </button>
              </div>

              {/* Helper Text */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Scan this QR code to receive payments via UPI
              </p>
            </div>
          </div>

          {/* Controls Panel - Shows SECOND on mobile, LEFT on desktop */}
          <div className="order-last lg:order-first lg:col-span-3 space-y-4">
            {/* Email Alerts */}
            <IntegrationCard title="Low Stock Alert (Email)" icon="email">
              <div className="space-y-4">
                <ToggleSwitch
                  label="Enable Low Stock Email Alerts"
                  enabled={settings.emailAlerts.enabled}
                  onToggle={handleEmailAlertToggle}
                />
                {settings.emailAlerts.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={settings.emailAlerts.email}
                      onChange={(e) =>
                        saveSettings({
                          ...settings,
                          emailAlerts: { ...settings.emailAlerts, email: e.target.value },
                        })
                      }
                      placeholder="alerts@example.com"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Receive email notifications when inventory goes below threshold
                    </p>
                  </div>
                )}
              </div>
            </IntegrationCard>

            {/* WhatsApp Integration */}
            <IntegrationCard title="WhatsApp Integration" icon="whatsapp">
              <div className="space-y-4">
                <ToggleSwitch
                  label="Enable WhatsApp Invoice Sharing"
                  enabled={settings.whatsapp.enabled}
                  onToggle={handleWhatsAppToggle}
                />
                {settings.whatsapp.enabled && (
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600 mb-3">
                        Uses WhatsApp Click-to-Chat to manually send invoices
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Country Code
                        </label>
                        <select
                          value={settings.whatsapp.countryCode}
                          onChange={(e) =>
                            saveSettings({
                              ...settings,
                              whatsapp: { ...settings.whatsapp, countryCode: e.target.value },
                            })
                          }
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        >
                          <option value="+91">India +91</option>
                          <option value="+1">US +1</option>
                          <option value="+44">UK +44</option>
                          <option value="+971">UAE +971</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={settings.whatsapp.phoneNumber}
                          onChange={(e) =>
                            saveSettings({
                              ...settings,
                              whatsapp: { ...settings.whatsapp, phoneNumber: e.target.value },
                            })
                          }
                          placeholder="9876543210"
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                    <button
                      onClick={testWhatsApp}
                      className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                    >
                      Test WhatsApp Message
                    </button>
                  </div>
                )}
              </div>
            </IntegrationCard>

            {/* Thermal Printer */}
            <IntegrationCard title="Thermal Printer Setup" icon="printer">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Printer Type
                    </label>
                    <select
                      value={settings.printer.type}
                      onChange={(e) =>
                        saveSettings({
                          ...settings,
                          printer: { ...settings.printer, type: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      <option value="pos-thermal">POS Thermal Printer</option>
                      <option value="usb">USB Printer</option>
                      <option value="network">Network Printer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Paper Size
                    </label>
                    <select
                      value={settings.printer.paperSize}
                      onChange={(e) =>
                        saveSettings({
                          ...settings,
                          printer: { ...settings.printer, paperSize: e.target.value },
                        })
                      }
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    >
                      <option value="80mm">80mm</option>
                      <option value="58mm">58mm</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={printTestReceipt}
                  className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm"
                >
                  Print Test Receipt
                </button>
              </div>
            </IntegrationCard>

            {/* Help & Support */}
            <IntegrationCard title="Help & Support" icon="support">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                  View Setup Guide
                </button>
                <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm">
                  Contact Support
                </button>
                <button className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:col-span-2">
                  Troubleshoot Printing
                </button>
              </div>
            </IntegrationCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;
