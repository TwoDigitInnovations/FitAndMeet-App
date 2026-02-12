import React, { useState, useRef } from 'react';
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
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import apiService from '../../services/apiService';
import CameraGalleryPicker from '../../components/CameraGalleryPeacker';
import DateTimePicker from '@react-native-community/datetimepicker';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import CustomeModal from '../../components/CustomeModal'

const FirstName = ({ navigation }) => {
  const [currentStep, setCurrentStep] = useState(1);
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
  const [uploading, setUploading] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(null);

  const cameraGalleryRef = useRef(null);

  const handleBack = () => {
    if (currentStep === 1) {
      navigation.goBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = async () => {
    if (currentStep === 1 && firstName.trim()) {
      await updateProfile({ firstName: firstName.trim(), currentStep: 2 });
      setCurrentStep(2);
    } else if (currentStep === 2 && birthday.trim()) {
      const age = calculateAge(birthday);
      await updateProfile({ birthday: birthday.trim(), age, currentStep: 3 });
      setCurrentStep(3);
    } else if (currentStep === 3 && gender) {
      await updateProfile({ gender, currentStep: 4 });
      setCurrentStep(4);
    } else if (currentStep === 4 && interestedIn) {
      await updateProfile({ interestedIn, currentStep: 5 });
      setCurrentStep(5);
    } else if (currentStep === 5 && lookingFor) {
      await updateProfile({ lookingFor, currentStep: 6 });
      setCurrentStep(6);
    } else if (currentStep === 6 && ageRange) {
      await updateProfile({ ageRange, currentStep: 7 });
      setCurrentStep(7);
    } else if (currentStep === 7 && interests.length > 0) {
      await updateProfile({ interests, currentStep: 8 });
      setCurrentStep(8);
    } else if (currentStep === 8 && bio.trim()) {
      await updateProfile({ bio: bio.trim(), currentStep: 9 });
      setCurrentStep(9);
    } else if (currentStep === 9 && photos.length > 0) {
      await completeRegistration();
    }
  };

  const handleDateConfirm = (event, date) => {
    console.log(date)
    setSelectedDate(new Date(date));
    const formattedDate = formatDate(new Date(date));
    setBirthday(formattedDate);
    // setDatePickerOpen(false);
  };

  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleDateChange = (text) => {
    // Auto-format as user types: DD/MM/YYYY
    let cleaned = text.replace(/\D/g, ''); // Remove non-digits
    let formatted = cleaned;

    if (cleaned.length >= 2) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 4) {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
    }

    setBirthday(formatted);
  };

  const validateDate = (dateStr) => {
    const parts = dateStr.split('/');
    if (parts.length !== 3) return false;

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1950 || year > new Date().getFullYear()) {
      return false;
    }

    const date = new Date(year, month - 1, day);
    return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
  };

  const calculateAge = (birthdayStr) => {

    const parts = birthdayStr.split('/').map(p => p.trim());
    if (parts.length === 3) {
      const birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    }
    return 0;
  };

  const updateProfile = async (data) => {
    try {
      const response = await apiService.Post('api/registration/update-profile', data);
      if (!response.success) {
        Alert.alert('Error', response.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const completeRegistration = async () => {
    setUploading(true);
    try {
      const response = await apiService.Post('api/registration/complete', {});

      if (response.success) {
        // Registration completed successfully
        Alert.alert(
          'Registration Complete!',
          'Welcome to Fit & Meet! Your profile has been created successfully.',
          [
            {
              text: 'Get Started', onPress: () => {
                // Navigate to home screen
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'App' }],
                });
              }
            }
          ]
        );
      } else {
        if (response.missingFields && response.missingFields.length > 0) {
          Alert.alert(
            'Profile Incomplete',
            `Please complete the following: ${response.missingFields.join(', ')}`
          );
        } else {
          Alert.alert('Error', response.message || 'Failed to complete registration');
        }
      }
    } catch (error) {
      console.error('Complete registration error:', error);
      Alert.alert('Error', 'Failed to complete registration. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoUpload = (index) => {
    setCurrentPhotoIndex(index);
    cameraGalleryRef.current?.show();
  };

  const handleImageSelected = async (response) => {
    console.log('Image selected:', response);

    if (!response || !response.assets || !response.assets[0]) {
      console.log('No image selected');
      return;
    }

    const image = response.assets[0];
    const index = currentPhotoIndex;

    setUploading(true);
    try {
      const uploadResponse = await apiService.UploadFile(
        image.uri,
        image.fileName || `photo_${index}.jpg`,
        image.type || 'image/jpeg',
      );

      if (uploadResponse.file) {
        const newPhotos = [...photos];
        newPhotos[index] = {
          uri: image.uri,
          url: uploadResponse.file.url,
          publicId: uploadResponse.file.publicId,
          uploadedAt: new Date(),
        };
        setPhotos(newPhotos);


        await updateProfile({ photos: newPhotos });

        Alert.alert('Success', 'Photo uploaded successfully');
      } else {
        Alert.alert('Error', uploadResponse.error || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      Alert.alert('Error', 'Failed to upload photo');
    } finally {
      setUploading(false);
      setCurrentPhotoIndex(null);
    }
  };

  const handleCancel = () => {
    cameraGalleryRef.current?.hide();
    setCurrentPhotoIndex(null);
  };

  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      setInterests(interests.filter(item => item !== interest));
    } else {
      setInterests([...interests, interest]);
    }
  };

  const getStepData = () => {
    switch (currentStep) {
      case 1:
        return {
          progress: '14%',
          image: require('../../Assets/images/name1.png'),
          title: "What's your first name?",
          placeholder: 'Diya',
          value: firstName,
          onChangeText: setFirstName,
          subtitle: (
            <Text style={styles.firstNameSubtitle}>
              This is how it'll appear on your profile.{'\n'}
              <Text style={styles.boldText}>Can't change it later.</Text>
            </Text>
          ),
        };
      case 2:
        return {
          progress: '28%',
          image: require('../../Assets/images/name2.png'),
          title: 'Your B-day?',
          placeholder: '09/12/2000',
          value: birthday,
          isBirthdayStep: true,
          subtitle: (
            <Text style={styles.firstNameSubtitle}>
              Your profile shows your age, not your{'\n'}birth date.
            </Text>
          ),
        };
      case 3:
        return {
          progress: '42%',
          image: require('../../Assets/images/name3.png'),
          title: "What's your gender?",
          isGenderStep: true,
          subtitle: (
            <Text style={styles.subtitle}>
              Select all that describe you to help us show your{'\n'}profile to the right people. You can add more{'\n'}details if you'd like.
            </Text>
          ),
        };
      case 4:
        return {
          progress: '56%',
          image: require('../../Assets/images/name4.png'),
          title: 'Who are you interested in seeing?',
          isInterestedStep: true,
          subtitle: (
            <Text style={styles.interestedSubtitle}>
              Select all that apply to help us recommend the{'\n'}right people for you.
            </Text>
          ),
        };
      case 5:
        return {
          progress: '70%',
          image: require('../../Assets/images/name5.png'),
          title: 'Who are you Looking for?',
          isLookingForStep: true,
          subtitle: (
            <Text style={styles.interestedSubtitle}>
              All good if it changes. There's something for{'\n'}everyone.
            </Text>
          ),
        };
      case 6:
        return {
          progress: '84%',
          image: require('../../Assets/images/name6.png'),
          title: 'What age range are you comfortable connecting with?',
          isAgeRangeStep: true,
          subtitle: (
            <Text style={styles.interestedSubtitle}>
              Select the age range are you looking for.
            </Text>
          ),
        };
      case 7:
        return {
          progress: '98%',
          image: require('../../Assets/images/name5.png'),
          title: 'What are you into?',
          isInterestsStep: true,
          subtitle: (
            <Text style={styles.interestedSubtitle}>
              You like what you like. Now, let everyone know.
            </Text>
          ),
        };
      case 8:
        return {
          progress: '100%',
          image: require('../../Assets/images/name8.png'),
          title: 'Me in a few words?',
          isBioStep: true,
          subtitle: (
            <Text style={styles.interestedSubtitle}>
              Write five what you like. Now, let everyone know{'\n'}about your bio.
            </Text>
          ),
        };
      case 9:
        return {
          progress: '100%',
          image: require('../../Assets/images/name9.png'),
          title: 'Add your Photos',
          isPhotoStep: true,
          subtitle: (
            <Text style={styles.interestedSubtitle}>
              Up to 10 photos max (5MB per photo max)
            </Text>
          ),
        };
      default:
        return {};
    }
  };

  const stepData = getStepData();
  const isNextDisabled =
    currentStep === 1 ? !firstName.trim() :
      currentStep === 2 ? !birthday.trim() :
        currentStep === 3 ? !gender :
          currentStep === 4 ? !interestedIn :
            currentStep === 5 ? !lookingFor :
              currentStep === 6 ? !ageRange :
                currentStep === 7 ? interests.length === 0 :
                  currentStep === 8 ? !bio.trim() :
                    currentStep === 9 ? photos.length === 0 : false;

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#FF3B6D"
        barStyle="light-content"
        translucent={false}
      />


      <View style={styles.header}>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: stepData.progress }]} />
        </View>


        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>


        <View style={styles.profileIconContainer}>
          <Image
            source={stepData.image}
            style={styles.profileImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>{stepData.title}</Text>

          {stepData.isGenderStep ? (
            <View>
              {stepData.subtitle}

              <Text style={styles.iAmText}>I am</Text>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setGender('Man')}>
                <Text style={styles.genderText}>Man</Text>
                <View style={[styles.radioButton, gender === 'Man' && styles.radioButtonSelected]}>
                  {gender === 'Man' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setGender('Woman')}>
                <Text style={styles.genderText}>Woman</Text>
                <View style={[styles.radioButton, gender === 'Woman' && styles.radioButtonSelected]}>
                  {gender === 'Woman' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setGender('Other')}>
                <Text style={styles.genderText}>Other</Text>
                <View style={[styles.radioButton, gender === 'Other' && styles.radioButtonSelected]}>
                  {gender === 'Other' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.learnMoreButton}>
                {/* <Text style={styles.learnMoreText}>Learn how Fit & Meet uses this info</Text> */}
              </TouchableOpacity>
            </View>
          ) : stepData.isPhotoStep ? (
            <View>
              {stepData.subtitle}

              <View style={styles.photoGrid}>
                {[0, 1, 2, 3, 4].map((index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.photoSlot,
                      photos[index] && styles.photoSlotSelected
                    ]}
                    onPress={() => handlePhotoUpload(index)}
                    disabled={uploading}>
                    {photos[index] ? (
                      <Image
                        source={{ uri: photos[index].uri }}
                        style={styles.photoImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={require('../../Assets/images/camm.png')}
                        style={styles.cameraImage}
                        resizeMode="contain"
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              {uploading && (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="small" color="#FF3B6D" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              )}
            </View>
          ) : stepData.isBioStep ? (
            <View>
              {stepData.subtitle}

              <TextInput
                style={styles.bioTextArea}
                value={bio}
                onChangeText={setBio}
                placeholder="Add your bio"
                placeholderTextColor="#CCCCCC"
                multiline={true}
                numberOfLines={8}
                maxLength={500}
              />
            </View>
          ) : stepData.isInterestsStep ? (
            <View>
              {stepData.subtitle}

              <View style={styles.interestsGrid}>
                {[
                  { name: 'Creativity', image: require('../../Assets/images/Paint.png') },
                  { name: 'Sports', image: require('../../Assets/images/tennis ball.png') },
                  { name: 'Gym', image: require('../../Assets/images/Gym.png') },
                  { name: 'Movies', image: require('../../Assets/images/Clapper Board.png') },
                  { name: 'Gaming', image: require('../../Assets/images/Gaming.png') },
                  { name: 'Going out', image: require('../../Assets/images/Disco Light.png') },
                  { name: 'Music', image: require('../../Assets/images/Music.png') },
                  { name: 'Food & Drink', image: require('../../Assets/images/Food.png') },
                  { name: 'Staying in', image: require('../../Assets/images/Home.png') },
                  { name: 'Concert', image: require('../../Assets/images/Dancing.png') },
                  { name: 'Dance', emoji: '💃' },
                  { name: 'Festival', image: require('../../Assets/images/Barley.png') },
                  { name: 'Adventure & outdoors', image: require('../../Assets/images/image 66.png') },
                ].map((interest, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.interestCard,
                      interests.includes(interest.name) && styles.interestCardSelected
                    ]}
                    onPress={() => toggleInterest(interest.name)}>
                    {interest.image ? (
                      <Image
                        source={interest.image}
                        style={styles.interestImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.interestEmoji}>{interest.emoji}</Text>
                    )}
                    <Text style={[
                      styles.interestText,
                      interests.includes(interest.name) && styles.interestTextSelected
                    ]}>{interest.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : stepData.isAgeRangeStep ? (
            <View>
              {stepData.subtitle}

              <View style={styles.ageRangeContainer}>
                <TouchableOpacity
                  style={[styles.ageRangeButton, ageRange === '18-25' && styles.ageRangeButtonSelected]}
                  onPress={() => setAgeRange('18-25')}>
                  <Text style={[styles.ageRangeText, ageRange === '18-25' && styles.ageRangeTextSelected]}>18-25</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ageRangeButton, ageRange === '25-35' && styles.ageRangeButtonSelected]}
                  onPress={() => setAgeRange('25-35')}>
                  <Text style={[styles.ageRangeText, ageRange === '25-35' && styles.ageRangeTextSelected]}>25-35</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ageRangeButton, ageRange === '35-45' && styles.ageRangeButtonSelected]}
                  onPress={() => setAgeRange('35-45')}>
                  <Text style={[styles.ageRangeText, ageRange === '35-45' && styles.ageRangeTextSelected]}>35-45</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ageRangeButton, ageRange === '45-Over' && styles.ageRangeButtonSelected]}
                  onPress={() => setAgeRange('45-Over')}>
                  <Text style={[styles.ageRangeText, ageRange === '45-Over' && styles.ageRangeTextSelected]}>45-Over</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.learnMoreButton}>
                {/* <Text style={styles.learnMoreText}>Learn how Fit & Meet uses this info</Text> */}
              </TouchableOpacity>
            </View>
          ) : stepData.isLookingForStep ? (
            <View>
              {stepData.subtitle}

              <TouchableOpacity
                style={[
                  styles.lookingForCard,
                  lookingFor === 'Long-term Partner' && styles.lookingForCardSelected
                ]}
                onPress={() => {
                  setLookingFor('Long-term Partner');
                }}>
                <Image
                  source={require('../../Assets/images/heart.png')}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
                <Text style={styles.cardText}>Long-term Partner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.lookingForCard, lookingFor === 'Work out Partner' && styles.lookingForCardSelected]}
                onPress={() => {
                  setLookingFor('Work out Partner');
                }}>
                <Image
                  source={require('../../Assets/images/dumb.png')}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
                <Text style={styles.cardText}>Work out Partner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.lookingForCard, lookingFor === 'Looking for Both' && styles.lookingForCardSelected]}
                onPress={() => {
                  setLookingFor('Looking for Both');
                }}>
                <Image
                  source={require('../../Assets/images/emoji.png')}
                  style={styles.cardImage}
                  resizeMode="contain"
                />
                <Text style={styles.cardText}>Looking for Both</Text>
              </TouchableOpacity>
            </View>
          ) : stepData.isInterestedStep ? (
            <View>
              {stepData.subtitle}

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setInterestedIn('Man')}>
                <Text style={styles.genderText}>Man</Text>
                <View style={[styles.radioButton, interestedIn === 'Man' && styles.radioButtonSelected]}>
                  {interestedIn === 'Man' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setInterestedIn('Woman')}>
                <Text style={styles.genderText}>Woman</Text>
                <View style={[styles.radioButton, interestedIn === 'Woman' && styles.radioButtonSelected]}>
                  {interestedIn === 'Woman' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.genderOption}
                onPress={() => setInterestedIn('Every one')}>
                <Text style={styles.genderText}>Every one</Text>
                <View style={[styles.radioButton, interestedIn === 'Every one' && styles.radioButtonSelected]}>
                  {interestedIn === 'Every one' && <View style={styles.radioButtonInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.learnMoreButton}>
                {/* <Text style={styles.learnMoreText}>Learn how Fit & Meet uses this info</Text> */}
              </TouchableOpacity>
            </View>
          ) : stepData.isBirthdayStep ? (
            <View>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setDatePickerOpen(true)}>
                <Text style={[
                  styles.datePickerText,
                  !birthday && styles.datePickerPlaceholder
                ]}>
                  {birthday || stepData.placeholder}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>
              {stepData.subtitle}


              <CustomeModal
                confirmButtonColor='#FF3B6D'
                confirmButtonName='CONFIRM'
                title='Select Your Birthday'
                titleColor='#FF3B6D'
                onCancel={() => { console.log('Canceled'); setDatePickerOpen(false) }}
                onConfirm={() => { console.log('Confirmed'); setDatePickerOpen(false) }}
                open={datePickerOpen}
              >
                <RNDateTimePicker
                  value={selectedDate}
                  mode="date"
                  maximumDate={new Date()}
                  minimumDate={new Date(1950, 0, 1)}
                  display='spinner'
                  onChange={handleDateConfirm}
                  title="Select your birthday" />
              </CustomeModal>



            </View>
          ) : (
            <View>
              <TextInput
                style={styles.input}
                value={stepData.value}
                onChangeText={stepData.onChangeText}
                placeholder={stepData.placeholder}
                placeholderTextColor="#CCCCCC"
                keyboardType={stepData.keyboardType || 'default'}
                maxLength={stepData.maxLength || 50}
              />
              {stepData.subtitle}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            (isNextDisabled || uploading) && styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={isNextDisabled || uploading}>
          {uploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.nextButtonText}>Next</Text>
          )}
        </TouchableOpacity>
      </View>

      <CameraGalleryPicker
        refs={cameraGalleryRef}
        getImageValue={handleImageSelected}
        cancel={handleCancel}
        backgroundColor="#FFFFFF"
        headerColor="#000000"
        titleColor="#000000"
        cancelButtonColor="#FF3B6D"
        width={1024}
        height={1024}
        quality={0.8}
        base64={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FF3B6D',
    height: 150,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  progressBar: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginTop: 50,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    position: 'absolute',
    top: 53,
    left: 15,
    width: 50,
    zIndex: 10,
  },
  backIcon: {
    fontSize: 35,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  profileIconContainer: {
    alignItems: 'center',
    marginTop: 30,
  },
  profileImage: {
    width: 50,
    height: 50,
  },
  content: {
    paddingHorizontal: 25,
    paddingTop: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    fontSize: 18,
    color: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  datePickerButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePickerText: {
    fontSize: 18,
    color: '#000000',
  },
  datePickerPlaceholder: {
    color: '#CCCCCC',
  },
  calendarIcon: {
    fontSize: 20,
    color: '#666666',
  },
  subtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    textAlign: 'center',
  },
  firstNameSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    textAlign: 'left',
  },
  boldText: {
    fontSize: 13,
    color: '#000000',
    fontWeight: 'bold',
  },
  iAmText: {
    fontSize: 16,
    color: '#000000',
    marginTop: 20,
    marginBottom: 15,
  },
  genderOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    // Ensure all borders are visible
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
  },
  genderText: {
    fontSize: 16,
    color: '#000000',
  },
  radioButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#FF3B6D',
    backgroundColor: '#FFFFFF',
  },
  radioButtonInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FF3B6D',
  },
  learnMoreButton: {
    marginTop: 20,
  },
  learnMoreText: {
    fontSize: 14,
    color: '#4A90E2',
    textDecorationLine: 'underline',
  },
  interestedSubtitle: {
    fontSize: 13,
    color: '#9CA3AF',
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 25,
  },
  lookingForCard: {
    borderWidth: 2.5,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingVertical: 25,
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    // Ensure all borders are visible
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopColor: '#CCCCCC',
    borderRightColor: '#CCCCCC',
    borderBottomColor: '#CCCCCC',
    borderLeftColor: '#CCCCCC',
  },
  lookingForCardSelected: {
    borderWidth: 2.5,
    borderColor: '#FF3B6D',
    backgroundColor: '#FFFFFF',
    // Ensure all borders are visible
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderTopColor: '#FF3B6D',
    borderRightColor: '#FF3B6D',
    borderBottomColor: '#FF3B6D',
    borderLeftColor: '#FF3B6D',
  },
  cardImage: {
    width: 32,
    height: 32,
    marginBottom: 10,
  },
  ageRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  ageRangeButton: {
    borderWidth: 2.5,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 8,
    width: '23%',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  ageRangeButtonSelected: {
    borderColor: '#FF3B6D',
    backgroundColor: '#FFFFFF',
  },
  ageRangeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  ageRangeTextSelected: {
    color: '#FF3B6D',
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  interestCard: {
    borderWidth: 2.5,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 10,
    width: '31%',
    marginBottom: 15,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  interestCardSelected: {
    borderColor: '#FF3B6D',
    backgroundColor: '#FFFFFF',
  },
  interestEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  interestImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
  },
  interestText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  interestTextSelected: {
    color: '#FF3B6D',
  },
  bioTextArea: {
    borderWidth: 2.5,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 15,
    height: 250,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  photoSlot: {
    width: '48%',
    height: 170,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    marginBottom: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  photoSlotSelected: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FF3B6D',
  },
  cameraIcon: {
    fontSize: 40,
    color: '#CCCCCC',
  },
  cameraImage: {
    width: 40,
    height: 40,
    tintColor: '#CCCCCC',
  },
  photoImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  cardEmoji: {
    fontSize: 32,
    marginBottom: 10,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#FF3B6D',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#FFB3C6',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  uploadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#666666',
  },
});

export default FirstName;