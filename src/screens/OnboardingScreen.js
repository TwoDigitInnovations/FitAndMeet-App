import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {useTranslation} from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';

const onboardingData = [
  {
    id: 1,
    image: require('../Assets/images/img1.png'),
    titleKey: 'onboarding.screen1.title',
    descriptionKey: 'onboarding.screen1.description',
  },
  {
    id: 2,
    image: require('../Assets/images/img2.png'),
    titleKey: 'onboarding.screen2.title',
    descriptionKey: 'onboarding.screen2.description',
  },
  {
    id: 3,
    image: require('../Assets/images/img3.png'),
    titleKey: 'onboarding.screen3.title',
    descriptionKey: 'onboarding.screen3.description',
  },
];

const OnboardingScreen = ({navigation}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const {t} = useTranslation();

  const handleNext = () => {
    if (currentIndex < onboardingData.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('Auth');
    }
  };

  const handleSkip = () => {
    navigation.replace('Auth');
  };

  const currentScreen = onboardingData[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#010918" 
        barStyle="light-content"
        translucent={false}
      />

      <View style={styles.header}>
        <LanguageSelector />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={currentScreen.image}
          style={styles.image}
          resizeMode="contain"
        />

        <Text style={styles.title}>{t(currentScreen.titleKey)}</Text>
        <Text style={styles.description}>{t(currentScreen.descriptionKey)}</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {currentIndex === onboardingData.length - 1
              ? t('common.complete_profile')
              : t('common.next')}
          </Text>
        </TouchableOpacity>

        {currentIndex !== onboardingData.length - 1 && (
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010918',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  image: {
    width: 300,
    height: 300,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  bottomSection: {
    paddingBottom: 70,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginTop: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A3A3C',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#F23576',
    width: 8,
  },
  nextButton: {
    backgroundColor: '#F23576',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
    minWidth: 250,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;
