import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import {useTranslation} from 'react-i18next';

const { width, height } = Dimensions.get('window');

const ProfileDetails = ({ navigation, route }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();
  
  const passedProfile = route?.params?.profile;

  useEffect(() => {
    if (passedProfile?.id) {
      fetchUserProfile(passedProfile.id);
    } else {
      // Fallback to passed profile data if no ID
      setProfileData(formatProfileData(passedProfile));
      setLoading(false);
    }
  }, [passedProfile?.id]); // Only depend on ID, not the whole profile object

  // Reset image index when profileData changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [profileData]);

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const response = await apiService.GetApi(`api/profile/user/${userId}`);
      console.log("profile",response)
      if (response.success) {
        setProfileData(formatProfileData(response.user));
      } else {
        console.error('Failed to fetch user profile:', response.message);
        // Fallback to passed profile data
        setProfileData(formatProfileData(passedProfile));
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to passed profile data
      setProfileData(formatProfileData(passedProfile));
    } finally {
      setLoading(false);
    }
  };

  const formatProfileData = (profile) => {
    if (!profile) return null;
    
    return {
      name: profile?.name || profile?.firstName || t('profiledetails.default_name'),
      age: profile?.age || 28,
      isVerified: profile?.verified || profile?.isPhoneVerified || true,
      images: profile?.photos && profile.photos.length > 0 
        ? profile.photos.map(photo => photo.url) 
        : profile?.image 
          ? [profile.image]
          : [
              'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
              'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
              'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=687&q=80',
            ],
      experience: profile?.experience || t('profiledetails.years_experience'),
      clientsTrained: profile?.clientsTrained || t('profiledetails.clients_count'),
      location: profile?.gym || profile?.gymName || profile?.distance || t('profiledetails.default_gym'),
      about: profile?.bio || t('profiledetails.default_about'),
      lookingFor: profile?.lookingFor || t('profiledetails.default_looking_for'),
      interests: profile?.interests || profile?.activities || [t('profiledetails.default_interests.gym'), t('profiledetails.default_interests.sports'), t('profiledetails.default_interests.dance'), t('profiledetails.default_interests.adventure')],
      specializations: [t('profiledetails.personal_training'), t('profiledetails.functional_training'), t('profiledetails.cardio_fitness')],
      gender: profile?.gender || t('profiledetails.default_gender')
    };
  };

  // Debug final images array
  console.log('ProfileDetails - Final images array:', profileData?.images);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#F23576" />
        <Text style={styles.loadingText}>{t('profiledetails.loading')}</Text>
      </View>
    );
  }

  if (!profileData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{t('profiledetails.profile_not_found')}</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('profiledetails.go_back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleImagePress = (event) => {
    if (!profileData?.images || profileData.images.length <= 1) {
      return;
    }
    
    const { locationX } = event.nativeEvent;
    const imageWidth = width;
    const totalImages = profileData.images.length;
    
    if (locationX < imageWidth / 2) {
      // Left side - previous image (go backwards)
      setCurrentImageIndex(prev => {
        const newIndex = prev > 0 ? prev - 1 : totalImages - 1;
        return newIndex;
      });
    } else {
      // Right side - next image (go forwards)
      setCurrentImageIndex(prev => {
        const newIndex = prev < totalImages - 1 ? prev + 1 : 0;
        return newIndex;
      });
    }
  };

  const renderImageDots = () => {
    // Only show dots if there are multiple images
    if (!profileData?.images || profileData.images.length <= 1) {
      return null;
    }
    
    return (
      <View style={styles.dotsContainer}>
        {profileData.images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentImageIndex && styles.activeDot
            ]}
          />
        ))}
      </View>
    );
  };

  const renderTag = (text, icon = null) => (
    <View style={styles.tag}>
      {icon && <Image source={icon} style={styles.tagIcon} />}
      <Text style={styles.tagText}>{text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
     
    
      <View style={styles.imageContainer}>
        <TouchableOpacity 
          style={styles.imageTouch}
          onPress={handleImagePress}
          activeOpacity={1}
        >
          <Image
            source={{ uri: profileData.images[currentImageIndex] }}
            style={styles.profileImage}
            resizeMode="cover"
          />
        </TouchableOpacity>
      </View>
      
      {/* Dots positioned at the bottom edge of image */}
      {renderImageDots()}
      
   
      <LinearGradient
        colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
        locations={[0, 0.4, 0.9, 1]}
        style={styles.contentContainer}
      >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
           
            <View style={styles.nameSection}>
              <View style={styles.nameContainer}>
                <Text style={styles.name}>{profileData.name}, {profileData.age}</Text>
                {profileData.isVerified && (
                  <Image 
                    source={require('../../Assets/images/veri.png')} 
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
            </View>

         
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Image 
                  source={require('../../Assets/images/star.png')} 
                  style={styles.statIcon}
                />
                <View>
                  <Text style={styles.statLabel}>{t('profiledetails.experience')}</Text>
                  <Text style={styles.statValue}>{profileData.experience}</Text>
                </View>
              </View>
              
              <View style={styles.statItem}>
                <Image 
                  source={require('../../Assets/images/profileicon.png')} 
                  style={styles.statIcon}
                />
                <View>
                  <Text style={styles.statLabel}>{t('profiledetails.clients_trained')}</Text>
                  <Text style={styles.statValue}>{profileData.clientsTrained}</Text>
                </View>
              </View>
              
              <View style={styles.statItem}>
                <Image 
                  source={require('../../Assets/images/veri.png')} 
                  style={styles.statIcon}
                />
                <View style={styles.locationTextContainer}>
                  <Text style={styles.statLabel}>{t('profiledetails.location')}</Text>
                  <Text style={styles.statValue} numberOfLines={2}>{profileData.location}</Text>
                </View>
              </View>
            </View>

         
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profiledetails.about')}</Text>
              <Text style={styles.aboutText}>{profileData.about}</Text>
            </View>

       
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profiledetails.looking_for')}</Text>
              <Text style={styles.lookingForText}>{profileData.lookingFor}</Text>
            </View>

       
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profiledetails.interests')}</Text>
              <View style={styles.tagsContainer}>
                {profileData.interests && profileData.interests.map((interest, index) => {
                  let iconSource;
                  const lowerInterest = interest.toLowerCase();
                  
                  if (lowerInterest.includes('gym')) {
                    iconSource = require('../../Assets/images/gymicon.png');
                  } else if (lowerInterest.includes('sports')) {
                    iconSource = require('../../Assets/images/sportsicon.png');
                  } else if (lowerInterest.includes('dance')) {
                    iconSource = require('../../Assets/images/danceicon.png');
                  } else if (lowerInterest.includes('adventure') || lowerInterest.includes('outdoor')) {
                    iconSource = require('../../Assets/images/advantureicon.png');
                  } else {
                    iconSource = require('../../Assets/images/star.png');
                  }
                  
                  return (
                    <View key={index} style={styles.interestTag}>
                      <Image 
                        source={iconSource} 
                        style={styles.interestIcon}
                      />
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

         
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('profiledetails.specializations')}</Text>
              <View style={styles.tagsContainer}>
                {profileData.specializations && profileData.specializations.map((spec, index) => {
                  let iconSource;
                  const lowerSpec = spec.toLowerCase();
                  
                  if (lowerSpec.includes('personal training')) {
                    iconSource = require('../../Assets/images/gymicon.png');
                  } else if (lowerSpec.includes('functional training')) {
                    iconSource = require('../../Assets/images/gymdance.png');
                  } else if (lowerSpec.includes('cardio fitness')) {
                    iconSource = require('../../Assets/images/hline.png');
                  } else {
                    iconSource = require('../../Assets/images/veri.png');
                  }
                  
                  return (
                    <View key={index} style={styles.specializationTag}>
                      <Image 
                        source={iconSource} 
                        style={styles.specializationIcon}
                      />
                      <Text style={styles.specializationText}>{spec}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.bottomSpacing} />
          </ScrollView>

       
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.chatButton} 
              onPress={() => {
                console.log('Start Chatting clicked!');
                console.log('Navigation params:', {
                  userId: passedProfile?.id || 2,
                  userName: profileData.name,
                  userImage: profileData.images[0]
                });
                navigation.navigate('ChatRoom', {
                  userId: passedProfile?.id || 2,
                  userName: profileData.name,
                  userImage: profileData.images[0]
                });
              }}
            >
              <LinearGradient
                colors={['#F23576', '#F23576']}
                style={styles.chatButtonGradient}
              >
                <Text style={styles.chatButtonText}>{t('profiledetails.start_chatting')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  imageContainer: {
    height: height * 0.55, 
    position: 'relative',
    overflow: 'hidden', 
  },
  imageTouch: {
    width: '100%',
    height: '100%',
  },
  profileImage: {
    width: '100%',
    height: '140%', 
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    //  borderTopLeftRadius: 125,
    // borderTopRightRadius: 125,
  },
  dotsContainer: {
    position: 'absolute',
    top: height * 0.55 - 180, // Moved higher up from -150 to -180
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    zIndex: 15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  activeDot: {
    backgroundColor: '#5C1F3AB0',
    borderRadius: 2, // Square corners for active dot
    width: 12, // Slightly wider for active dot
  },
  contentContainer: {
    flex: 1,
    marginTop: -150, 
   
    paddingTop: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  nameSection: {
    marginBottom: 20,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: 'white',
    marginRight: 8,
  },
  verifiedIcon: {
    width: 24,
    height: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingHorizontal: 5,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flex: 1,
    marginHorizontal: 3,
  },
  statIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  
  },
  locationTextContainer: {
    flex: 1,
    flexShrink: 1,
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 12,
  },
  aboutText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    fontWeight: '400',
  },
  lookingForText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 24,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  interestIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
   
  },
  interestText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  specializationTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  specializationIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
    tintColor: 'rgba(255, 255, 255, 0.8)',
  },
  specializationText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 20,
  },
  chatButton: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  chatButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProfileDetails;