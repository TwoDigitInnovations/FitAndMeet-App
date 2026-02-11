import React, {useState, useRef, useEffect, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { setAuthToken, getAuthToken } from '../../utils/storage';
import apiService from '../../services/apiService';
import CountryPicker from 'react-native-country-picker-modal';
import RegistrationProgressModal from '../../components/RegistrationProgressModal';
import { AuthContext } from '../../../App';
import {useTranslation} from 'react-i18next';

const SignIn = ({navigation}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [timer, setTimer] = useState(52);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [countryCode, setCountryCode] = useState('US');
  const [callingCode, setCallingCode] = useState('1');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [phoneLength, setPhoneLength] = useState(10);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  // Get authentication functions from context
  const { handleLoginSuccess } = useContext(AuthContext);
  const {t} = useTranslation();

  // Country-specific phone number lengths
  const getPhoneLength = (country) => {
    const phoneLengths = {
      US: 10, IN: 10, GB: 10, CA: 10, AU: 9, CN: 11, JP: 10, DE: 11, FR: 9, BR: 11,
      MX: 10, IT: 10, ES: 9, KR: 10, RU: 10, SA: 9, AE: 9, SG: 8, MY: 10, TH: 9,
      PH: 10, ID: 11, VN: 9, PK: 10, BD: 10, NG: 10, ZA: 9, EG: 10, TR: 10, AR: 10,
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

  const handlePhoneSubmit = async () => {
    console.log('=== HANDLE PHONE SUBMIT DEBUG ===');
    console.log('Phone Number:', phoneNumber);
    console.log('Country Code:', countryCode);
    console.log('Calling Code:', callingCode);
    
    const expectedLength = getPhoneLength(countryCode);
    console.log('Expected Length:', expectedLength);
    console.log('Actual Length:', phoneNumber.length);
    
    if (phoneNumber.length !== expectedLength) {
      console.log('ERROR: Invalid phone number length');
      Alert.alert(
        t('auth.otp.invalid_phone'), 
        t('auth.otp.invalid_phone_message', {length: expectedLength})
      );
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        phoneNumber,
        countryCode: `+${callingCode}`,
        isSignIn: true,
      };
      
      console.log('=== SENDING REQUEST ===');
      console.log('Request Data:', JSON.stringify(requestData, null, 2));
      
      const response = await apiService.PostPublic('api/auth/send-otp', requestData);

      console.log('=== RECEIVED RESPONSE ===');
      console.log('Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('=== SUCCESS RESPONSE ===');
        setUserId(response.userId);
        setShowOTP(true);
        Alert.alert(t('auth.otp.otp_sent'), t('auth.otp.otp_sent_message'));
      } else {
        console.log('=== ERROR RESPONSE ===');
        console.log('Error Message:', response.message);
        console.log('Requires Registration:', response.requiresRegistration);
        console.log('Next Screen:', response.nextScreen);
        
        if (response.requiresRegistration) {
          // Handle incomplete profile case - show OTP first
          console.log('=== INCOMPLETE PROFILE DETECTED ===');
          console.log('Setting up OTP screen for incomplete profile');
          
          setUserId(response.userId);
          setShowOTP(true);
          
          // Store registration data for after OTP verification
          setRegistrationData({
            currentStep: response.currentStep || 0,
            progressPercent: response.progressPercent || 0,
            stepDescription: response.message || 'Complete your registration',
            nextScreen: response.nextScreen || 'SelectGym'
          });
          
          Alert.alert(
            'Profile Incomplete', 
            `${response.message}\n\nPlease verify OTP first, then continue registration.`,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(t('auth.otp.error'), response.message || t('auth.otp.failed_send_otp'));
        }
      }
    } catch (error) {
      console.error('=== SEND OTP ERROR ===');
      console.error('Error details:', error);
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
      console.log('=== VERIFY OTP DEBUG ===');
      console.log('Phone Number:', phoneNumber);
      console.log('OTP Code:', otpCode);
      
      const response = await apiService.PostPublic('api/auth/verify-otp', {
        phoneNumber,
        otp: otpCode,
      });

      console.log('=== BACKEND RESPONSE ===');
      console.log('Full Response:', JSON.stringify(response, null, 2));
      console.log('Success:', response.success);
      console.log('Profile Completed:', response.user?.profileCompleted);
      console.log('Next Screen:', response.nextScreen);
      console.log('Progress Percent:', response.progressPercent);
      console.log('Requires Registration:', response.requiresRegistration);

      if (response.success) {
        // Store token using proper storage utility
        const tokenSaved = await setAuthToken(response.token);
        
        if (!tokenSaved) {
          Alert.alert('Error', 'Failed to save authentication token');
          return;
        }

        // Verify token was saved
        const savedToken = await getAuthToken();
        console.log('Token saved successfully:', savedToken ? 'Yes' : 'No');

       
        if (response.user.profileCompleted) {
          // Profile is complete, set authentication state
          if (handleLoginSuccess) {
            handleLoginSuccess(response.user);
          }
          
          // Small delay to ensure state is updated, then navigate
          setTimeout(() => {
            // Navigation will happen automatically when isAuthenticated changes
            // The AppNavigate will check profileCompleted flag and go to TabNav
          }, 100);
        } else {
         
          const nextScreen = registrationData?.nextScreen || response.nextScreen || 'SelectGym';
          const progressPercent = registrationData?.progressPercent || response.progressPercent || 0;
   
          setRegistrationData(null);
     
          navigation.navigate(nextScreen);
          setTimeout(() => {
            Alert.alert(
              'Profile Incomplete',
              `Continuing registration (${progressPercent}% complete)`,
              [{ text: 'OK' }]
            );
          }, 100);
        }
      } else {
   
        if (response.requiresRegistration) {
      
          const nextScreen = registrationData?.nextScreen || response.nextScreen || 'SelectGym';
          const progressPercent = registrationData?.progressPercent || response.progressPercent || 0;
          setRegistrationData(null);
        
       
          navigation.navigate(nextScreen);
        
          setTimeout(() => {
            Alert.alert(
              'Profile Incomplete',
              `Continuing registration (${progressPercent}% complete)`,
              [{ text: 'OK' }]
            );
          }, 100);
        } else {
          Alert.alert(t('auth.otp.invalid_otp'), response.message || t('auth.otp.invalid_otp_message'));
          setOtp(['', '', '', '']);
          otpRefs[0].current?.focus();
        }
      }
    } catch (error) {
   
      console.error('Error details:', error);
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

  const handleProgressModalClose = () => {
    setShowProgressModal(false);
    setRegistrationData(null);
   
    navigation.goBack();
  };

  const handleProgressModalContinue = () => {
    setShowProgressModal(false);
    if (registrationData?.nextScreen) {
      navigation.navigate(registrationData.nextScreen);
    }
    setRegistrationData(null);
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;
    
    setLoading(true);
    try {
      const response = await apiService.PostPublic('api/auth/send-otp', {
        phoneNumber,
        countryCode: `+${callingCode}`,
        isSignIn: true,
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
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#010918" barStyle="light-content" translucent={false} />
        
        <Image
          source={require('../../Assets/images/img4.png')}
          style={styles.image}
          resizeMode="cover"
        />

        <Image
          source={require('../../Assets/images/shadow.png')}
          style={styles.shadowImage}
          resizeMode="stretch"
        />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.bottomCardOTP}>
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
                  <ActivityIndicator size="large" color="#F23576" />
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#010918" barStyle="light-content" translucent={false} />
      
      <Image
        source={require('../../Assets/images/img4.png')}
        style={styles.image}
        resizeMode="cover"
      />

      {/* <Image
        source={require('../../Assets/images/shadow.png')}
        style={styles.shadowImage}
        resizeMode="stretch"
      /> */}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.bottomCard}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../Assets/images/newlogo.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <Text style={styles.title}>{t('auth.signin.title')}</Text>
              <Text style={styles.subtitle}>{t('auth.signin.subtitle')}</Text>

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
                  placeholder={t('auth.signin.phone_placeholder')}
                  placeholderTextColor="#A0A0A0"
                  keyboardType="phone-pad"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  onSubmitEditing={handlePhoneSubmit}
                  maxLength={phoneLength}
                />
              </View>

              <TouchableOpacity 
                style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
                onPress={handlePhoneSubmit}
                disabled={loading}>
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.signInButtonText}>{t('auth.signin.signin_button')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signUpLink}>
                  {t('auth.signin.signup_link')} <Text style={styles.signUpLinkBold}>{t('auth.signin.signup_link_bold')}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {/* Registration Progress Modal */}
      <RegistrationProgressModal
        visible={showProgressModal}
        onClose={handleProgressModalClose}
        onContinue={handleProgressModalContinue}
        currentStep={registrationData?.currentStep || 0}
        stepDescription={registrationData?.stepDescription || ''}
        progressPercent={registrationData?.progressPercent || 0}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010918',
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
  keyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  bottomCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: 'center',
  },
  bottomCardOTP: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 50,
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    zIndex: 10,
  },
  backIcon: {
    width: 28,
    height: 28,
  },
  logoContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#010918',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    marginBottom: 25,
  },
  phoneContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 20,
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
  signInButton: {
    backgroundColor: '#F23576',
    width: '100%',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
  },
  signInButtonDisabled: {
    backgroundColor: '#FFB3C6',
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpLink: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  signUpLinkBold: {
    color: '#F23576',
    fontWeight: '600',
  },
  phoneDisplay: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 40,
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

export default SignIn;
