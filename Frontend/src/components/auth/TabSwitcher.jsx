import React from 'react';
import { motion } from 'framer-motion';
import { User, Car } from 'lucide-react';

const TabSwitcher = ({ activeTab, onTabChange, className = '' }) => {
  const tabs = [
    { id: 'user', label: 'User', icon: User },
    { id: 'driver', label: 'Driver', icon: Car }
  ];

  return (
    <div className={`flex bg-gray-100 rounded-xl p-1 mb-6 ${className}`}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 relative py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200
              flex items-center justify-center gap-2
              ${activeTab === tab.id 
                ? 'text-gray-900' 
                : 'text-gray-600 hover:text-gray-800'
              }
            `}
          >
            {activeTab === tab.id && (
              <motion.div
                className="absolute inset-0 bg-white rounded-lg shadow-sm"
                layoutId="activeTab"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabSwitcher;