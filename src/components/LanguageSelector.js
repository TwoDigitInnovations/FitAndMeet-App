import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import { useLanguage } from '../contexts/LanguageContext';

const {width, height} = Dimensions.get('window');

// Static language definitions to avoid flickering during language switch
const LANGUAGES = [
  {code: 'en', name: 'English', flag: '🇺🇸'},
  {code: 'fr', name: 'Français', flag: '🇫🇷'},
];

const LanguageSelector = () => {
  const {t} = useTranslation();
  const { currentLanguage, switchLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const changeLanguage = async (languageCode) => {
    setModalVisible(false);
    await switchLanguage(languageCode);
  };

  const getCurrentLanguage = () => {
    const currentLang = LANGUAGES.find(lang => lang.code === currentLanguage);
    return currentLang || LANGUAGES[1]; // Default to French
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.languageButton}
        onPress={() => setModalVisible(true)}>
        <Text style={styles.languageButtonText}>
          {getCurrentLanguage().flag} {getCurrentLanguage().name}
        </Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('common.language')}</Text>
            
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedLanguage,
                ]}
                onPress={() => changeLanguage(language.code)}>
                <Text style={styles.flagText}>{language.flag}</Text>
                <Text
                  style={[
                    styles.languageText,
                    currentLanguage === language.code && styles.selectedLanguageText,
                  ]}>
                  {language.name}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  languageButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  languageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 20,
    width: width * 0.8,
    maxWidth: 300,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    width: '100%',
    borderRadius: 10,
    marginVertical: 5,
  },
  selectedLanguage: {
    backgroundColor: '#F23576',
  },
  flagText: {
    fontSize: 24,
    marginRight: 15,
  },
  languageText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default LanguageSelector;