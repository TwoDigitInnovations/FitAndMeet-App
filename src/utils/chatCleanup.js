import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserId } from './tokenUtils';

// Clean up old non-user-specific chat data
export const cleanupOldChatData = async () => {
  try {
    console.log('Starting chat data cleanup...');
    
    // Get all keys from AsyncStorage
    const allKeys = await AsyncStorage.getAllKeys();
    
    // Find old conversation keys that don't have user ID
    const oldConversationKeys = allKeys.filter(key => 
      key.startsWith('conversation_') && !key.includes('_') || 
      key === 'all_conversations'
    );
    
    if (oldConversationKeys.length > 0) {
      console.log('Found old conversation keys to remove:', oldConversationKeys);
      await AsyncStorage.multiRemove(oldConversationKeys);
      console.log('Old conversation data cleaned up successfully');
    } else {
      console.log('No old conversation data found to clean up');
    }
    
    return true;
  } catch (error) {
    console.error('Error cleaning up old chat data:', error);
    return false;
  }
};

// Migrate existing chat data to user-specific format
export const migrateChatDataToUserSpecific = async () => {
  try {
    console.log('Starting chat data migration...');
    
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.log('No current user ID found, skipping migration');
      return false;
    }
    
    // Check if old conversations exist
    const oldConversations = await AsyncStorage.getItem('all_conversations');
    if (oldConversations) {
      console.log('Found old conversations to migrate');
      
      // Save to new user-specific key
      const newKey = `all_conversations_${currentUserId}`;
      await AsyncStorage.setItem(newKey, oldConversations);
      
      // Remove old key
      await AsyncStorage.removeItem('all_conversations');
      
      console.log('Conversations migrated successfully');
    }
    
    // Get all keys to find old conversation messages
    const allKeys = await AsyncStorage.getAllKeys();
    const oldMessageKeys = allKeys.filter(key => 
      key.startsWith('conversation_') && 
      !key.includes(`_${currentUserId}_`) &&
      key !== `all_conversations_${currentUserId}`
    );
    
    for (const oldKey of oldMessageKeys) {
      try {
        // Extract the other user ID from the old key
        const otherUserId = oldKey.replace('conversation_', '');
        
        // Create new user-specific key
        const newKey = `conversation_${currentUserId}_${otherUserId}`;
        
        // Get old data
        const oldData = await AsyncStorage.getItem(oldKey);
        if (oldData) {
          // Save to new key
          await AsyncStorage.setItem(newKey, oldData);
          
          // Remove old key
          await AsyncStorage.removeItem(oldKey);
          
          console.log(`Migrated messages from ${oldKey} to ${newKey}`);
        }
      } catch (error) {
        console.error(`Error migrating ${oldKey}:`, error);
      }
    }
    
    console.log('Chat data migration completed');
    return true;
  } catch (error) {
    console.error('Error migrating chat data:', error);
    return false;
  }
};