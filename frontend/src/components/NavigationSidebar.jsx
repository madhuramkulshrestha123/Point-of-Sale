import React, { useState } from 'react';
import ProfileModal from './ProfileModal';

const menuItems = [
  { id: 'pos', name: 'Point of Sale', icon: '🛒', active: true },
  { id: 'payments', name: 'Payments', icon: '💳' },
  { id: 'inventory', name: 'Inventory Management', icon: '📦' },
  { id: 'analytics', name: 'Sales Analytics', icon: '📊' },
  { id: 'employee', name: 'Employee Management', icon: '👥' },
  { id: 'crm', name: 'CRM & Customer Loyalty', icon: '❤️' },
  { id: 'multistore', name: 'Multi-store Management', icon: '🏪' },
  { id: 'integrations', name: 'Integrations', icon: '🔗' },
];

const NavigationSidebar = ({ onMenuClick, activeMenu, user, onLogout }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={`h-full flex flex-col bg-white border-r border-primary-light/30 shadow-lg transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="p-5 border-b border-primary-light/30 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              {user?.businessName || 'AutoParts'}
            </h1>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-accent/30 rounded-lg transition-colors"
            title={isCollapsed ? 'Expand menu' : 'Collapse menu'}
          >
            {isCollapsed ? '→' : '←'}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onMenuClick(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group ${
              activeMenu === item.id
                ? 'bg-gradient-to-r from-primary to-primary-dark text-white shadow-md scale-105'
                : 'bg-gray-50 text-gray-700 hover:bg-accent/30 hover:shadow-sm'
            }`}
            title={item.name}
          >
            <span className="text-2xl flex-shrink-0">{item.icon}</span>
            {!isCollapsed && (
              <span className="font-semibold text-sm truncate">{item.name}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer - User Profile */}
      <div className="p-4 border-t border-primary-light/30 bg-gradient-to-br from-accent/20 to-secondary/20">
        <button
          onClick={() => setShowProfile(true)}
          className={`flex items-center gap-3 w-full hover:bg-white/50 rounded-lg p-2 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          title="View Profile"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold shadow-md">
            {user?.businessName?.charAt(0).toUpperCase() || 'A'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-bold text-gray-800 truncate">{user?.businessName || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.businessId || 'ID'}</p>
            </div>
          )}
        </button>
      </div>

      {/* Logout Button */}
      {!isCollapsed && (
        <div className="px-4 pb-4">
          <button
            onClick={onLogout}
            className="w-full py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
          >
            🚪 Logout
          </button>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <ProfileModal
          isOpen={showProfile}
          user={user}
          onClose={() => {
            console.log('NavigationSidebar: Closing profile modal');
            setShowProfile(false);
          }}
          onUpdate={(updatedUser) => {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          }}
        />
      )}
    </div>
  );
};

export default NavigationSidebar;
