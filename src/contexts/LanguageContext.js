import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { changeLanguage } from '../i18n';
import apiService from '../services/apiService';

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
      setCurrentLanguage(languageCode);
      await changeLanguage(languageCode);
      
      try {
        await apiService.Put('api/auth/update-language', { 
          preferredLanguage: languageCode 
        });
      } catch (apiError) {
        console.error('Error updating language on backend:', apiError);
      }
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