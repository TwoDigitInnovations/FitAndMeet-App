/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NewAppScreen } from '@react-native/new-app-screen';
import { Platform, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
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
import axiosInstance, { setApiToken } from './src/utils/axios';

export const LoadContext = createContext('');
export const UserContext = createContext('');
function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [loading, setLoading] = useState(false);
  const [user, setuser] = useState({});

  useEffect(() => {
    checkLogin()
  }, [])

  const checkLogin = async () => {

    try {
      const token = await getAuthToken();
      console.log("token", token)
      if (!token) {
        await deleteAuthToken();
        reset('Auth');
        return null;
      }
      setApiToken(token);
      const { data } = await axiosInstance.get('auth/profile');

      if (data) {
        console.log(data)
        // if (data?.type === 'instructer') {
        //   if (data?.status === 'Approved') {
        //     reset('InstructerApp');
        //   } else {
        //     navigate('Form')
        //   }
        // } else {
        //   reset('App');
        // }
        setuser(data)
        reset('App')
      } else {
        console.log(data)
        await deleteAuthToken();
        reset('Auth');
        return null;
      }
    } catch (error) {
      console.log(data)
      await deleteAuthToken();
      reset('Auth');
    }
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.container} edges={Platform.OS === 'ios' ? ['left', 'top', 'right'] : ['bottom', 'left', 'right', 'top']}>
        <UserContext.Provider value={[user, setuser]}>
          <LoadContext.Provider value={[loading, setLoading]}>
            <Spinner isLoading={loading} />
            <Navigation initial='Auth' />
          </LoadContext.Provider>
        </UserContext.Provider>
      </SafeAreaView>
      <Toast />
    </SafeAreaProvider>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
