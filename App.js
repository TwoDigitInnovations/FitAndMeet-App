

import { NewAppScreen } from '@react-native/new-app-screen';
import { Platform, StatusBar, StyleSheet, useColorScheme, View, Image } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import Navigation from './src/navigation';
import Spinner from './src/components/Spinner'
import { useState, createContext, useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { getAuthToken, deleteAuthToken } from './src/utils/storage'
import { reset } from './src/utils/navigationRef';
import apiService from './src/services/apiService';
import './src/i18n';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { initializeOneSignal } from './src/services/oneSignalService';

export const LoadContext = createContext('');
export const UserContext = createContext('');
export const AuthContext = createContext('');
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(true);
  const [user, setuser] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  const FORCE_AUTH_FOR_TESTING = false;


  const logout = async () => {
    try {

      await deleteAuthToken();

      setuser({});
      setIsAuthenticated(false);

    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  useEffect(() => {
    initializeOneSignal();

    const initializeApp = async () => {
      const minSplashTime = new Promise(resolve => setTimeout(resolve, 1500));
      const authCheck = checkLogin();
      await Promise.all([minSplashTime, authCheck]);
      setLoading(false);
    };

    initializeApp();
  }, [])


  useEffect(() => {

  }, [isAuthenticated]);

  const handleLoginSuccess = (userData) => {
    setuser(userData);
    setIsAuthenticated(true);
  };

  const checkLogin = async () => {
    try {
      const token = await getAuthToken();

      if (token) {
        console.log("- Token preview:", token.substring(0, 20) + "...");
      }

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        const response = await apiService.GetApi('api/auth/profile');

        if (response && response.success && response.user) {

          const user = response.user;


          const isProfileComplete = user.profileCompleted || (
            user.gymName &&
            user.firstName &&
            user.birthday &&
            user.gender &&
            user.interestedIn &&
            user.lookingFor &&
            user.ageRange &&
            user.interests &&
            user.interests.length > 0 &&
            user.bio &&
            user.photos &&
            user.photos.length > 0
          );


          user.profileCompleted = isProfileComplete;
          setuser(user);
          setIsAuthenticated(true);
        } else {
          await deleteAuthToken();
          setIsAuthenticated(false);
        }
      } catch (apiError) {
        if (apiError.message && (apiError.message.includes('401') || apiError.message.includes('403'))) {
          await deleteAuthToken();
        } else {
          console.log("Network error - keeping token for retry");
        }

        setIsAuthenticated(false);
      }
    } catch (error) {
      console.log("- Error:", error.message || error);
      await deleteAuthToken();
      setIsAuthenticated(false);
    } finally {
      console.log(" AUTHENTICATION CHECK COMPLETE ===");
      console.log("Final isAuthenticated value:", isAuthenticated);
    }
  }

  if (loading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['left', 'right',] : ['left', 'right']}>
          <StatusBar barStyle="light-content" backgroundColor="#010918" translucent />
          <View style={styles.splashContainer}>
            <Image
              source={require('./src/Assets/images/newlogo.png')}
              style={styles.splashLogo}
              resizeMode="contain"
            />
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#010918" />
      <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['top', 'left', 'right'] : ['left', 'right']}>
        <LanguageProvider>
          <UserContext.Provider value={[user, setuser]}>
            <LoadContext.Provider value={[loading, setLoading]}>
              <AuthContext.Provider value={{ logout, isAuthenticated, setIsAuthenticated, handleLoginSuccess }}>
                <Spinner isLoading={loading} />

                {FORCE_AUTH_FOR_TESTING || isAuthenticated ? (
                  <Navigation isAuthenticated={true} />
                ) : (
                  <Navigation isAuthenticated={false} />
                )}
              </AuthContext.Provider>
            </LoadContext.Provider>
          </UserContext.Provider>
        </LanguageProvider>
      </SafeAreaView>
      <Toast />
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#5D1F3A'
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#010918',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashLogo: {
    width: 250,
    height: 250,
  },
});

export default App;
