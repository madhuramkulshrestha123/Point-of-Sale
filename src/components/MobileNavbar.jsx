import React from 'react';

const MobileNavbar = ({ activeMenu, onMenuClick }) => {
  const menuItems = [
    { id: 'pos', name: 'POS', icon: '🛒' },
    { id: 'inventory', name: 'Inventory', icon: '📦' },
    { id: 'analytics', name: 'Analytics', icon: '📊' },
    { id: 'payments', name: 'Payments', icon: '💳' },
    { id: 'crm', name: 'CRM', icon: '❤️' },
  ];

  const handleMenuClick = (menuId) => {
    onMenuClick(menuId);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16">
        {menuItems.map((item) => {
          const isActive = activeMenu === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 ${
                isActive
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
              }`}
            >
              <span className={`text-2xl mb-1 transition-transform duration-200 ${
                isActive ? 'scale-110' : ''
              }`}>
                {item.icon}
              </span>
              <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-green-600 rounded-b" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavbar;
