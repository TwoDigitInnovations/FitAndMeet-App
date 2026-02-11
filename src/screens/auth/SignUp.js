import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../../services/apiService';
import CountryPicker from 'react-native-country-picker-modal';
import {useTranslation} from 'react-i18next';

const SignUp = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(52);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneLength, setPhoneLength] = useState(10); // Default US phone length
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const {t} = useTranslation();

 
  const getPhoneLength = (country) => {
    const phoneLengths = {
      US: 10,    // United States
      IN: 10,    // India
      GB: 10,    // United Kingdom
      CA: 10,    // Canada
      AU: 9,     // Australia
      CN: 11,    // China
      JP: 10,    // Japan
      DE: 11,    // Germany
      FR: 9,     // France
      BR: 11,    // Brazil
      MX: 10,    // Mexico
      IT: 10,    // Italy
      ES: 9,     // Spain
      KR: 10,    // South Korea
      RU: 10,    // Russia
      SA: 9,     // Saudi Arabia
      AE: 9,     // UAE
      SG: 8,     // Singapore
      MY: 10,    // Malaysia
      TH: 9,     // Thailand
      PH: 10,    // Philippines
      ID: 11,    // Indonesia
      VN: 9,     // Vietnam
      PK: 10,    // Pakistan
      BD: 10,    // Bangladesh
      NG: 10,    // Nigeria
      ZA: 9,     // South Africa
      EG: 10,    // Egypt
      TR: 10,    // Turkey
      AR: 10,    // Argentina
      CL: 9,     // Chile
      CO: 10,    // Colombia
      PE: 9,     // Peru
      NZ: 9,     // New Zealand
      PL: 9,     // Poland
      NL: 9,     // Netherlands
      BE: 9,     // Belgium
      SE: 9,     // Sweden
      NO: 8,     // Norway
      DK: 8,     // Denmark
      FI: 9,     // Finland
      IE: 9,     // Ireland
      PT: 9,     // Portugal
      GR: 10,    // Greece
      CZ: 9,     // Czech Republic
      RO: 10,    // Romania
      HU: 9,     // Hungary
      AT: 11,    // Austria
      CH: 9,     // Switzerland
      IL: 9,     // Israel
      QA: 8,     // Qatar
      KW: 8,     // Kuwait
      OM: 8,     // Oman
      BH: 8,     // Bahrain
      JO: 9,     // Jordan
      LB: 8,     // Lebanon
      KE: 10,    // Kenya
      GH: 10,    // Ghana
      TZ: 9,     // Tanzania
      UG: 9,     // Uganda
      ET: 9,     // Ethiopia
    };
    return phoneLengths[country] || 10; 
  };

  useEffect(() => {
    if (showOTP && timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [showOTP, timer]);

  const handleBack = () => {
    if (showOTP) {
      setShowOTP(false);
      setOtp(['', '', '', '']);
      setTimer(52);
    } else {
      navigation.goBack();
    }
  };

  const handleContinueWithEmail = () => {
    console.log('Continue with email');
  };

  const handlePhoneSubmit = async () => {
    const expectedLength = getPhoneLength(countryCode);
    
    if (phoneNumber.length !== expectedLength) {
      Alert.alert(
        t('auth.otp.invalid_phone'), 
        t('auth.otp.invalid_phone_message', {length: expectedLength})
      );
      return;
    }

    setLoading(true);
    try {
      const response = await apiService.PostPublic('api/auth/send-otp', {
        phoneNumber,
        countryCode: `+${callingCode}`,
        isSignIn: false, // This is signup
      });

      console.log('OTP Response:', response);

      if (response.success) {
        setUserId(response.userId);
        setShowOTP(true);
        
        if (response.continueRegistration) {
          Alert.alert(
            'Continue Registration', 
            'Complete your registration process.\nUse 0000 as OTP for testing'
          );
        } else {
          Alert.alert(t('auth.otp.otp_sent'), t('auth.otp.otp_sent_message'));
        }
      } else {
        if (response.accountExists) {
          Alert.alert(
            'Account Exists', 
            response.message + '\n\nWould you like to sign in instead?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign In', onPress: () => navigation.navigate('SignIn') }
            ]
          );
        } else {
          Alert.alert(t('auth.otp.error'), response.message || t('auth.otp.failed_send_otp'));
        }
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert(t('auth.otp.error'), t('auth.otp.failed_send_otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = async (value, index) => {
    if (value.length > 1) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }

    // Check if all OTP digits are filled
    if (value && index === 3) {
      const fullOtp = [...newOtp.slice(0, 3), value].join('');
      if (fullOtp.length === 4) {
       
        await verifyOTP(fullOtp);
      }
    }
  };

  const verifyOTP = async (otpCode) => {
    setLoading(true);
    try {
      const response = await apiService.PostPublic('api/auth/verify-otp', {
        phoneNumber,
        otp: otpCode,
      });

      console.log('Verify OTP Response:', response);

      if (response.success) {
        // Save user details to AsyncStorage
        await AsyncStorage.setItem('userDetail', JSON.stringify({
          token: response.token,
          user: response.user,
        }));

        // Navigate based on profile completion status
        setTimeout(() => {
          if (response.user.profileCompleted) {
            // User has completed profile, go to home
            navigation.navigate('Home');
          } else {
            // User needs to complete registration, navigate to appropriate screen
            const nextScreen = response.nextScreen || 'SelectGym';
            navigation.navigate(nextScreen);
          }
        }, 500);
      } else {
        Alert.alert(t('auth.otp.invalid_otp'), response.message || t('auth.otp.invalid_otp_message'));
        setOtp(['', '', '', '']);
        otpRefs[0].current?.focus();
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert(t('auth.otp.error'), t('auth.otp.failed_verify_otp'));
      setOtp(['', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      const response = await apiService.PostPublic('api/auth/send-otp', {
        phoneNumber,
        countryCode: `+${callingCode}`,
      });

      if (response.success) {
        setTimer(52);
        setOtp(['', '', '', '']);
        Alert.alert(t('auth.otp.otp_sent'), t('auth.otp.otp_sent_message'));
      } else {
        Alert.alert(t('auth.otp.error'), response.message || t('auth.otp.failed_send_otp'));
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert(t('auth.otp.error'), t('auth.otp.failed_send_otp'));
    } finally {
      setLoading(false);
    }
  };

  if (showOTP) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Image
              source={require('../../Assets/images/back.png')}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <Text style={styles.title}>{t('auth.otp.title')}</Text>
          <Text style={styles.subtitle}>
            {t('auth.otp.subtitle')}
          </Text>
          <Text style={styles.phoneDisplay}>+{callingCode}-{phoneNumber}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={otpRefs[index]}
                style={styles.otpBox}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleOtpKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleResendOTP}
            disabled={timer > 0 || loading}
            style={styles.resendContainer}>
            <Text style={[styles.resendText, timer > 0 && styles.resendDisabled]}>
              {t('auth.otp.resend_text')}
            </Text>
            <Text style={[styles.timerText, timer > 0 && styles.resendDisabled]}>
              00:{timer.toString().padStart(2, '0')}
            </Text>
          </TouchableOpacity>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FF3B6D" />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('../../Assets/images/back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <Text style={styles.title}>{t('auth.signup.title')}</Text>

        <View style={styles.phoneContainer}>
          <TouchableOpacity 
            style={styles.countryCode}
            onPress={() => setShowCountryPicker(true)}>
            <CountryPicker
              countryCode={countryCode}
              withFilter
              withFlag
              withCallingCode
              withEmoji
              onSelect={(country) => {
                setCountryCode(country.cca2);
                setCallingCode(country.callingCode[0]);
                setPhoneLength(getPhoneLength(country.cca2));
                setPhoneNumber(''); 
              }}
              visible={showCountryPicker}
              onClose={() => setShowCountryPicker(false)}
            />
            <Text style={styles.countryCodeText}>+{callingCode}</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.phoneInput}
            placeholder={t('auth.signup.phone_placeholder')}
            placeholderTextColor="#A0A0A0"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            onSubmitEditing={handlePhoneSubmit}
            maxLength={phoneLength}
          />
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>{t('auth.signup.or')}</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.emailButton}
          onPress={handleContinueWithEmail}>
          <Image
            source={require('../../Assets/images/mail.png')}
            style={styles.emailIcon}
            resizeMode="contain"
          />
          <Text style={styles.emailButtonText}>{t('auth.signup.continue_email')}</Text>
        </TouchableOpacity>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF3B6D" />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 140, 
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,  
    marginLeft: -5,
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backIcon: {
    width: 28,
    height: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 70,  
    lineHeight: 36,
    marginTop: -40,  
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  phoneDisplay: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 80,
  },
  phoneContainer: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  countryCode: {
    width: 90,
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 8,
  },
  countryCodeText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  phoneInput: {
    flex: 1,
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 14,
    color: '#A0A0A0',
  },
  emailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  emailButtonText: {
    fontSize: 16,
    color: '#000000',
    marginLeft: 10,
    fontWeight: '500',
  },
  emailIcon: {
    width: 24,
    height: 24,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 40,
    gap: 15,
  },
  otpBox: {
    width: 70,
    height: 70,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    fontSize: 32,
    textAlign: 'center',
    color: '#000000',
    backgroundColor: '#FFFFFF',
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  timerText: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '600',
  },
  resendDisabled: {
    color: '#D0D0D0',
  },
  loadingContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default SignUp;
