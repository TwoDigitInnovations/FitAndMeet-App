import React, {createContext, useContext, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({children}) => {
  const {i18n} = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setCurrentLanguage(lng);
      AsyncStorage.setItem('user-language', lng);
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [i18n]);

  const changeLanguage = (languageCode) => {
    i18n.changeLanguage(languageCode);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    isRTL: currentLanguage === 'ar' || currentLanguage === 'he', 
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;