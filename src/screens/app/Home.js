import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiService from '../../services/apiService';
import LinearGradient from 'react-native-linear-gradient';
import {
  MapPin,
  Bell,
} from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import {useTranslation} from 'react-i18next';

const {width, height} = Dimensions.get('window');


const isSmallScreen = height < 300; 
const topPadding = isSmallScreen ? 35 : 50; 

const Home = ({navigation}) => {
  const {t} = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heartLoading, setHeartLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [likedProfiles, setLikedProfiles] = useState(new Set());
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const scrollViewRef = useRef(null);

  
  useEffect(() => {
    fetchPotentialMatches();
    getCurrentUser();
  }, []);

  
  useFocusEffect(
    React.useCallback(() => {
      fetchLikedProfiles();
      fetchUnreadNotifications();
    }, [])
  );

  const fetchUnreadNotifications = async () => {
    try {
      const response = await apiService.GetApi('api/notifications/unread-count');
      
      if (response.success) {
        setUnreadNotifications(response.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
    }
  };

  const fetchLikedProfiles = async () => {
    try {
      const response = await apiService.GetApi('api/match/liked-profiles');
      
      if (response.success) {
        const likedProfileIds = new Set(
          response.likedProfiles.map(profile => profile.id)
        );
        setLikedProfiles(likedProfileIds);
        console.log('Fetched liked profiles:', likedProfileIds);
      } else {
        console.log('No liked profiles found or API error');
      }
    } catch (error) {
    
      if (error?.status === 401) {
        console.log('Auth error - user may need to login again');
        setLikedProfiles(new Set()); 
      } else {
        console.error('Error fetching liked profiles:', error);
      }
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await apiService.GetApi('api/auth/profile');
      console.log("test",response)
      if (response.success) {
        setCurrentUser(response.user);
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchPotentialMatches = async () => {
    try {
      const response = await apiService.GetApi('api/match/potential-matches');
      
      if (response.success) {
        setProfiles(response.matches || []);
      } else {
        console.error('API Error:', response.message);
        Alert.alert(t('auth.otp.error'), response.message || t('home.failed_load_matches'));
        setProfiles([]);
      }
    } catch (error) {
      console.error('Network Error:', error);
      if (typeof error === 'string' && error.includes('No internet')) {
        Alert.alert(t('home.connection_error'), t('home.check_internet'));
      } else {
        Alert.alert(t('auth.otp.error'), t('home.something_wrong'));
      }
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    const cardHeight = height - 180; // Adjusted for better spacing
    const index = Math.round(scrollY / cardHeight);
    setCurrentIndex(index);
  };

  const handlePass = () => {
    const profile = profiles[currentIndex];
    if (!profile) return;
    
    // If heart is active (liked), remove the like
    if (likedProfiles.has(profile.id)) {
      setLikedProfiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(profile.id);
        return newSet;
      });
      
      // Call API to unlike
      apiService.Delete(`api/match/unlike/${profile.id}`)
        .then(response => {
          if (response.success) {
            console.log('Profile unliked:', profile.name);
          }
        })
        .catch(error => {
          console.error('Error unliking profile:', error);
        });
    }
    
    console.log('Passed profile:', profile.name);
  };

  const handleHeartToggle = async (profileId) => {
    if (heartLoading) return; // Prevent multiple clicks
    
    const profile = profiles.find(p => p.id === profileId);
    
    setLikedProfiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(profileId)) {
        newSet.delete(profileId);
        console.log('Unliked profile:', profileId);
        handleUnlikeProfile(profile);
      } else {
        newSet.add(profileId);
        console.log('Liked profile:', profileId);
        setHeartLoading(true); // Show loading when liking
        handleLikeProfile(profile);
      }
      return newSet;
    });
  };

  const handleUnlikeProfile = async (profile) => {
    try {
      console.log('Calling unlike API for profile:', profile.id);
      const response = await apiService.Delete(`api/match/unlike/${profile.id}`);
      console.log('Unlike API response:', response);
    } catch (error) {
      console.error('Error unliking profile:', error);
    }
  };

  const handleLikeProfile = async (profile) => {
    try {
      console.log('Calling like API for profile:', profile.id);
      const response = await apiService.Post('api/match/like', {
        likedUserId: profile.id
      });
      
      console.log('Like API response:', response);
      
      if (response.success) {
        if (response.isMatch) {
          console.log('Real match found! Navigating to MatchScreen');
          // Show loading for 2 seconds before navigating
          setTimeout(() => {
            setHeartLoading(false);
            navigation.navigate('MatchScreen', {
              currentUser: response.currentUser,
              matchedUser: response.matchedUser
            });
          }, 2000);
        } else if (response.currentUser && response.matchedUser) {
          console.log('Simulating match for demo - navigating to MatchScreen');
          // Show loading for 2 seconds before navigating
          setTimeout(() => {
            setHeartLoading(false);
            navigation.navigate('MatchScreen', {
              currentUser: response.currentUser,
              matchedUser: response.matchedUser
            });
          }, 2000);
        } else {
          console.log('No match, just liked');
          setHeartLoading(false);
        }
      } else {
        setHeartLoading(false);
      }
    } catch (error) {
      console.error('Error liking profile:', error);
      setHeartLoading(false);
    }
  };

  const ProfileCard = ({profile}) => (
    <View style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.profileImageContainer}
        onPress={() => {
          console.log('Home - Navigating to ProfileDetails with profile:', JSON.stringify(profile, null, 2));
          navigation.navigate('ProfileDetails', { profile });
        }}
        activeOpacity={0.9}
      >
        <Image 
          source={
            (profile.photos && profile.photos.length > 0) 
              ? {uri: profile.photos[0].url}
              : profile.image 
                ? {uri: profile.image}
                : require('../../Assets/images/layout.png')
          } 
          style={styles.profileImage} 
        />
      </TouchableOpacity>
      
      <View style={styles.topProfileOverlay}>
        <View style={styles.profileHeader}>
          <View style={styles.nameSection}>
            <View style={styles.nameBackground}>
              <Text style={styles.profileName}>
                {profile.name}, {profile.age}
              </Text>
              {/* {profile.verified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )} */}
            </View>
          </View>
          
          <View style={styles.motivateSection}>
            <View style={styles.motivateButton}>
              <Image 
                source={require('../../Assets/images/motivate.png')} 
                style={styles.motivateImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </View>

        <View style={styles.locationRow}>
          <View style={styles.locationBackground}>
            <MapPin size={16} color="#FFFFFF" />
            <Text style={styles.distance}>{profile.distance}</Text>
          </View>
        </View>
      </View>

      
      <TouchableOpacity 
        style={styles.heartIcon} 
        onPress={() => handleHeartToggle(profile.id)}
      >
        <Image 
          source={likedProfiles.has(profile.id) 
            ? require('../../Assets/images/activeH.png')
            : require('../../Assets/images/inactiveH.png')
          } 
          style={styles.heartImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={handlePass}>
        <Image 
          source={require('../../Assets/images/skip.png')} 
          style={styles.skipImage}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={styles.layoutImageContainer}>
        <View style={styles.layoutImageWrapper}>
          <Image 
            source={require('../../Assets/images/layout.png')} 
            style={styles.layoutImage}
            resizeMode="cover"
            onError={(error) => console.log('Image load error:', error)}
            onLoad={() => console.log('Image loaded successfully')}
          />
        </View>
      </View>

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.bottomOverlay}>
        <View style={styles.bottomInfo}>
          <View style={styles.gymSectionHorizontal}>
            <View style={styles.genderSection}>
              <Image 
                source={require('../../Assets/images/gender.png')} 
                style={styles.genderImage}
                resizeMode="contain"
              />
              <Text style={styles.genderText}>
                {profile.gender}
              </Text>
            </View>
            <View style={styles.gymRowHorizontal}>
              <Image 
                source={require('../../Assets/images/rays.png')} 
                style={styles.raysImage}
                resizeMode="contain"
              />
              <Text style={styles.gymName}>
                {profile.activities && profile.activities.length > 0 
                  ? profile.activities[0] 
                  : t('home.fitness')}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.purposeIcon}
              onPress={() => navigation.navigate('ChatRoom', {
                userId: profile.id,
                userName: profile.name,
                userImage: profile.image
              })}
            >
              <Image 
                source={require('../../Assets/images/mess.png')} 
                style={styles.purposeIconImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.purposeText}>{t('home.purpose')}</Text>

          <View style={styles.activitiesContainer}>
            {profile.activities && profile.activities.length > 1 && (
              <View style={styles.activityTag}>
                <Image 
                  source={require('../../Assets/images/confirm.png')} 
                  style={styles.activityIcon}
                  resizeMode="contain"
                />
                <Text style={styles.activityText}>{profile.activities[1]}</Text>
              </View>
            )}
            {profile.activities && profile.activities.length > 2 && (
              <View style={styles.activityTag}>
                <Image 
                  source={require('../../Assets/images/confirm.png')} 
                  style={styles.activityIcon}
                  resizeMode="contain"
                />
                <Text style={styles.activityText}>{profile.activities[2]}</Text>
              </View>
            )}
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <LinearGradient colors={['#5D1F3A', '#38152C', '#070A1A']} style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5D1F3A" />
      
      <View style={styles.topProfileSection}>
        <TouchableOpacity 
          style={styles.topUserInfo}
          onPress={() => navigation.navigate('Profile')}
        >
          {currentUser?.photos?.[0]?.url && (
            <Image
              source={{uri: currentUser.photos[0].url}}
              style={styles.topAvatar}
            />
          )}
          <View>
            {currentUser?.firstName && (
              <>
                <Text style={styles.topUserName}>{currentUser.firstName}</Text>
                <Text style={styles.welcomeText}>{t('home.welcome')} 👋</Text>
              </>
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <View style={styles.settingsIcon}>
            <Bell 
              size={20} 
              color="#000000" 
              strokeWidth={2}
            />
            {unreadNotifications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotifications > 99 ? '99+' : unreadNotifications}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('home.loading_matches')}</Text>
        </View>
      ) : profiles.length === 0 ? (
        <View style={styles.noMatchesContainer}>
          <Text style={styles.noMatchesText}>{t('home.no_matches_found')}</Text>
          <Text style={styles.noMatchesSubText}>{t('home.check_back_later')}</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => {
              setLoading(true);
              fetchPotentialMatches();
            }}
          >
            <Text style={styles.refreshButtonText}>{t('home.refresh')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          snapToInterval={height - 180} 
          decelerationRate="fast">
          {profiles.map((profile, index) => (
            <View key={profile.id} style={[
              styles.cardWrapper,
              index === profiles.length - 1 && styles.lastCardWrapper
            ]}>
              <ProfileCard profile={profile} />
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.pageIndicators}>
        {profiles.map((_, index) => (
          <View
            key={index}
            style={[
              styles.pageIndicator,
              currentIndex === index && styles.activePageIndicator,
            ]}
          />
        ))}
      </View>

      {/* Heart Loading Overlay */}
      {heartLoading && (
        <View style={styles.heartLoadingOverlay}>
          <View style={styles.heartLoadingContainer}>
            <ActivityIndicator size="large" color="#FF3B6D" />
            <Text style={styles.heartLoadingText}>{t('home.finding_matches')}</Text>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topProfileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: topPadding,
    paddingBottom: 20,
  },
  topUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  topUserName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B6D',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#5D1F3A',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsImage: {
    width: 28,
    height: 28,
  },
  settingsText: {
    fontSize: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 10,
    paddingBottom: 120, // Extra padding at bottom to lift last card
  },
  cardWrapper: {
    height: height - 180,
    justifyContent: 'flex-start',
    paddingTop: 5, // Small gap to show previous card
  },
  lastCardWrapper: {
    paddingBottom: 40, // Extra padding for last card to be higher
  },
  cardContainer: {
    width: width - 40,
    height: height - 200, // Slightly smaller to allow peek of next card
    position: 'relative',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profileImageContainer: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: height * 0.21,  // Just slightly up - 21% instead of 22%
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    // backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  skipImage: {
    width: 49,
    height: 49,
  },
  topProfileOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 35,
    paddingBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  nameSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  motivateSection: {
    alignItems: 'flex-end',
    marginTop: -8,
  },
  motivateButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivateImage: {
    width: 80,
    height: 60,
    opacity: 1,
  },
  motivateText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  heartIcon: {
    position: 'absolute',
    right: 20,
    top: 110,
    // backgroundColor: '#FFFFFF',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  heartImage: {
    width: 50,
    height: 50,
  },
  heartText: {
    fontSize: 24,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 60,
    zIndex: 10,
  },
  bottomInfo: {
    marginBottom: 20,
  },
  gymSection: {
    marginBottom: 15,
  },
  gymSectionHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  gymRowHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 20,
  },
  purposeIcon: {
  
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  purposeIconImage: {
    width: 25,
    height: 25,
  },
  purposeIconText: {
    fontSize: 16,
  },
  genderSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  genderImage: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  raysImage: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  genderText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  purposeText: {
    color: '#FFFFFF',
    fontSize: 14,
   fontWeight:'bold'
  },
  profileInfo: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nameBackground: {
    backgroundColor: '#59595959',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 26,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  verifiedBadge: {
    backgroundColor: '#FF3B6D',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  verifiedText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: -48,
  },
  locationBackground: {
    backgroundColor: '#59595959',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
    lineHeight: 20,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  gymRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gymName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight:'bold'
  
  },
  activitiesContainer: {
    flexDirection: 'column',
    gap: 8,
    marginTop:8
    
  },
  activityTag: {
    backgroundColor: '#010918',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  activityText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  layoutImageContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 235,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  layoutImageWrapper: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  layoutImage: {
    width: '100%',
    height: '100%',
    opacity: 1,
  },
  pageIndicators: {
    position: 'absolute',
    right: 20,
    top: '50%',
    transform: [{translateY: -50}],
    flexDirection: 'column',
    gap: 8,
  },
  pageIndicator: {
    width: 4,
    height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  activePageIndicator: {
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
  noMatchesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  noMatchesText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  noMatchesSubText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#FF3B6D',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  heartLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  heartLoadingContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  heartLoadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default Home;