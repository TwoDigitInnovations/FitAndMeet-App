import React, {useState, useEffect, useRef, useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
  TextInput,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import apiService from '../../services/apiService';
import {useTranslation} from 'react-i18next';
import {AuthContext} from '../../../App';

const SelectGym = ({navigation, route}) => {
  const {logout} = useContext(AuthContext);
  const fromEdit = route?.params?.fromEdit || false;
  const [selectedGym, setSelectedGym] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [gymList, setGymList] = useState([]);
  const [displayedGyms, setDisplayedGyms] = useState([]);
  const [filteredGyms, setFilteredGyms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const ITEMS_PER_PAGE = 20;
  
  const scrollViewRef = useRef(null);
  const searchInputRef = useRef(null);
  const {t} = useTranslation();

  useEffect(() => {
    requestLocationPermission();
    
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: t('selectgym.permission_title'),
            message: t('selectgym.permission_message'),
            buttonNeutral: t('selectgym.permission_neutral'),
            buttonNegative: t('selectgym.permission_negative'),
            buttonPositive: t('selectgym.permission_positive'),
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert(t('selectgym.permission_denied'), t('selectgym.permission_denied_message'));
        }
      } else {
        getCurrentLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const getCurrentLocation = () => {
    setLoading(true);
    setErrorMessage(t('selectgym.getting_location'));
    console.log('Requesting location...');
    
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        console.log(`Location found: ${latitude}, ${longitude}`);
        setUserLocation({latitude, longitude});
        setErrorMessage(t('selectgym.finding_gyms'));
        fetchGymsFromGooglePlaces(latitude, longitude);
      },
      error => {
        console.error('Location error:', error);
        console.log('Location failed, showing error message');
        setLoading(false);
        setErrorMessage(t('selectgym.location_error'));
      },
      {enableHighAccuracy: true, timeout: 30000, maximumAge: 5000},
    );
  };

  const fetchGymsFromGooglePlaces = async (latitude, longitude, retryCount = 0) => {
    const GOOGLE_MAPS_API_KEY = 'AIzaSyBlEwVIzuGoWJQToyi0GSGCvarjN83d4Cg';
    
    try {
      setLoading(true);
      const radius = 12000;
      
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=gym&key=${GOOGLE_MAPS_API_KEY}`;
      
      console.log(`Fetching gyms from Google Places API...`);
      setErrorMessage(t('selectgym.loading_gyms'));

      const response = await axios.get(url, {
        timeout: 30000,
      });

      if (response.data && response.data.results) {
        const gyms = response.data.results
          .map(place => {
            const name = place.name || 'Unnamed Gym';
            const lat = place.geometry?.location?.lat;
            const lng = place.geometry?.location?.lng;
            
            if (!lat || !lng) return null;
            
            const distance = calculateDistance(latitude, longitude, lat, lng);
            
            return {
              id: place.place_id,
              name: name,
              address: place.vicinity || 'Address not available',
              distance: distance,
              lat: lat,
              lon: lng,
              rating: place.rating || 0,
              user_ratings_total: place.user_ratings_total || 0,
            };
          })
          .filter(gym => gym !== null)
          .sort((a, b) => a.distance - b.distance);

        if (gyms.length > 0) {
          setGymList(gyms);
          loadMoreGyms(gyms, 0);
          setErrorMessage('');
          setLoading(false);
          console.log(`Found ${gyms.length} gyms from Google Places`);
        } else {
          console.log('No gyms found from Google Places');
          setErrorMessage(t('selectgym.no_gyms_found'));
          setLoading(false);
        }
      } else {
        console.log('Invalid Google Places response');
        setErrorMessage(t('selectgym.connection_error'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching gyms from Google Places:', error.message);
      
      if (retryCount < 2) {
        console.log(`Retrying Google Places API... (${retryCount + 1})`);
        setErrorMessage(t('selectgym.retrying', {count: retryCount + 1}));
        setTimeout(() => {
          fetchGymsFromGooglePlaces(latitude, longitude, retryCount + 1);
        }, 1000);
      } else {
        console.log('Google Places API failed after retries');
        setErrorMessage(t('selectgym.connection_retry_error'));
        setLoading(false);
      }
    } finally {
      if (retryCount >= 2) {
        setLoading(false);
      }
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const loadMoreGyms = (allGyms = gymList, page = currentPage) => {
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newGyms = allGyms.slice(startIndex, endIndex);

    if (newGyms.length > 0) {
      setDisplayedGyms(prev => [...prev, ...newGyms]);
      setFilteredGyms(prev => [...prev, ...newGyms]);
      setCurrentPage(page + 1);
    }
    setLoadingMore(false);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredGyms(displayedGyms);
    } else {
      const filtered = displayedGyms.filter(gym =>
        gym.name.toLowerCase().includes(text.toLowerCase()) ||
        gym.address.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredGyms(filtered);
    }
  };

  const handleBack = async () => {
    if (fromEdit) {
      // Coming from EditProfile, just go back
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    } else {
      // Coming from registration flow, logout
      await logout();
      // Navigate to Auth stack Welcome screen
      navigation.reset({
        index: 0,
        routes: [{name: 'Auth'}],
      });
    }
  };

  const handleSelectGym = gym => {
    setSelectedGym(gym);
    setShowDropdown(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleApply = async () => {
    if (selectedGym) {
      try {
        const userDetailString = await AsyncStorage.getItem('userDetail');
        
        if (userDetailString) {
          const userDetail = JSON.parse(userDetailString);
          
          if (userDetail.token) {
            const { setAuthToken } = require('../../utils/storage');
            await setAuthToken(userDetail.token);
          }
        }

        console.log('Sending gym selection data:', {
          gymName: selectedGym,
          gymLocation: userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            address: displayedGyms.find(g => g.name === selectedGym)?.address || '',
          } : null,
        });

        const response = await apiService.Post('api/registration/gym-selection', {
          gymName: selectedGym,
          gymLocation: userLocation ? {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            address: displayedGyms.find(g => g.name === selectedGym)?.address || '',
          } : null,
        });

        console.log('Gym selection response:', response);

        if (response.success) {
          if (fromEdit) {
            // If coming from Edit Profile, go back
            navigation.goBack();
          } else {
            // If from registration flow, continue to TermsScreen
            navigation.navigate('TermsScreen');
          }
        } else {
          Alert.alert(t('auth.otp.error'), response.message || t('selectgym.save_error'));
        }
      } catch (error) {
        console.error('Save gym error:', error);
        Alert.alert(t('auth.otp.error'), t('selectgym.save_error'));
      }
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#87CEEB"
        barStyle="light-content"
        translucent={false}
      />

      <View style={[
        styles.imageContainer,
        isKeyboardVisible && styles.imageContainerKeyboard
      ]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Image
            source={require('../../Assets/images/back.png')}
            style={styles.backIcon}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <Image
          source={require('../../Assets/images/img4.png')}
          style={styles.headerImage}
          resizeMode="cover"
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={[
            styles.bottomCard,
            isKeyboardVisible && styles.bottomCardKeyboard
          ]}>
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.scrollContent,
                isKeyboardVisible && styles.scrollContentKeyboard
              ]}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              nestedScrollEnabled={true}
              bounces={false}>
              <Text style={styles.title}>{t('selectgym.title')}</Text>
              <Text style={styles.subtitle}>{t('selectgym.subtitle')}</Text>

              {errorMessage ? (
                <View style={styles.infoContainer}>
                  <ActivityIndicator size="small" color="#FF3B6D" />
                  <Text style={styles.infoText}>{errorMessage}</Text>
                </View>
              ) : null}

              <View style={styles.inputContainer}>
                <TextInput
                  ref={searchInputRef}
                  style={styles.gymInput}
                  placeholder={t('selectgym.placeholder')}
                  placeholderTextColor="#A0A0A0"
                  value={searchQuery || selectedGym}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    setSelectedGym('');
                    setShowDropdown(true);
                    handleSearch(text);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  editable={!loading}
                />
                {loading ? (
                  <ActivityIndicator size="small" color="#FF3B6D" style={styles.inputIcon} />
                ) : (
                  <TouchableOpacity 
                    onPress={() => setShowDropdown(!showDropdown)}
                    style={styles.inputIconButton}
                  >
                    <Image
                      source={require('../../Assets/images/back.png')}
                      style={[styles.dropdownIcon, showDropdown && styles.dropdownIconUp]}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                )}
              </View>

              {showDropdown && !loading && (
                <View style={[
                  styles.dropdownContainer,
                  isKeyboardVisible && styles.dropdownContainerKeyboard
                ]}>
                  <ScrollView 
                    style={styles.dropdownList}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}
                    bounces={false}
                    keyboardShouldPersistTaps="handled">
                    {filteredGyms.map((item, index) => (
                      <TouchableOpacity
                        key={`${item.id}-${index}`}
                        style={styles.dropdownItem}
                        onPress={() => handleSelectGym(item.name)}>
                        <View>
                          <Text style={styles.dropdownItemText}>{item.name}</Text>
                          <Text style={styles.gymAddress}>{item.address}</Text>
                          <View style={styles.gymInfoRow}>
                            <Text style={styles.gymDistance}>{t('selectgym.km_away', {distance: item.distance.toFixed(2)})}</Text>
                            {item.rating && item.rating > 0 && (
                              <Text style={styles.gymRating}>⭐ {item.rating.toFixed(1)}</Text>
                            )}
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                    {loadingMore && (
                      <View style={styles.footerLoader}>
                        <ActivityIndicator size="small" color="#FF3B6D" />
                      </View>
                    )}
                    {filteredGyms.length === 0 && (
                      <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                          {searchQuery ? t('selectgym.no_search_results') : t('selectgym.no_nearby_gyms')}
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              )}

              <View style={[
                styles.bottomSpacer,
                isKeyboardVisible && styles.bottomSpacerKeyboard
              ]} />
            </ScrollView>

            {!isKeyboardVisible && (
              <View style={styles.applyButtonContainer}>
                <TouchableOpacity
                  style={[styles.applyButton, !selectedGym && styles.applyButtonDisabled]}
                  onPress={handleApply}
                  disabled={!selectedGym}>
                  <Text style={styles.applyButtonText}>
                    {fromEdit ? 'Update' : t('selectgym.apply_button')}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  imageContainer: {
    height: '45%',
    position: 'relative',
  },
  imageContainerKeyboard: {
    height: '20%',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 28,
    height: 28,
    tintColor: '#FFFFFF',
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  bottomCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 25,
    paddingTop: 30,
    marginTop: -30,
  },
  bottomSpacer: {
    height: 120,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  gymInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: '100%',
  },
  inputIconButton: {
    padding: 5,
  },
  inputIcon: {
    marginLeft: 10,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8F8F8',
    marginBottom: 15,
  },
  dropdownText: {
    fontSize: 16,
    color: '#000000',
  },
  placeholderText: {
    color: '#A0A0A0',
  },
  dropdownIcon: {
    width: 20,
    height: 20,
    transform: [{rotate: '-90deg'}],
    tintColor: '#000000',
  },
  dropdownIconUp: {
    transform: [{rotate: '90deg'}],
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    overflow: 'hidden',
    maxHeight: 300,
  },
  dropdownList: {
    paddingVertical: 5,
  },
  dropdownItem: {
    paddingVertical: 15, // Increased padding for better visibility
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '600',
    marginBottom: 4,
  },
  gymAddress: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  gymDistance: {
    fontSize: 11,
    color: '#FF3B6D',
    fontWeight: '500',
  },
  gymInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gymRating: {
    fontSize: 11,
    color: '#FFA500',
    fontWeight: '500',
  },
  footerLoader: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 13,
    color: '#666666',
    marginLeft: 10,
  },
  applyButtonContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
    paddingVertical: 20,
    paddingBottom: 40,
  },
  applyButton: {
    backgroundColor: '#FF3B6D',
    height: 45,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: '#FFB3C6',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomCardKeyboard: {
    flex: 1,
    height: '80%',
    marginTop: -60,
  },
  scrollContentKeyboard: {
    paddingBottom: 80,
  },
  dropdownContainerKeyboard: {
    maxHeight: 280,
  },
  bottomSpacerKeyboard: {
    height: 10,
  },
  applyButtonContainerKeyboard: {
    paddingVertical: 15,
    paddingBottom: 30,
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
  },
});

export default SelectGym;
