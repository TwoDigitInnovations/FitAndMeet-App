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

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', 
    fallbackLng: 'en',
    debug: __DEV__, 
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  });


export const changeLanguage = (languageCode) => {
  i18n.changeLanguage(languageCode);
  AsyncStorage.setItem('user-language', languageCode);
};


AsyncStorage.getItem('user-language').then((savedLanguage) => {
  if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
    i18n.changeLanguage(savedLanguage);
  }
});

export default i18n;