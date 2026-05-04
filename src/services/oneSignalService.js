import { OneSignal } from 'react-native-onesignal';
import apiService from './apiService';
import { navigationRef } from '../utils/navigationRef';
import { AppState } from 'react-native';

const ONESIGNAL_APP_ID = '73c1715b-12f7-4e02-bf85-7e1c77307f2c';

let pendingNavigation = null;

export const initializeOneSignal = () => {
  OneSignal.initialize(ONESIGNAL_APP_ID);
  OneSignal.Notifications.requestPermission(true);

  OneSignal.Notifications.addEventListener('foregroundWillDisplay', (event) => {
    event.preventDefault();
    event.getNotification().display();
  });

  OneSignal.Notifications.addEventListener('click', (event) => {
    const notification = event.notification;
    const data = notification.additionalData;

    console.log('Notification clicked:', data);

    if (data) {
      handleNotificationClick(data);
    }
  });

  
  AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState === 'active' && pendingNavigation) {
      setTimeout(() => {
        handleNotificationClick(pendingNavigation);
        pendingNavigation = null;
      }, 1000);
    }
  });
};

const handleNotificationClick = (data) => {
  if (!navigationRef.isReady()) {
    console.log('Navigation not ready, storing for later');
    pendingNavigation = data;
    return;
  }

  try {
    if (data.type === 'message') {
      const { conversationId, senderId, senderName, senderImage } = data;
      
      console.log('Navigating to ChatRoom with:', {
        userId: senderId,
        userName: senderName,
        userImage: senderImage,
        conversationId: conversationId
      });
      
      if (conversationId && senderId) {
        // Navigate to ChatRoom directly
        navigationRef.navigate('ChatRoom', {
          userId: senderId,
          userName: senderName || 'User',
          userImage: senderImage || null,
          conversationId: conversationId
        });
      }
    } else if (data.type === 'like') {
      navigationRef.navigate('Notifications');
    } else if (data.type === 'match') {
      navigationRef.navigate('MatchScreen');
    }
  } catch (error) {
    console.error('Navigation error:', error);
    
  
    if (data.type === 'message') {
      try {
        navigationRef.navigate('ChatList');
        setTimeout(() => {
          const { conversationId, senderId, senderName, senderImage } = data;
          navigationRef.navigate('ChatRoom', {
            userId: senderId,
            userName: senderName || 'User',
            userImage: senderImage || null,
            conversationId: conversationId
          });
        }, 500);
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  }
};

export const getPlayerId = async () => {
  try {
    const playerId = await OneSignal.User.pushSubscription.getIdAsync();
    return playerId;
  } catch (error) {
    return null;
  }
};

export const updatePlayerIdOnBackend = async () => {
  try {
    const playerId = await getPlayerId();
    if (playerId) {
      await apiService.Post('api/auth/update-player-id', { playerId });
    }
  } catch (error) {
  }
};

export const sendTestNotification = async () => {
  try {
    const playerId = await getPlayerId();
    if (!playerId) {
      return { success: false, message: 'No player ID found. Please restart the app.' };
    }
    
    const response = await apiService.Post('api/auth/test-notification', { playerId });
    return response;
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export default {
  initializeOneSignal,
  getPlayerId,
  updatePlayerIdOnBackend,
  sendTestNotification,
};
