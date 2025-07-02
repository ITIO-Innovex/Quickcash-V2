import React, { createContext, useState, ReactNode, useContext, useEffect } from 'react';

interface SettingsContextType {
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
}

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
    (localStorage.getItem('themeMode') as 'light' | 'dark') || 'light'
  );

  const toggleTheme = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('themeMode', newMode);
  };

  // Optional: Keep localStorage in sync even if theme changes elsewhere
  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
  }, [themeMode]);

  return (
    <SettingsContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </SettingsContext.Provider>
  );
};

//  Custom hook to access context easily
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
