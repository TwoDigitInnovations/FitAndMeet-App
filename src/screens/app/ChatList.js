import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {Search, Mic} from 'lucide-react-native';
import chatApiService from '../../services/chatApiService';
import {getAuthToken} from '../../utils/storage';
import {getCurrentUserId} from '../../utils/tokenUtils';
import {migrateChatDataToUserSpecific} from '../../utils/chatCleanup';
import SafeImage from '../../components/SafeImage';

const ChatList = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    initializeChatList();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadConversations();
    });

    return unsubscribe;
  }, [navigation]);

  const initializeChatList = async () => {
    try {
      const token = await getAuthToken();
      if (!token) {
        navigation.navigate('SignIn');
        return;
      }
      
      // Get current user ID from token
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
      
      // Migrate old chat data to user-specific format
      await migrateChatDataToUserSpecific();
      
      await loadConversations();
    } catch (error) {
      console.error('Error initializing chat list:', error);
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      console.log('Loading conversations...');
      setLoading(true);
      
      const token = await getAuthToken();
      if (!token) return;

      // First try to load from backend
      try {
        const response = await chatApiService.get('/api/chat/conversations');

        if (response.success && response.conversations) {
          console.log('Loaded conversations from backend:', response.conversations);
          setChats(response.conversations);
          return;
        }
      } catch (backendError) {
        console.error('Backend error, falling back to local storage:', backendError);
      }

      // Fallback to local storage with user-specific key
      const userId = currentUserId || await getCurrentUserId() || 'unknown';
      const userSpecificConversationsKey = `all_conversations_${userId}`;
      const savedConversations = await AsyncStorage.getItem(userSpecificConversationsKey);
      
      console.log('Saved conversations from AsyncStorage:', savedConversations);
      
      if (savedConversations) {
        const conversations = JSON.parse(savedConversations);
        console.log('Parsed conversations:', conversations);
        
        const formattedChats = conversations.map(conv => ({
          id: conv.userId,
          otherUser: {
            id: conv.userId,
            name: conv.userName,
            profileImage: conv.userImage,
            isOnline: Math.random() > 0.5 
          },
          lastMessage: conv.lastMessage,
          unreadCount: 0, 
          updatedAt: conv.updatedAt
        }));
        
        console.log('Formatted chats:', formattedChats);
        setChats(formattedChats);
      } else {
        console.log('No saved conversations found');
        setChats([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const renderChatItem = ({item}) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('ChatRoom', {
        userId: item.otherUser.id,
        userName: item.otherUser.name,
        userImage: item.otherUser.profileImage,
      })}
    >
      <View style={styles.avatarContainer}>
        <SafeImage
          source={item.otherUser.profileImage}
          style={styles.avatar}
        />
        {item.otherUser.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.userName}>{item.otherUser.name}</Text>
          <Text style={styles.timestamp}>
            {formatTime(item.lastMessage?.createdAt)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage?.text || item.lastMessage?.content || 'Start a conversation...'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const filteredChats = chats.filter(chat =>
    chat.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearGradient colors={['#5D1F3A', '#38152C', '#070A1A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5D1F3A" />
      
   
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
         <Image 
                      source={require('../../Assets/images/backicon.png')} 
                      style={styles.backIcon}
                    />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Messages</Text>
        
        <View style={styles.headerRight} />
      </View>

   
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#FFFFFF" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor="#FFFFFF80"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.micButton}>
            <Mic size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

   
      <View style={styles.chatsSection}>
        <Text style={styles.sectionTitle}>Chats</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading chats...</Text>
          </View>
        ) : filteredChats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubText}>Start matching to begin chatting!</Text>
          </View>
        ) : (
          <FlatList
            data={filteredChats}
            renderItem={renderChatItem}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.chatsList}
          />
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
   
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F23576',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 1,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  micButton: {
    marginLeft: 10,
  },
  chatsSection: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  chatsList: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 12,
    color: '#FFFFFF80',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: '#FFFFFF80',
    flex: 1,
    marginRight: 10,
  },
  unreadBadge: {
    backgroundColor: '#FF3B6D',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  emptySubText: {
    color: '#FFFFFF80',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ChatList;