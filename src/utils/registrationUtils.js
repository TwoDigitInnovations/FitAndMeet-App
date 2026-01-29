import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuthToken } from './storage';
import apiService from '../services/apiService';


export const checkRegistrationStatus = async () => {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { isComplete: false, nextScreen: 'SignIn' };
    }

   
    const response = await apiService.GetApi('api/auth/profile');
    
    if (response.success && response.user) {
      const user = response.user;
      
      if (user.profileCompleted) {
        return { isComplete: true, nextScreen: 'Home', user };
      }
      
     
      let nextScreen = 'SelectGym';
      
      if (user.currentStep >= 11) {
        nextScreen = 'Home';
      } else if (user.currentStep >= 4) {
        nextScreen = 'FirstName';
      } else if (user.currentStep >= 3) {
        nextScreen = 'UploadDocuments';
      } else if (user.currentStep >= 2) {
        nextScreen = 'TermsScreen';
      } else if (user.currentStep >= 1) {
        nextScreen = 'SelectGym';
      }
      
      return { 
        isComplete: false, 
        nextScreen, 
        user,
        currentStep: user.currentStep 
      };
    }
    
    return { isComplete: false, nextScreen: 'SignIn' };
  } catch (error) {
    console.error('Error checking registration status:', error);
    return { isComplete: false, nextScreen: 'SignIn' };
  }
};


export const clearRegistrationData = async () => {
  try {
    await AsyncStorage.multiRemove([
      'userDetail',
      '@token'
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing registration data:', error);
    return false;
  }
};


export const getRegistrationProgress = (currentStep) => {
  const totalSteps = 11;
  const progress = Math.min((currentStep / totalSteps) * 100, 100);
  return Math.round(progress);
};


export const getMissingFields = (user) => {
  const missingFields = [];
  
  if (!user.gymName) missingFields.push('Gym Selection');
  if (!user.termsAccepted) missingFields.push('Terms Acceptance');
  if (!user.idDocument?.url) missingFields.push('ID Document');
  if (!user.gymMembershipDocument?.url) missingFields.push('Gym Membership Document');
  if (!user.firstName) missingFields.push('First Name');
  if (!user.birthday) missingFields.push('Birthday');
  if (!user.gender) missingFields.push('Gender');
  if (!user.interestedIn) missingFields.push('Interested In');
  if (!user.lookingFor) missingFields.push('Looking For');
  if (!user.ageRange) missingFields.push('Age Range');
  if (!user.interests || user.interests.length === 0) missingFields.push('Interests');
  if (!user.bio) missingFields.push('Bio');
  if (!user.photos || user.photos.length === 0) missingFields.push('Photos');
  
  return missingFields;
};