import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: {
    translation: en,
  },
  fr: {
    translation: fr,
  },
};

// Initialize i18n with saved language
const initI18n = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    const initialLanguage = (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) ? savedLanguage : 'fr';
    
    console.log('Initializing i18n with language:', initialLanguage);
    
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: initialLanguage,
        fallbackLng: 'fr',
        debug: __DEV__,
        react: {
          useSuspense: false,
        },
        interpolation: {
          escapeValue: false,
        },
      });
  } catch (error) {
    console.error('Error initializing i18n:', error);
    // Fallback to default initialization
    i18n
      .use(initReactI18next)
      .init({
        resources,
        lng: 'fr',
        fallbackLng: 'fr',
        debug: __DEV__,
        react: {
          useSuspense: false,
        },
        interpolation: {
          escapeValue: false,
        },
      });
  }
};

// Initialize i18n
initI18n();

// Export function to change and save language
export const changeLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('user-language', languageCode);
    console.log('Language changed and saved:', languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export default i18n;