import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import {Camera, ThumbsUp, Send} from 'lucide-react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import {getAuthToken} from '../../utils/storage';
import {getCurrentUserInfo, getCurrentUserId} from '../../utils/tokenUtils';
import chatApiService from '../../services/chatApiService';
import SafeImage from '../../components/SafeImage';
import ChatErrorBoundary from '../../components/ChatErrorBoundary';

const ChatRoom = ({navigation, route}) => {
  const {userId, userName, userImage} = route.params || {};
  
  console.log('ChatRoom params:', {userId, userName, userImage});
  

  if (!userId) {
    console.error('ERROR: userId is missing from route params!');
  }
  
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeChat();
  }, [userId]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        Alert.alert('Error', 'Please login again');
        navigation.navigate('SignIn');
        return;
      }

      // Get current user info - first try to get full profile from backend
      let userInfo = await getCurrentUserInfo();
      
      // If no avatar, try to fetch from profile API directly
      if (!userInfo.avatar) {
        try {
          const profileResponse = await chatApiService.get(`/api/profile/user/${userInfo._id}`);
          if (profileResponse.success && profileResponse.user) {
            userInfo = {
              _id: (profileResponse.user._id || profileResponse.user.id)?.toString() || userInfo._id,
              name: profileResponse.user.firstName || 'You',
              avatar: profileResponse.user.photos?.[0]?.url || null
            };
          }
        } catch (error) {
          console.log('Could not fetch profile:', error);
        }
      }
      
      setCurrentUser(userInfo);
      
      // Load messages from backend
      await loadMessagesFromBackend();
    } catch (error) {
      console.error('Error initializing chat:', error);
      Alert.alert('Error', 'Failed to load chat');
    } finally {
      setLoading(false);
    }
  };

  const loadMessagesFromBackend = async () => {
    try {
      const token = await getAuthToken();
      if (!token || !userId) return;

      // First, try to get existing conversation
      const conversationsResponse = await chatApiService.get('/api/chat/conversations');

      if (conversationsResponse && conversationsResponse.success) {
        const existingConversation = conversationsResponse.conversations.find(
          conv => conv.otherUser && conv.otherUser.id === userId
        );

        if (existingConversation) {
          setConversationId(existingConversation.id);
          
          // Load messages for this conversation
          const messagesResponse = await chatApiService.get(`/api/chat/messages/${existingConversation.id}`);

          if (messagesResponse && messagesResponse.success && messagesResponse.messages) {
            const formattedMessages = messagesResponse.messages.map(msg => ({
              _id: msg._id || Math.round(Math.random() * 1000000),
              text: msg.content || '',
              createdAt: new Date(msg.createdAt || Date.now()),
              user: {
                _id: msg.sender?._id?.toString() || 'unknown',
                name: msg.sender?.firstName || 'Unknown User',
                avatar: msg.sender?.photos?.[0]?.url || null
              },
              image: msg.mediaUrl ? `${chatApiService.baseURL}${msg.mediaUrl}` : null
            }));
            
            setMessages(formattedMessages.reverse()); // Reverse to show latest at bottom
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages from backend:', error);
      // Fallback to local storage for offline support
      await loadMessagesFromLocal();
    }
  };

  const loadMessagesFromLocal = async () => {
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return;
      
      // Create user-specific conversation key
      const userSpecificKey = `conversation_${currentUserId}_${userId}`;
      const savedMessages = await AsyncStorage.getItem(userSpecificKey);
      
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch (error) {
      console.error('Error loading local messages:', error);
    }
  };

  const saveMessagesToLocal = async (newMessages) => {
    try {
      const currentUserId = await getCurrentUserId();
      if (!currentUserId) return;
      
      // Create user-specific conversation key
      const userSpecificKey = `conversation_${currentUserId}_${userId}`;
      await AsyncStorage.setItem(userSpecificKey, JSON.stringify(newMessages));
      
      // Also update conversations list with user-specific key
      await saveConversationInfo(newMessages[0], currentUserId);
    } catch (error) {
      console.error('Error saving messages locally:', error);
    }
  };

  const saveConversationInfo = async (lastMessage, currentUserId) => {
    try {
      const userSpecificConversationsKey = `all_conversations_${currentUserId}`;
      const savedConversations = await AsyncStorage.getItem(userSpecificConversationsKey);
      let conversations = savedConversations ? JSON.parse(savedConversations) : [];
      
      const existingIndex = conversations.findIndex(conv => conv.userId === userId);
      const conversationInfo = {
        userId,
        userName,
        userImage,
        lastMessage: {
          text: lastMessage.text,
          createdAt: lastMessage.createdAt,
          senderId: lastMessage.user._id
        },
        updatedAt: new Date().toISOString()
      };
      
      if (existingIndex >= 0) {
        conversations[existingIndex] = conversationInfo;
      } else {
        conversations.push(conversationInfo);
      }
      
      conversations.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      await AsyncStorage.setItem(userSpecificConversationsKey, JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversation info:', error);
    }
  };

  const onSend = async () => {
    if (inputText.trim() && currentUser) {
      const newMessage = {
        _id: Math.round(Math.random() * 1000000),
        text: inputText.trim(),
        createdAt: new Date(),
        user: currentUser,
      };
      
      const updatedMessages = [newMessage, ...messages];
      setMessages(updatedMessages);
      setInputText('');
      
      // Save to local storage as backup
      await saveMessagesToLocal(updatedMessages);
      
      // Send to backend
      try {
        const token = await getAuthToken();
        if (token) {
          const messageData = {
            content: newMessage.text,
            type: 'text',
            recipientId: userId,
            conversationId: conversationId
          };

          const response = await chatApiService.post('/api/chat/send-message', messageData);

          if (response.success) {
            console.log('Message sent to backend successfully');
            console.log('Backend message response:', response.message);
            
            // Update the message with backend data (includes proper sender info with photos)
            if (response.message) {
              const updatedMessageFromBackend = {
                _id: response.message._id || newMessage._id,
                text: response.message.content || newMessage.text,
                createdAt: new Date(response.message.createdAt || newMessage.createdAt),
                user: {
                  _id: response.message.sender?._id?.toString() || currentUser._id,
                  name: response.message.sender?.firstName || currentUser.name,
                  avatar: response.message.sender?.photos?.[0]?.url || null
                }
              };
              
              // Replace the temporary message with backend message
              const messagesWithBackendData = messages.map(msg => 
                msg._id === newMessage._id ? updatedMessageFromBackend : msg
              );
              setMessages([updatedMessageFromBackend, ...messages]);
            }
            
            // Update conversation ID if it was a new conversation
            if (!conversationId && response.message.conversation) {
              setConversationId(response.message.conversation);
            }
          } else {
            console.error('Failed to send message to backend:', response.message);
          }
        }
      } catch (error) {
        console.error('Error sending message to backend:', error);
        // Message is already saved locally, so user can still see it
      }
    }
  };

  const handleImagePicker = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        {text: 'Camera', onPress: openCamera},
        {text: 'Gallery', onPress: openGallery},
        {text: 'Cancel', style: 'cancel'},
      ]
    );
  };

  const openCamera = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchCamera(options, (response) => {
      if (response.assets && response.assets[0]) {
        sendImageMessage(response.assets[0]);
      }
    });
  };

  const openGallery = () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
    };

    launchImageLibrary(options, (response) => {
      if (response.assets && response.assets[0]) {
        sendImageMessage(response.assets[0]);
      }
    });
  };

  const sendImageMessage = async (imageAsset) => {
    if (!currentUser) return;
    
    const imageMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: '',
      createdAt: new Date(),
      user: currentUser,
      image: imageAsset.uri,
    };
    
    const updatedMessages = [imageMessage, ...messages];
    setMessages(updatedMessages);
    await saveMessagesToLocal(updatedMessages);

    // Send to backend
    try {
      const token = await getAuthToken();
      if (token) {
        const formData = new FormData();
        formData.append('file', {
          uri: imageAsset.uri,
          type: imageAsset.type,
          name: imageAsset.fileName || 'image.jpg',
        });
        formData.append('type', 'image');
        formData.append('recipientId', userId);
        if (conversationId) {
          formData.append('conversationId', conversationId);
        }

        const response = await chatApiService.post('/api/chat/send-media', formData, {
          headers: { 
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.success) {
          console.log('Image sent to backend successfully');
          if (!conversationId && response.message.conversation) {
            setConversationId(response.message.conversation);
          }
        }
      }
    } catch (error) {
      console.error('Error sending image to backend:', error);
    }
  };

  const sendLikeSticker = async () => {
    if (!currentUser) return;
    
    const likeMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: '👍',
      createdAt: new Date(),
      user: currentUser,
    };
    
    const updatedMessages = [likeMessage, ...messages];
    setMessages(updatedMessages);
    await saveMessagesToLocal(updatedMessages);

    // Send to backend
    try {
      const token = await getAuthToken();
      if (token) {
        const messageData = {
          content: '👍',
          type: 'text',
          recipientId: userId,
          conversationId: conversationId
        };

        const response = await chatApiService.post('/api/chat/send-message', messageData);

        if (response.success && !conversationId && response.message.conversation) {
          setConversationId(response.message.conversation);
        }
      }
    } catch (error) {
      console.error('Error sending like to backend:', error);
    }
  };

  const renderMessage = ({item}) => {
    if (!currentUser) return null;
    
    // Convert both IDs to strings for comparison
    const isMyMessage = item.user._id?.toString() === currentUser._id?.toString();
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        {!isMyMessage && (
          <SafeImage
            source={item.user.avatar}
            style={styles.messageAvatar}
          />
        )}
        <View style={styles.messageContentWrapper}>
          <View style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
          ]}>
            {item.image && (
              <SafeImage 
                source={item.image} 
                style={styles.messageImage}
              />
            )}
            {item.text && (
              <Text style={[
                styles.messageText,
                isMyMessage ? styles.myMessageText : styles.otherMessageText
              ]}>
                {item.text}
              </Text>
            )}
          </View>
          <Text style={[
            styles.messageTimeOutside,
            isMyMessage ? styles.myMessageTimeOutside : styles.otherMessageTimeOutside
          ]}>
            {new Date(item.createdAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            })}
          </Text>
        </View>
        {isMyMessage && currentUser.avatar && (
          <SafeImage
            source={currentUser.avatar}
            style={styles.messageAvatar}
          />
        )}
      </View>
    );
  };

  const renderInputToolbar = () => (
    <View style={styles.inputContainer}>
      <View style={styles.inputRow}>
        <View style={styles.inputToolbar}>
          <TouchableOpacity onPress={handleImagePicker} style={styles.actionButton}>
            <Camera size={22} color="#FFFFFF" />
          </TouchableOpacity>
          
          <TextInput
            style={styles.textInput}
            placeholder="Message"
            placeholderTextColor="#FFFFFF60"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
            onSubmitEditing={onSend}
            returnKeyType="send"
          />
          
          {inputText.trim() ? (
            <TouchableOpacity onPress={onSend} style={styles.sendButton}>
              <Send size={20} color="#FF3B6D" />
            </TouchableOpacity>
          ) : null}
        </View>
        
        <TouchableOpacity onPress={sendLikeSticker} style={styles.likeButton}>
          <ThumbsUp size={26} color="#FF3B6D" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ChatErrorBoundary onRetry={initializeChat}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
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
            
            <TouchableOpacity 
              style={styles.userInfo}
              onPress={() => navigation.navigate('ProfileDetails', { 
                profile: {
                  id: userId,
                  name: userName,
                  image: userImage,
                  photos: userImage ? [{url: userImage}] : []
                }
              })}
            >
              <SafeImage
                source={userImage}
                style={styles.userAvatar}
              />
              <View>
                <Text style={styles.userName}>{userName || 'User'}</Text>
                <Text style={styles.userStatus}>Online</Text>
              </View>
            </TouchableOpacity>
            
            <View style={styles.headerRight} />
          </View>

        
          <View style={styles.todayContainer}>
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          </View>

        
          {loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Start your conversation with {userName || 'User'}</Text>
              <Text style={styles.emptySubText}>Say hello! 👋</Text>
            </View>
          ) : (
            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item._id.toString()}
              style={styles.messagesList}
              contentContainerStyle={styles.messagesContainer}
              inverted
              showsVerticalScrollIndicator={false}
            />
          )}

        
          {renderInputToolbar()}
        </LinearGradient>
      </KeyboardAvoidingView>
    </ChatErrorBoundary>
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
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    // backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userStatus: {
    fontSize: 12,
    color: '#FFFFFF80',
  },
  headerRight: {
    width: 40,
  },
  todayContainer: {
    alignItems: 'center',
    paddingVertical: 15,
  },
  todayBadge: {
    backgroundColor: '#FF3B6D',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  messagesContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
  },
  emptySubText: {
    fontSize: 16,
    color: '#FFFFFF80',
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: 5,
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  messageContentWrapper: {
    maxWidth: '70%',
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
  },
  myMessageBubble: {
    backgroundColor: '#F2357661',
    borderBottomRightRadius: 5,
  },
  otherMessageBubble: {
    backgroundColor: '#FFFFFF20',
    borderBottomLeftRadius: 5,
  },
  messageText: {
    fontSize: 16,
  },
  myMessageText: {
    color: '#FFFFFF',
  },
  otherMessageText: {
    color: '#FFFFFF',
  },
  messageTimeOutside: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginTop: 4,
  },
  myMessageTimeOutside: {
    textAlign: 'right',
  },
  otherMessageTimeOutside: {
    textAlign: 'left',
  },
  messageTime: {
    fontSize: 11,
    marginTop: 5,
  },
  myMessageTime: {
    color: '#FFFFFF80',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#FFFFFF60',
    textAlign: 'left',
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  inputContainer: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  inputToolbar: {
    backgroundColor: '#F2357661',
    borderRadius: 25,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 3,
    minHeight: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
    marginHorizontal: 12,
    paddingVertical: 8,
  },
  actionButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  micButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  micIcon: {
    fontSize: 18,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,59,109,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#FF3B6D',
    fontWeight: 'bold',
  },
  likeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default ChatRoom;