import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import { deleteAuthToken } from '../../utils/storage';
import { AuthContext } from '../../../App';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Settings = ({ navigation }) => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const insets = useSafeAreaInsets();

  // Get logout function from AuthContext
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await apiService.GetApi('api/profile/stats');

      if (response.success) {
        setProfileData(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to load profile data');
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      console.log("🚪 Logout initiated from Settings");
      setShowLogoutModal(false);

      // Call API to logout (optional)
      try {
        await apiService.Post('api/profile/logout', {});
        console.log("✅ API logout successful");
      } catch (apiError) {
        console.log("⚠️ API logout failed, but continuing with local logout:", apiError);
      }

      // Use the logout function from AuthContext
      await logout();

      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error('❌ Logout error:', error);

      // Even if there's an error, try to logout locally
      try {
        await logout();
      } catch (localLogoutError) {
        console.error('❌ Local logout also failed:', localLogoutError);
      }
    }
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const getProfileImageSource = () => {
    if (profileData?.user?.profileImage) {
      return { uri: profileData.user.profileImage };
    }
    return {
      uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'
    };
  };

  const getDisplayName = () => {
    if (profileData?.user) {
      return `${profileData.user.firstName} ${profileData.user.age}`;
    }
    return 'User';
  };

  if (loading) {
    return (
      <LinearGradient
        colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
        locations={[0, 0.4, 0.9, 1]}
        style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>Loading...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
      locations={[0, 0.4, 0.9, 1]}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#571D38" />


      <View style={[styles.header, { paddingTop: Platform.OS === 'android' && insets.top + 10 }]}>

        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
              source={require('../../Assets/images/backicon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIcon}>
            <Image
              source={require('../../Assets/images/veri.png')}
              style={styles.helpIcon}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIcon}>
            <Image
              source={require('../../Assets/images/setting.png')}
              style={styles.settingIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image
              source={getProfileImageSource()}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{getDisplayName()}</Text>
            {profileData?.user?.isVerified && (
              <Image
                source={require('../../Assets/images/veri.png')}
                style={styles.verifiedIcon}
              />
            )}
          </View>
        </View>

        {/* Complete Profile Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.progressContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>
                  {profileData?.profileCompletion?.percentage || 0}%
                </Text>
              </View>
              <View style={styles.progressTextContainer}>
                <Text style={styles.cardTitle}>Complete your profile</Text>
                <Text style={styles.cardSubtitle}>to stand out</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fit & Meet Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.fitMeetHeader}>
              <View style={styles.fitMeetIcon}>
                <Image
                  source={require('../../Assets/images/profileicon.png')}
                  style={styles.profileIconImage}
                />
              </View>
              <Text style={styles.cardTitle}>Fit & Meet</Text>
            </View>
            <TouchableOpacity style={styles.upgradeButton}>
              <Text style={styles.upgradeButtonText}>
                {profileData?.subscription?.type === 'Free' ? 'Upgrade' : 'Premium'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.featureHeaderRow}>
            <Text style={styles.whatsIncluded}>What's included</Text>
            <View style={styles.freeHeaderContainer}>
              <Text style={styles.freeHeaderText}>Free</Text>
              <Text style={styles.freeHeaderText}>Free</Text>
            </View>
          </View>

          {profileData?.subscription?.features?.map((feature, index) => (
            <View key={index} style={styles.featureRow}>
              <Text style={styles.featureText}>{feature.name}</Text>
              <View style={styles.featureStatus}>
                <Image
                  source={require('../../Assets/images/tick.png')}
                  style={[styles.tickIcon, { opacity: feature.freeAccess ? 1 : 0.3 }]}
                />
                <Image
                  source={require('../../Assets/images/tick.png')}
                  style={[styles.tickIcon, { opacity: feature.premiumAccess ? 1 : 0.3 }]}
                />
              </View>
            </View>
          ))}

          <View style={styles.seeAllFeaturesContainer}>
            <TouchableOpacity style={styles.seeAllFeatures}>
              <Text style={styles.featureText}>See all features</Text>
              <Image
                source={require('../../Assets/images/right.png')}
                style={styles.rightIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Super Likes Card */}
        <View style={styles.smallCard}>
          <View style={styles.smallCardContent}>
            <View style={styles.smallCardLeft}>
              <Image
                source={require('../../Assets/images/star.png')}
                style={styles.starIcon}
              />
              <View style={styles.smallCardText}>
                <Text style={styles.smallCardTitle}>
                  {profileData?.stats?.superLikes || 0} Super likes
                </Text>
                <Text style={styles.smallCardSubtitle}>Get more</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.plusButton}>
              <Image
                source={require('../../Assets/images/plus.png')}
                style={styles.plusIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Free For Now Card */}
        <View style={styles.smallCard}>
          <View style={styles.smallCardContent}>
            <View style={styles.smallCardLeft}>
              <Image
                source={require('../../Assets/images/gift.png')}
                style={styles.giftIcon}
              />
              <View style={styles.smallCardText}>
                <Text style={styles.smallCardTitle}>
                  {profileData?.subscription?.type || 'Free'} For Now
                </Text>
              </View>
            </View>
            <TouchableOpacity>
              <Image
                source={require('../../Assets/images/rightarrow.png')}
                style={styles.rightArrowIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Viewed Profile Card */}
        <View style={styles.smallCard}>
          <View style={styles.smallCardContent}>
            <View style={styles.smallCardLeft}>
              <Image
                source={require('../../Assets/images/eye.png')}
                style={styles.eyeIcon}
              />
              <View style={styles.smallCardText}>
                <Text style={styles.smallCardTitle}>
                  {profileData?.stats?.profileViews || 0} Viewed my Profile
                </Text>
                <Text style={styles.smallCardSubtitle}>Get more</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.plusButton}>
              <Image
                source={require('../../Assets/images/plus.png')}
                style={styles.plusIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout */}
        <View style={styles.logoutCard}>
          <TouchableOpacity style={styles.smallCardContent} onPress={handleLogout}>
            <Text style={styles.smallCardTitle}>Logout</Text>
            <Image
              source={require('../../Assets/images/exit.png')}
              style={styles.exitIcon}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Exit Icon */}
              <View style={styles.modalIconContainer}>
                <Image
                  source={require('../../Assets/images/exit.png')}
                  style={styles.modalExitIcon}
                />
              </View>

              {/* Title */}
              <Text style={styles.modalTitle}>Logout</Text>

              {/* Message */}
              <Text style={styles.modalMessage}>
                Are you sure you want to logout from your account?
              </Text>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={cancelLogout}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.logoutButton}
                  onPress={confirmLogout}>
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginLeft: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImageContainer: {
    marginBottom: 15,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginRight: 8,
  },
  verifiedIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
    marginLeft: 8,
  },
  backIcon: {
    width: 24,
    height: 24,
    // tintColor: 'white',
  },
  settingIcon: {
    width: 24,
    height: 24,
    // tintColor: 'white',
  },
  helpIcon: {
    width: 24,
    height: 24,
    // tintColor: 'white',
  },
  profileIconImage: {
    width: 24,
    height: 24,
    // tintColor: '#FF6B6B',
  },
  tickIcon: {
    width: 24,
    height: 24,
    // tintColor: '#4CAF50',
  },
  rightIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  starIcon: {
    width: 24,
    height: 24,
  },
  plusIcon: {
    width: 25,
    height: 25,
  },
  giftIcon: {
    width: 24,
    height: 24,
  },
  rightArrowIcon: {
    width: 24,
    height: 24,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  exitIcon: {
    width: 20,
    height: 20,
  },
  featureDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 15,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  progressText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  progressTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'white',
  },
  editButton: {
    backgroundColor: '#F2357661',
    paddingHorizontal: 20,
    paddingVertical: 3,
    borderRadius: 20,
    borderColor: 'white',
    borderWidth: 1
  },
  editButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  fitMeetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  fitMeetIcon: {
    marginRight: 10,
  },
  upgradeButton: {
    backgroundColor: '#F2357661',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
    borderColor: 'white',
    borderWidth: 1
  },
  upgradeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  whatsIncluded: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 10,
  },
  freeHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  freeHeaderText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  featureText: {
    fontSize: 14,
    color: 'white',
    flex: 1,
  },
  featureStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  freeText: {
    fontSize: 12,
    color: 'white',
  },
  seeAllFeatures: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllFeaturesContainer: {
    backgroundColor: '#F2357630',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    marginTop: 10,
    marginHorizontal: -20,
    marginBottom: -20,
    padding: 20,
    paddingTop: 15,
  },
  smallCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoutCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  smallCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  smallCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  smallCardText: {
    marginLeft: 15,
  },
  smallCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  smallCardSubtitle: {
    fontSize: 12,
    color: 'white',
    marginTop: 2,
  },
  plusButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    // backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 5,
    marginTop: 20,
    marginBottom: 30,
    backgroundColor: 'transparent',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 320,
  },
  modalContent: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalExitIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: 'white',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    flex: 1,
    backgroundColor: '#F2357661',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'white',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Settings;