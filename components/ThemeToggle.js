// components/ThemeToggle.js

import { useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  // Use the theme value directly from the provider, no local state needed
  const { theme, toggleTheme, setThemeMode } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);

  const themes = [
    { name: 'Light', value: 'light', icon: Sun },
    { name: 'Dark', value: 'dark', icon: Moon },
    { name: 'System', value: 'system', icon: Monitor },
  ];

  const handleThemeChange = (themeValue) => {
    setThemeMode(themeValue);
    setShowDropdown(false);
  };

  const getCurrentIcon = () => {
    // Find the icon based on the current theme from the provider
    const themeConfig = themes.find(t => t.value === theme);
    // Use the theme value from the provider, or default to Sun
    return themeConfig ? themeConfig.icon : Sun; 
  };

  const CurrentIcon = getCurrentIcon();

  return (
    <div className="relative">
      {/* Simple toggle button for mobile */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 md:hidden"
        aria-label="Toggle theme"
      >
        <CurrentIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
      </button>

      {/* Dropdown for desktop */}
      <div className="hidden md:block">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          aria-label="Theme options"
          aria-expanded={showDropdown}
          aria-haspopup="true"
        >
          <CurrentIcon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {showDropdown && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowDropdown(false)}
            />
            
            {/* Dropdown menu */}
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-elegant border border-gray-200 dark:border-gray-700 py-1 z-20 animate-fade-in">
              {themes.map((themeOption) => {
                const IconComponent = themeOption.icon;
                const isActive = theme === themeOption.value; // Corrected: Use theme from provider
                
                return (
                  <button
                    key={themeOption.value}
                    onClick={() => handleThemeChange(themeOption.value)}
                    className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-3 transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{themeOption.name}</span>
                    {isActive && (
                      <div className="ml-auto w-2 h-2 bg-primary-600 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}