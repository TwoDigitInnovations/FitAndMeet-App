import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  FlatList,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

// Responsive padding based on screen height
const isSmallScreen = height < 700;
const topPadding = isSmallScreen ? 35 : 50;

// Responsive button sizing for small screens
const isNarrowScreen = width < 400; // Small screens
const buttonPadding = isNarrowScreen ? 14 : 20;
const buttonFontSize = isNarrowScreen ? 13 : 14;

const Discover = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('Near by');
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const filterOptions = [t('discover.near_by'), t('discover.online_now'), t('discover.new_profile')];
  const insets = useSafeAreaInsets();


  useEffect(() => {
    fetchLikedProfiles();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    try {
      const response = await apiService.GetApi('api/auth/profile');
      if (response.success) {
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchLikedProfiles = async () => {
    try {
      setLoading(true);
      const response = await apiService.GetApi('api/match/liked-profiles');

      if (response.success) {
        setLikedProfiles(response.likedProfiles || []);
      } else {
        console.error('API Error:', response.message);
        Alert.alert(t('auth.otp.error'), response.message || t('discover.failed_load_profiles'));
        setLikedProfiles([]);
      }
    } catch (error) {
      console.error('Network Error:', error);
      Alert.alert(t('auth.otp.error'), t('discover.failed_load_profiles'));
      setLikedProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const renderProfileCard = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;


    const firstName = item.name ? item.name.split(' ')[0] : '';

    return (
      <TouchableOpacity
        style={[
          styles.profileCard,
          { marginRight: isLeftColumn ? 8 : 0, marginLeft: isLeftColumn ? 0 : 8 }
        ]}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('ProfileDetails', { profile: item })}
      >
        <Image
          source={{
            uri: item.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
          }}
          style={styles.profileImage}
        />

        {/* Gradient overlay */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.profileOverlay}
        />

        {/* Profile info */}
        <View style={styles.profileInfo}>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{firstName} {item.age}</Text>
            {item.isVerified && (
              <Image
                source={require('../../Assets/images/badge.png')}
                style={styles.verifiedBadge}
              />
            )}
          </View>
          <Text style={styles.timeLeft}>{item.timeLeft}</Text>
        </View>


        <TouchableOpacity style={styles.starButton}>
          <Image
            source={require('../../Assets/images/sun.png')}
            style={styles.starIcon}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient
      colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
      locations={[0, 0.4, 0.9, 1]}
      style={styles.container}
    >
      {/* <View style={[styles.topProfileSection, { paddingTop: Platform.OS === 'android' && insets.top + 10 }]}></View> */}
      <StatusBar barStyle="light-content" backgroundColor="#571D38" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' && insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Image
              source={{
                uri: currentUser?.photos?.[0]?.url ||
                  currentUser?.profileImage ||
                  'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80'
              }}
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('discover.title')}</Text>
        </View>
        <View style={styles.headerRight}>
          {/* <TouchableOpacity style={styles.headerIcon}>
            <Image 
              source={require('../../Assets/images/bell.png')} 
              style={styles.helpIcon}
            />
          </TouchableOpacity> */}
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Messages')}
          >
            <Image
              source={require('../../Assets/images/message.png')}
              style={styles.settingIcon}
            />
          </TouchableOpacity>
        </View>
      </View>


      <View style={styles.filterContainer}>
        {filterOptions.map((filter, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.selectedFilterButton,
              i18n.language === 'fr' && styles.filterButtonFrench
            ]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[
              styles.filterText,
              selectedFilter === filter && styles.selectedFilterText,
              i18n.language === 'fr' && styles.filterTextFrench
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Section Title */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('discover.profiles_who_likes_you')}</Text>
      </View>

      {/* Profiles Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>{t('discover.loading_profiles')}</Text>
        </View>
      ) : likedProfiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t('discover.no_liked_profiles')}</Text>
          <Text style={styles.emptySubText}>{t('discover.start_liking_profiles')}</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={fetchLikedProfiles}
          >
            <Text style={styles.refreshButtonText}>{t('home.refresh')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={likedProfiles}
          renderItem={renderProfileCard}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.profilesList}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={styles.row}
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
  },
  helpIcon: {
    width: 24,
    height: 24,
  },
  settingIcon: {
    width: 30,
    height: 30,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 30,
    gap: 18,
  },
  filterButton: {
    paddingHorizontal: buttonPadding,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'white',
  },
  filterButtonFrench: {
    paddingHorizontal: isNarrowScreen ? 10 : 12,
    paddingVertical: 8,
  },
  selectedFilterButton: {
    backgroundColor: '#FFFFFF99',
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  filterText: {
    color: 'white',
    fontSize: buttonFontSize,
    fontWeight: '500',
  },
  filterTextFrench: {
    fontSize: 12,
  },
  selectedFilterText: {
    color: 'black',
    fontWeight: '600',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  profilesList: {
    paddingHorizontal: 12,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  profileCard: {
    width: (width - 40) / 2,
    height: 240,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  profileInfo: {
    position: 'absolute',
    bottom: 15,
    left: 15,
    right: 15,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginRight: 6,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
  },
  timeLeft: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  starButton: {
    position: 'absolute',
    bottom: 30,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,

    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    width: 20,
    height: 20,
  },
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    width: 24,
    height: 24,
    tintColor: 'rgba(255, 255, 255, 0.7)',
  },
  likeButton: {
    width: 120,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  likeButtonGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  likeIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
  likeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptySubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#FF6B9D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Discover;