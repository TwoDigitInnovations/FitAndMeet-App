import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';


const WelcomeScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleSignUp = () => {
    navigation.navigate('SignUp');
  };

  const handleSignIn = () => {
    navigation.navigate('SignIn');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        backgroundColor="#010918"
        barStyle="light-content"

      />

      {/* Language Selector */}
      <View style={[styles.languageContainer, { top: Platform.OS === 'android' ? insets.top + 10 : 10 }]}>
        <LanguageSelector />
      </View>

      <Image
        source={require('../Assets/images/img4.png')}
        style={styles.image}
        resizeMode="cover"
      />

      <Image
        source={require('../Assets/images/shadow.png')}
        style={styles.shadowImage}
        resizeMode="stretch"
      />

      <View style={styles.bottomCard}>
        <View style={styles.titleContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../Assets/images/newlogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>{t('welcome.title')}</Text>
        </View>

        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

        <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
          <Text style={styles.signUpButtonText}>{t('common.sign_up')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
          <Text style={styles.signInButtonText}>{t('common.sign_in')}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.termsText}>
        {t('welcome.terms_text')}{' '}
        <Text
          style={styles.termsLink}
          onPress={() => navigation.navigate('TermsAndConditions')}
        >
          {t('welcome.terms_link')}
        </Text>
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010918',
  },
  languageContainer: {
    position: 'absolute',
    // top: languageTopPosition,
    left: 20,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '62%',
    position: 'absolute',
    top: 0,
  },
  shadowImage: {
    position: 'absolute',
    bottom: -10,
    width: '100%',
    height: 500,
    zIndex: 1,
    opacity: 1,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 120,
    alignItems: 'center',
    zIndex: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  logoContainer: {
    width: 25,
    height: 25,
    backgroundColor: '#010918',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  logo: {
    width: 30,
    height: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 60,
    marginTop: 2,
    textAlign: 'center',
  },
  signUpButton: {
    backgroundColor: '#F23576',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 18,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signInButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F23576',
    marginBottom: 40,
  },
  signInButtonText: {
    color: '#F23576',
    fontSize: 16,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    position: 'absolute',
    bottom: 40,
    width: '100%',
    zIndex: 3,
    paddingHorizontal: 20,
  },
  termsLink: {
    color: '#F23576',
    fontWeight: '500',
  },
});

export default WelcomeScreen;
