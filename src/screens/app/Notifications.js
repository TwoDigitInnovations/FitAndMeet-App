import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import SafeImage from '../../components/SafeImage';
import {useTranslation} from 'react-i18next';

const {height} = Dimensions.get('window');
const isSmallScreen = height < 300;
const topPadding = isSmallScreen ? 35 : 50;

const Notifications = ({navigation}) => {
  const {t} = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    
    
    return () => {
     
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await apiService.GetApi('api/notifications');

      if (response.success) {
        setNotifications(response.notifications || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      try {
        await apiService.Put(`api/notifications/${notification.id}/read`);
        // Update local state
        setNotifications(prev =>
          prev.map(n =>
            n.id === notification.id ? {...n, isRead: true} : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    
    if (notification.type === 'like' || notification.type === 'match') {
      navigation.navigate('ProfileDetails', {
        profile: {
          id: notification.sender.id,
          name: notification.sender.name,
          age: notification.sender.age,
          image: notification.sender.image,
          photos: notification.sender.image ? [{url: notification.sender.image}] : [],
        },
      });
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return require('../../Assets/images/activeH.png');
      case 'match':
        return require('../../Assets/images/activeH.png');
      default:
        return require('../../Assets/images/bell.png');
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMs = now - notifDate;
    const diffInMins = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMins < 1) return t('notifications.just_now');
    if (diffInMins < 60) return `${diffInMins}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return notifDate.toLocaleDateString();
  };

  const getMessageCount = (notification) => {
   
    return null;
  };

  const renderNotification = ({item}) => {
    const messageCount = getMessageCount(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.notificationCard,
          !item.isRead && styles.unreadNotification,
        ]}
        onPress={() => handleNotificationPress(item)}
        activeOpacity={0.7}>
        <View style={styles.notificationContent}>
          <View style={styles.avatarContainer}>
            <SafeImage
              source={item.sender.image}
              style={styles.avatar}
            />
            <View style={styles.matchBadge}>
              <Image
                source={
                  item.type === 'match'
                    ? require('../../Assets/images/badge.png')
                    : require('../../Assets/images/activeH.png')
                }
                style={styles.matchBadgeIcon}
              />
            </View>
          </View>

          <View style={styles.notificationText}>
            <Text style={styles.senderName}>{item.sender.name}</Text>
            <Text style={styles.message} numberOfLines={2}>
              {item.message}
            </Text>
          </View>

          <View style={styles.notificationRight}>
            <Text style={styles.time}>{getTimeAgo(item.createdAt)}</Text>
            {messageCount && (
              <View style={styles.messageCountBadge}>
                <Text style={styles.messageCountText}>{messageCount}</Text>
              </View>
            )}
            {!item.isRead && <View style={styles.unreadDot} />}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>
        {t('notifications.matches_who_send_chat')}
      </Text>
    </View>
  );

  return (
    <LinearGradient
      colors={['#5D1F3A', '#38152C', '#070A1A']}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5D1F3A" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Image
            source={require('../../Assets/images/backicon.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <View style={styles.headerRight}>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF3B6D" />
          <Text style={styles.loadingText}>{t('notifications.loading')}</Text>
        </View>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
        
          <Text style={styles.emptyText}>{t('notifications.no_notifications')}</Text>
          <Text style={styles.emptySubText}>
            {t('notifications.no_notifications_desc')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={renderHeader}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        />
      )}
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
    paddingTop: topPadding,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  unreadBadge: {
    backgroundColor: '#FF3B6D',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listContainer: {
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 15,
    padding: 15,
  },
  unreadNotification: {
    backgroundColor: 'rgba(242, 53, 118, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(242, 53, 118, 0.3)',
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  matchBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchBadgeIcon: {
    width: 16,
    height: 16,
  },
  notificationText: {
    flex: 1,
    marginRight: 10,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 18,
  },
  notificationRight: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 4,
  },
  messageCountBadge: {
    backgroundColor: '#FF3B6D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginTop: 4,
  },
  messageCountText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B6D',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
});

export default Notifications;
