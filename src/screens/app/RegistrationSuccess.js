import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
} from 'react-native';
import {useTranslation} from 'react-i18next';

const RegistrationSuccess = ({navigation}) => {
  const {t} = useTranslation();
  
  const handleDone = () => {
    
    navigation.reset({
      index: 0,
      routes: [{name: 'App'}],
    });
  };

  return (
    <ImageBackground
      source={require('../../Assets/images/success.png')}
      style={styles.container}
      resizeMode="cover">
      <StatusBar
        backgroundColor="transparent"
        barStyle="light-content"
        translucent={true}
      />

      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('registrationsuccess.title')}</Text>

          <View style={styles.checkContainer}>
            <Image
              source={require('../../Assets/images/check.png')}
              style={styles.checkIcon}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.subtitle}>
            {t('registrationsuccess.subtitle')}
          </Text>

          <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
            <Text style={styles.doneButtonText}>{t('registrationsuccess.done_button')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
  },
  checkContainer: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  checkIcon: {
    width: 80,
    height: 80,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  doneButton: {
    backgroundColor: 'transparent',
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 30,
    minWidth: 150,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF3B6D',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});

export default RegistrationSuccess;
