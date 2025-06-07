import React from 'react';
import { Button } from '@/components/ui/button';

type Tab = 'dashboard' | 'tasks' | 'items' | 'members';

interface HeaderProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  children?: React.ReactNode;
  userName?: string;
  userAvatar?: string;
  userColor?: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, children, userName, userAvatar, userColor }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'items', label: 'Inventory', icon: '📦' },
    { id: 'members', label: 'Members', icon: '👥' },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">HomeHarmony</h1>
              <p className="text-sm text-gray-500">Shared Living Made Simple</p>
            </div>
          </div>
          
          <nav className="flex space-x-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "default" : "ghost"}
                onClick={() => setActiveTab(tab.id as Tab)}
                className="flex items-center space-x-2 transition-all duration-200"
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-4 ml-4">
            {userName && (
              <span className="flex items-center text-gray-700 font-medium">
                {userAvatar && (
                  <span className={`mr-2 w-7 h-7 rounded-full flex items-center justify-center text-lg ${userColor ?? ''}`}>{userAvatar}</span>
                )}
                {userName}
              </span>
            )}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};
