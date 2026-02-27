import { OneSignal } from 'react-native-onesignal';
import apiService from './apiService';
import { navigationRef } from '../utils/navigationRef';

const ONESIGNAL_APP_ID = '73c1715b-12f7-4e02-bf85-7e1c77307f2c';

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

    if (data && data.type === 'message') {
      const { conversationId, senderId, senderName, senderImage } = data;
      
      if (navigationRef.isReady() && conversationId && senderId) {
        navigationRef.navigate('ChatRoom', {
          userId: senderId,
          userName: senderName || 'User',
          userImage: senderImage || null,
          conversationId: conversationId
        });
      }
    }
  });
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
