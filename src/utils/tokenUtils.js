import { getAuthToken, getUserProfile } from './storage';
import Constants from './Constant';

// Simple JWT decode function (without verification)
export const decodeJWT = (token) => {
  try {
    if (!token) return null;
    
    // JWT has 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    
    // Add padding if needed
    const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
    
    // Decode base64
    const decodedPayload = atob(paddedPayload);
    
    // Parse JSON
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Get current user ID from stored token
export const getCurrentUserId = async () => {
  try {
    const token = await getAuthToken();
    if (!token) return null;
    
    // If token is already an object with userId
    if (typeof token === 'object' && token.userId) {
      return token.userId;
    }
    
    // If token is a JWT string, decode it
    if (typeof token === 'string') {
      const decoded = decodeJWT(token);
      return decoded?.userId || decoded?.id || decoded?.sub;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

// Get current user info from stored token
export const getCurrentUserInfo = async () => {
  try {
    // First try to get from AsyncStorage (fastest)
    const cachedProfile = await getUserProfile();
    if (cachedProfile && cachedProfile.photos) {
      console.log('Using cached profile:', cachedProfile);
      return {
        _id: cachedProfile._id,
        name: cachedProfile.firstName || 'You',
        avatar: cachedProfile.photos && cachedProfile.photos.length > 0 ? cachedProfile.photos[0].url : null,
      };
    }
    
    const token = await getAuthToken();
    if (!token) return null;
    
    let userId = null;
    
    // If token is already an object
    if (typeof token === 'object') {
      userId = token.userId || token.id;
    }
    
    // If token is a JWT string, decode it
    if (typeof token === 'string') {
      const decoded = decodeJWT(token);
      if (decoded) {
        userId = decoded.userId || decoded.id || decoded.sub;
      }
    }
    
    // Try to fetch user profile from backend
    if (userId) {
      try {
        console.log('Fetching user profile for userId:', userId);
        const response = await fetch(`${Constants.baseUrl}/api/profile/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log('Profile API response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          if (data.success && data.user) {
            const userInfo = {
              _id: data.user._id || userId,
              name: data.user.firstName || 'You',
              avatar: data.user.photos && data.user.photos.length > 0 ? data.user.photos[0].url : null,
            };
            console.log('Returning user info with avatar:', userInfo);
            return userInfo;
          }
        }
      } catch (error) {
        console.log('Could not fetch user profile, using token data:', error.message);
      }
    }
    
    // Fallback to token data
    if (typeof token === 'object') {
      return {
        _id: token.userId || token.id || `user_${Date.now()}`,
        name: token.name || token.firstName || 'You',
        avatar: null,
      };
    }
    
    if (typeof token === 'string') {
      const decoded = decodeJWT(token);
      if (decoded) {
        return {
          _id: decoded.userId || decoded.id || decoded.sub || `user_${Date.now()}`,
          name: decoded.name || decoded.firstName || 'You',
          avatar: null,
        };
      }
    }
    
    // Final fallback
    return {
      _id: `user_${Date.now()}`,
      name: 'You',
      avatar: null,
    };
  } catch (error) {
    console.error('Error getting current user info:', error);
    return {
      _id: `user_${Date.now()}`,
      name: 'You',
      avatar: null,
    };
  }
};