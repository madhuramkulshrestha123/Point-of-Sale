import React, { useState, useRef, useEffect } from 'react';

const BarcodeScanner = ({ onScan }) => {
  const [barcode, setBarcode] = useState('');
  const inputRef = useRef(null);
  
  // Keep focus on barcode input
  useEffect(() => {
    const keepFocus = () => {
      if (document.activeElement !== inputRef.current && barcode.length === 0) {
        inputRef.current?.focus();
      }
    };
    
    const interval = setInterval(keepFocus, 1000);
    return () => clearInterval(interval);
  }, [barcode]);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && barcode.trim().length > 0) {
      e.preventDefault();
      onScan(barcode.trim());
      setBarcode('');
      
      // Refocus after clearing
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };
  
  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={barcode}
        onChange={(e) => setBarcode(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="📷 Scan barcode or type SKU..."
        className="w-full px-4 py-3 text-sm border-2 border-primary-light rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-gradient-to-r from-accent/20 to-secondary/20 focus:from-white focus:to-white transition-all shadow-sm font-medium"
        autoFocus
      />
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary-dark text-xs font-bold bg-accent px-2 py-1 rounded-lg animate-pulse">
        🔴 LIVE
      </div>
    </div>
  );
};

export default BarcodeScanner;
