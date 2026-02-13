import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import CameraGalleryPicker from '../../components/CameraGalleryPeacker';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import CustomeModal from '../../components/CustomeModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height } = Dimensions.get('window');
const isSmallScreen = height < 700;
const topPadding = isSmallScreen ? 35 : 50;


const EditProfile = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [userData, setUserData] = useState(null);
  const insets = useSafeAreaInsets();

  // Form fields
  const [firstName, setFirstName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [gender, setGender] = useState('');
  const [interestedIn, setInterestedIn] = useState('');
  const [lookingFor, setLookingFor] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [interests, setInterests] = useState([]);
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState([]);
  const [gymName, setGymName] = useState('');

  // Modal states
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showInterestedModal, setShowInterestedModal] = useState(false);
  const [showLookingForModal, setShowLookingForModal] = useState(false);
  const [showAgeRangeModal, setShowAgeRangeModal] = useState(false);

  const cameraGalleryRef = useRef(null);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Refresh data when coming back from SelectGym
  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.GetApi('api/auth/profile');

      if (response.success) {
        const user = response.user;
        setUserData(user);

        // Populate form fields
        setFirstName(user.firstName || '');
        setBirthday(user.birthday || '');
        setGender(user.gender || '');
        setInterestedIn(user.interestedIn || '');
        setLookingFor(user.lookingFor || '');
        setAgeRange(user.ageRange || '');
        setInterests(user.interests || []);
        setBio(user.bio || '');
        setPhotos(user.photos || []);
        setGymName(user.gymName || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(t('auth.otp.error'), t('settings.failed_load_profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const age = birthday ? calculateAge(birthday) : userData?.age;

      const updates = {
        firstName,
        birthday,
        age,
        gender,
        interestedIn,
        lookingFor,
        ageRange,
        interests,
        bio,
        gymName,
        photos
      };

      const response = await apiService.Put('api/profile/update', updates);

      if (response.success) {
        Alert.alert(
          t('editprofile.profile_updated'),
          t('editprofile.profile_updated_message'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert(t('auth.otp.error'), response.message || t('firstname.update_error'));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert(t('auth.otp.error'), t('firstname.update_error'));
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthdayString) => {
    const parts = birthdayString.split('/');
    const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleDateConfirm = (date) => {
    setSelectedDate(date);
    const formattedDate = formatDate(date);
    setBirthday(formattedDate);
    // setDatePickerOpen(false);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(i => i !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const handleAddPhoto = () => {
    if (cameraGalleryRef.current) {
      cameraGalleryRef.current.show();
    }
  };

  const handlePhotoSelected = async (response) => {
    if (response && response.assets && response.assets[0]) {
      const imageAsset = response.assets[0];
      await handlePhotoUpload(imageAsset);
    }
  };

  const handlePhotoUpload = async (imageAsset) => {
    try {
      setUploading(true);

      const response = await apiService.UploadFile(
        imageAsset.uri,
        imageAsset.fileName || `photo_${Date.now()}.jpg`,
        imageAsset.type || 'image/jpeg'
      );

      console.log('Photo upload response:', response);

      if (response && response.file && response.file.url) {
        const newPhoto = {
          url: response.file.url,
          publicId: response.file.publicId,
          uploadedAt: new Date()
        };

        setPhotos([...photos, newPhoto]);
        // Success - photo will be visible immediately
        console.log('Photo added successfully:', newPhoto.url);
      } else {
        Alert.alert(t('auth.otp.error'), t('firstname.upload_error'));
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      Alert.alert(t('auth.otp.error'), t('firstname.upload_error'));
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index) => {
    Alert.alert(
      t('editprofile.remove_photo'),
      t('editprofile.remove_photo_confirm'),
      [
        {
          text: t('editprofile.cancel'),
          style: 'cancel'
        },
        {
          text: t('editprofile.remove'),
          style: 'destructive',
          onPress: () => {
            const newPhotos = photos.filter((_, i) => i !== index);
            setPhotos(newPhotos);
          }
        }
      ]
    );
  };

  const availableInterests = [
    t('firstname.interests.creativity'),
    t('firstname.interests.sports'),
    t('firstname.interests.gym'),
    t('firstname.interests.movies'),
    t('firstname.interests.gaming'),
    t('firstname.interests.going_out'),
    t('firstname.interests.music'),
    t('firstname.interests.food_drink'),
    t('firstname.interests.staying_in'),
    t('firstname.interests.concert'),
    t('firstname.interests.dance'),
    t('firstname.interests.festival'),
    t('firstname.interests.adventure_outdoors'),
  ];

  if (loading) {
    return (
      <LinearGradient
        colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
        locations={[0, 0.4, 0.9, 1]}
        style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="white" />
        <Text style={styles.loadingText}>{t('profiledetails.loading')}</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
      locations={[0, 0.4, 0.9, 1]}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#571D38" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'android' && insets.top + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={require('../../Assets/images/backicon.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editprofile.title')}</Text>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#FF3B6D" />
          ) : (
            <Text style={styles.saveButtonText}>{t('editprofile.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Profile Strength */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editprofile.profile_strength')}</Text>
          <View style={styles.strengthCard}>
            <View style={styles.strengthCircle}>
              <Text style={styles.strengthText}>
                {userData?.profileCompleted ? '100' : '50'}%
              </Text>
            </View>
            <Text style={styles.strengthLabel}>{t('editprofile.complete')}</Text>
          </View>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editprofile.photos')}</Text>
          <Text style={styles.sectionSubtitle}>{t('editprofile.photos_subtitle')}</Text>
          <View style={styles.photosGrid}>
            {photos.slice(0, 6).map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo.url }} style={styles.photoImage} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto(index)}>
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 6 && (
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddPhoto}
                disabled={uploading}>
                {uploading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.addPhotoText}>+</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Interests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editprofile.interests')}</Text>
          <Text style={styles.sectionSubtitle}>{t('editprofile.interests_subtitle')}</Text>
          <View style={styles.interestsContainer}>
            {availableInterests.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.interestChip,
                  interests.includes(interest) && styles.interestChipSelected
                ]}
                onPress={() => toggleInterest(interest)}>
                <Text style={[
                  styles.interestText,
                  interests.includes(interest) && styles.interestTextSelected
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bio */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editprofile.bio')}</Text>
          <Text style={styles.sectionSubtitle}>{t('editprofile.bio_subtitle')}</Text>
          <TextInput
            style={styles.bioInput}
            placeholder={t('editprofile.bio_placeholder')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={bio}
            onChangeText={setBio}
            multiline
            maxLength={500}
          />
        </View>

        {/* About You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editprofile.about_you')}</Text>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setShowGenderModal(true)}>
            <View style={styles.infoLeft}>
              <Image
                source={require('../../Assets/images/gender.png')}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>{t('editprofile.gender')}</Text>
            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setDatePickerOpen(true)}>
            <View style={styles.infoLeft}>
              <Image
                source={require('../../Assets/images/gender.png')}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>{t('editprofile.birthday')}</Text>
            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => navigation.navigate('SelectGym', { fromEdit: true })}>
            <View style={styles.infoLeft}>
              <Image
                source={require('../../Assets/images/rays.png')}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>{t('editprofile.gym')}</Text>
            </View>

          </TouchableOpacity>
        </View>

        {/* More About You */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('editprofile.more_about_you')}</Text>
          <Text style={styles.sectionSubtitle}>{t('editprofile.more_about_you_subtitle')}</Text>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setShowInterestedModal(true)}>
            <View style={styles.infoLeft}>
              <Image
                source={require('../../Assets/images/gender.png')}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>{t('editprofile.interested_in')}</Text>
            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setShowLookingForModal(true)}>
            <View style={styles.infoLeft}>
              <Image
                source={require('../../Assets/images/gender.png')}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>{t('editprofile.looking_for')}</Text>
            </View>

          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoRow}
            onPress={() => setShowAgeRangeModal(true)}>
            <View style={styles.infoLeft}>
              <Image
                source={require('../../Assets/images/gender.png')}
                style={styles.infoIcon}
              />
              <Text style={styles.infoLabel}>{t('editprofile.age_range')}</Text>
            </View>

          </TouchableOpacity>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>

      {/* Date Picker Modal */}
      {/* <DatePicker
        modal
        open={datePickerOpen}
        date={selectedDate}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerOpen(false)}
        maximumDate={new Date()}
      /> */}

      <CustomeModal
        confirmButtonColor='#FF3B6D'
        confirmButtonName={t('firstname.confirm')}
        cancelButtonName={t('firstname.cancel')}
        title={t('firstname.select_birthday')}
        titleColor='#FF3B6D'
        onCancel={() => { console.log('Canceled'); setDatePickerOpen(false) }}
        onConfirm={() => { console.log('Confirmed'); setDatePickerOpen(false) }}
        open={datePickerOpen}
      >
        <RNDateTimePicker
          value={selectedDate}
          mode="date"
          maximumDate={new Date()}
          display='spinner'
          onChange={handleDateConfirm}
          title="Select your birthday" />
      </CustomeModal>

      {/* Gender Selection Modal */}
      <Modal
        visible={showGenderModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGenderModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('editprofile.select_gender')}</Text>
            {[
              { key: 'Man', label: t('editprofile.man') },
              { key: 'Woman', label: t('editprofile.woman') },
              { key: 'Other', label: t('editprofile.other') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  gender === option.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setGender(option.key);
                  setShowGenderModal(false);
                }}>
                <Text style={[
                  styles.modalOptionText,
                  gender === option.key && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowGenderModal(false)}>
              <Text style={styles.modalCancelText}>{t('editprofile.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Interested In Modal */}
      <Modal
        visible={showInterestedModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowInterestedModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('editprofile.interested_in_title')}</Text>
            {[
              { key: 'Man', label: t('editprofile.man') },
              { key: 'Woman', label: t('editprofile.woman') },
              { key: 'Every one', label: t('editprofile.everyone') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  interestedIn === option.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setInterestedIn(option.key);
                  setShowInterestedModal(false);
                }}>
                <Text style={[
                  styles.modalOptionText,
                  interestedIn === option.key && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowInterestedModal(false)}>
              <Text style={styles.modalCancelText}>{t('editprofile.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Looking For Modal */}
      <Modal
        visible={showLookingForModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLookingForModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('editprofile.looking_for_title')}</Text>
            {[
              { key: 'Long-term Partner', label: t('editprofile.long_term_partner') },
              { key: 'Work out Partner', label: t('editprofile.workout_partner') },
              { key: 'Looking for Both', label: t('editprofile.looking_for_both') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  lookingFor === option.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setLookingFor(option.key);
                  setShowLookingForModal(false);
                }}>
                <Text style={[
                  styles.modalOptionText,
                  lookingFor === option.key && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowLookingForModal(false)}>
              <Text style={styles.modalCancelText}>{t('editprofile.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Age Range Modal */}
      <Modal
        visible={showAgeRangeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAgeRangeModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('editprofile.age_range_title')}</Text>
            {[
              { key: '18-25', label: t('editprofile.age_18_25') },
              { key: '25-35', label: t('editprofile.age_25_35') },
              { key: '35-45', label: t('editprofile.age_35_45') },
              { key: '45-Over', label: t('editprofile.age_45_over') }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.modalOption,
                  ageRange === option.key && styles.modalOptionSelected
                ]}
                onPress={() => {
                  setAgeRange(option.key);
                  setShowAgeRangeModal(false);
                }}>
                <Text style={[
                  styles.modalOptionText,
                  ageRange === option.key && styles.modalOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowAgeRangeModal(false)}>
              <Text style={styles.modalCancelText}>{t('editprofile.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CameraGalleryPicker
        refs={cameraGalleryRef}
        getImageValue={handlePhotoSelected}
        cancel={() => { }}
        base64={false}
        quality={0.8}
        maxWidth={1024}
        maxHeight={1024}
      />
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
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
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
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    minWidth: 100,
    alignItems: 'flex-end',
  },
  saveButtonText: {
    color: '#FF3B6D',
    fontSize: 14,
    fontWeight: '600',

  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 15,
  },
  strengthCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
  },
  strengthCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  strengthText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  strengthLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoItem: {
    width: (Dimensions.get('window').width - 60) / 3,
    height: 120,
    borderRadius: 10,
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  addPhotoButton: {
    width: (Dimensions.get('window').width - 60) / 3,
    height: 120,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  addPhotoText: {
    color: '#FFFFFF',
    fontSize: 32,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  interestChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  interestChipSelected: {
    backgroundColor: '#FF3B6D',
    borderColor: '#FF3B6D',
  },
  interestText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  interestTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bioInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 15,
    borderRadius: 15,
    marginBottom: 10,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  infoLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  infoValue: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2A1A2E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  modalOptionSelected: {
    backgroundColor: '#FF3B6D',
  },
  modalOptionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modalCancelButton: {
    marginTop: 10,
    padding: 16,
  },
  modalCancelText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EditProfile;
