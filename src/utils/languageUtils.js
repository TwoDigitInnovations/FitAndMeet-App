import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const changeLanguage = async (languageCode) => {
  try {
    await i18n.changeLanguage(languageCode);
    await AsyncStorage.setItem('user-language', languageCode);
  } catch (error) {
    console.error('Error changing language:', error);
  }
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const getSupportedLanguages = () => {
  return [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];
};

export const isRTL = (languageCode = null) => {
  const lang = languageCode || i18n.language;
  return ['ar', 'he', 'fa'].includes(lang);
};