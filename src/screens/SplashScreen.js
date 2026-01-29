import React, {useEffect} from 'react';
import {View, Image, StyleSheet, StatusBar} from 'react-native';

const SplashScreen = ({navigation}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
    
      navigation.replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor="#010918" 
        barStyle="light-content"
        translucent={false}
      />
      <Image
        source={require('../Assets/images/newlogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010918',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 250,
  },
});

export default SplashScreen;
