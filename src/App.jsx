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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
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
            <Route path="/" element={<POSPage user={user} onLogout={handleLogout} />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/employees" element={<EmployeePage />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
