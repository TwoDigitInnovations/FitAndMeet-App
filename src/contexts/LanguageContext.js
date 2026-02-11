import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage } from '../i18n';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'fr');

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('user-language');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
          setCurrentLanguage(savedLanguage);
          await i18n.changeLanguage(savedLanguage);
        } else {
          // Set default to French if no saved language
          setCurrentLanguage('fr');
          await i18n.changeLanguage('fr');
        }
      } catch (error) {
        console.error('Error loading saved language:', error);
      }
    };

    loadSavedLanguage();
  }, []);

  const switchLanguage = async (languageCode) => {
    try {
      setCurrentLanguage(languageCode); // Update state first for immediate UI update
      await changeLanguage(languageCode);
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };

  const value = {
    currentLanguage,
    switchLanguage,
    isRTL: currentLanguage === 'ar' || currentLanguage === 'he',
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};