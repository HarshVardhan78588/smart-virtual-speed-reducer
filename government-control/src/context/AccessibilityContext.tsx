import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilitySettings } from '../types';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  toggleHighContrast: () => void;
  setColorblindMode: (mode: AccessibilitySettings['colorblindMode']) => void;
  setFontSize: (size: AccessibilitySettings['fontSize']) => void;
  toggleReducedMotion: () => void;
}

const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  fontSize: 'normal',
  reducedMotion: false,
  colorblindMode: 'standard'
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('svsr_accessibility');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('svsr_accessibility', JSON.stringify(settings));
    
    // Apply classes to document root for global CSS adjustments
    const root = document.documentElement;
    
    if (settings.highContrast) {
      root.classList.add('high-contrast-mode');
    } else {
      root.classList.remove('high-contrast-mode');
    }

    root.classList.remove('font-scale-normal', 'font-scale-large', 'font-scale-extralarge');
    root.classList.add(`font-scale-${settings.fontSize}`);

    if (settings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    root.classList.remove(
      'cb-standard',
      'cb-deuteranopia',
      'cb-protanopia',
      'cb-tritanopia',
      'cb-monochrome'
    );
    root.classList.add(`cb-${settings.colorblindMode}`);
  }, [settings]);

  const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const toggleHighContrast = () => {
    setSettings(prev => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const setColorblindMode = (colorblindMode: AccessibilitySettings['colorblindMode']) => {
    setSettings(prev => ({ ...prev, colorblindMode }));
  };

  const setFontSize = (fontSize: AccessibilitySettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const toggleReducedMotion = () => {
    setSettings(prev => ({ ...prev, reducedMotion: !prev.reducedMotion }));
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSettings,
        toggleHighContrast,
        setColorblindMode,
        setFontSize,
        toggleReducedMotion
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
