import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN = '@token';
const USER_PROFILE = '@user_profile';


export const getAuthToken = async ()=> {
  try {
    const token = await AsyncStorage.getItem(AUTH_TOKEN);
    if (!token) return null;
    
   
    try {
      return JSON.parse(token);
    } catch {
      return token;
    }
  } catch (e) {
    return null;
  }
};

export const setAuthToken = async (value) => {
  try {
    const token = JSON.stringify(value);
    await AsyncStorage.setItem(AUTH_TOKEN, token);
    return true;
  } catch (e) {
    return false;
  }
};

export const deleteAuthToken = async () => {
  try {
    await AsyncStorage.removeItem(AUTH_TOKEN);
    return true;
  } catch (e) {
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const profile = await AsyncStorage.getItem(USER_PROFILE);
    return profile ? JSON.parse(profile) : null;
  } catch (e) {
    return null;
  }
};

export const setUserProfile = async (profile) => {
  try {
    await AsyncStorage.setItem(USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    return false;
  }
};

export const deleteUserProfile = async () => {
  try {
    await AsyncStorage.removeItem(USER_PROFILE);
    return true;
  } catch (e) {
    return false;
  }
};
