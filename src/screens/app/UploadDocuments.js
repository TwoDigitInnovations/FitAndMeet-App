import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import CameraGalleryPicker from '../../components/CameraGalleryPeacker';

const UploadDocuments = ({navigation}) => {
  const [idDocument, setIdDocument] = useState(null);
  const [gymDocument, setGymDocument] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentUploadType, setCurrentUploadType] = useState(null);
  
  const cameraGalleryRef = useRef(null);

  const handleClose = () => {
    navigation.goBack();
  };

  const handleUploadID = () => {
    setCurrentUploadType('id');
    cameraGalleryRef.current?.show();
  };

  const handleUploadMembership = () => {
    setCurrentUploadType('gym');
    cameraGalleryRef.current?.show();
  };

  const handleImageSelected = async (response) => {
    console.log('Image selected:', response);
    
    if (!response || !response.assets || !response.assets[0]) {
      console.log('No image selected');
      return;
    }

    const image = response.assets[0];
    setUploading(true);

    try {
      const uploadResponse = await apiService.UploadFile(
        image.uri,
        image.fileName || `${currentUploadType}_document.jpg`,
        image.type || 'image/jpeg',
      );

      if (uploadResponse.file) {
        const documentData = {
          uri: image.uri,
          url: uploadResponse.file.url,
          publicId: uploadResponse.file.publicId,
        };

        if (currentUploadType === 'id') {
          setIdDocument(documentData);
          Alert.alert('Success', 'ID document uploaded successfully');
        } else {
          setGymDocument(documentData);
          Alert.alert('Success', 'Gym membership document uploaded successfully');
        }
      } else {
        Alert.alert('Error', uploadResponse.error || 'Failed to upload document');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
      setCurrentUploadType(null);
    }
  };

  const handleCancel = () => {
    cameraGalleryRef.current?.hide();
    setCurrentUploadType(null);
  };

  const handleNext = async () => {
    if (!idDocument || !gymDocument) {
      Alert.alert('Missing Documents', 'Please upload both ID and gym membership documents');
      return;
    }

    console.log('=== UPLOAD DOCUMENTS DEBUG ===');
    console.log('ID Document:', { url: idDocument.url, publicId: idDocument.publicId });
    console.log('Gym Document:', { url: gymDocument.url, publicId: gymDocument.publicId });

    setUploading(true);
    try {
      const requestData = {
        idDocumentUrl: idDocument.url,
        idDocumentPublicId: idDocument.publicId,
        gymDocumentUrl: gymDocument.url,
        gymDocumentPublicId: gymDocument.publicId,
      };

      console.log('=== SENDING DOCUMENTS TO BACKEND ===');
      console.log('Request Data:', JSON.stringify(requestData, null, 2));

      const response = await apiService.Post('api/registration/upload-documents', requestData);

      console.log('=== BACKEND RESPONSE ===');
      console.log('Response:', JSON.stringify(response, null, 2));

      if (response.success) {
        console.log('=== DOCUMENTS UPLOADED SUCCESSFULLY ===');
        console.log('Next Step:', response.nextStep);
        console.log('User Step:', response.user?.currentStep);
        
        Alert.alert(
          'Documents Uploaded!',
          'Your documents have been uploaded successfully.',
          [
            {
              text: 'Continue',
              onPress: () => {
                const nextScreen = response.nextStep || 'FirstName';
                console.log(`Navigating to ${nextScreen}`);
                navigation.navigate(nextScreen);
              }
            }
          ]
        );
      } else {
        console.log('=== UPLOAD FAILED ===');
        console.log('Error:', response.message);
        Alert.alert('Error', response.message || 'Failed to save documents');
      }
    } catch (error) {
      console.error('=== SAVE DOCUMENTS ERROR ===');
      console.error('Error details:', error);
      Alert.alert('Error', 'Failed to save documents. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <LinearGradient colors={['#61203C', '#140D1F']} style={styles.container}>
      <StatusBar
        backgroundColor="#61203C"
        barStyle="light-content"
        translucent={false}
      />

      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <View style={styles.closeIcon}>
          <Text style={styles.closeText}>✕</Text>
        </View>
      </TouchableOpacity>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>
            Upload Photo of Your Official ID and Gym Membership Contract
          </Text>
          <Text style={styles.subtitle}>
            Take a clear photo of your Offical ID and gym{'\n'}membership contract
          </Text>

          <Text style={styles.label}>ID card / Driver's Licence</Text>
          <TouchableOpacity style={styles.uploadBox} onPress={handleUploadID} disabled={uploading}>
            {idDocument ? (
              <Image
                source={{uri: idDocument.uri}}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../Assets/images/id.png')}
                style={styles.idCard}
                resizeMode="contain"
              />
            )}
            <View style={styles.cameraButton}>
              <Image
                source={require('../../Assets/images/cam.png')}
                style={styles.cameraIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          <Text style={styles.label}>Gym Meembership Contract</Text>
          <TouchableOpacity
            style={styles.uploadBox}
            onPress={handleUploadMembership}
            disabled={uploading}>
            {gymDocument ? (
              <Image
                source={{uri: gymDocument.uri}}
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            ) : (
              <Image
                source={require('../../Assets/images/id.png')}
                style={styles.idCard}
                resizeMode="contain"
              />
            )}
            <View style={styles.cameraButton}>
              <Image
                source={require('../../Assets/images/cam.png')}
                style={styles.cameraIcon}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>

          {uploading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <Text style={styles.loadingText}>Uploading...</Text>
            </View>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.nextButton, (!idDocument || !gymDocument || uploading) && styles.nextButtonDisabled]} 
          onPress={handleNext}
          disabled={!idDocument || !gymDocument || uploading}>
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </ScrollView>

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
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  closeIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: '300',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 120,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: '#D0D0D0',
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    color: '#D0D0D0',
    marginBottom: 15,
    textAlign: 'center',
  },
  uploadBox: {
    width: '65%',
    height: 160,
    alignSelf: 'center',
    marginBottom: 40,
    position: 'relative',
  },
  idCard: {
    width: '100%',
    height: '100%',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -10,
    right: -10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF3B6D',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#61203C',
  },
  cameraIcon: {
    width: 24,
    height: 24,
  },
  nextButton: {
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#FF3B6D',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButtonDisabled: {
    backgroundColor: '#8B4A5F',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
});

export default UploadDocuments;
