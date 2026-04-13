import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import POSPage from './components/POSPage';
import PaymentPage from './components/PaymentPage';
import EmployeePage from './pages/EmployeePage';
import OfflineBanner from './components/OfflineBanner';
import PWAInstallPrompt from './components/PWAInstallPrompt';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setIsAuthenticated(true);
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    }

    // Listen for storage changes (in case user data is updated in another tab or component)
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (error) {
          console.error('Failed to parse updated user data:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Create a custom event listener for profile updates
    const handleProfileUpdate = () => {
      const updatedUser = localStorage.getItem('user');
      if (updatedUser) {
        try {
          setUser(JSON.parse(updatedUser));
        } catch (error) {
          console.error('Failed to parse updated user data:', error);
        }
      }
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshUserData = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    }
  };

  if (!isAuthenticated) {
    return showLogin ? (
      <Login onSwitchToRegister={() => setShowLogin(false)} />
    ) : (
      <Register onSwitchToLogin={() => setShowLogin(true)} />
    );
  }

  return (
    <Router>
      <div className="App">
        <OfflineBanner />
        <PWAInstallPrompt />
        {!isAuthenticated ? (
          !showLogin ? (
            <Register onSwitchToLogin={() => setShowLogin(true)} />
          ) : (
            <Login onSwitchToRegister={() => setShowLogin(false)} />
          )
        ) : (
          <Routes>
            <Route path="/" element={<POSPage user={user} onLogout={handleLogout} onRefreshUser={refreshUserData} />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/employees" element={<EmployeePage />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
