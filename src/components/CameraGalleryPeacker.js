import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Modal,
  StyleSheet,
} from 'react-native';
import React from 'react';
import { check, PERMISSIONS, RESULTS, request } from 'react-native-permissions';
import Constants from '../utils/Constant';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useTranslation } from 'react-i18next';

const CameraGalleryPicker = (props) => {
  const [visible, setVisible] = React.useState(false);
  const { t } = useTranslation();

  React.useImperativeHandle(props.refs, () => ({
    show: () => setVisible(true),
    hide: () => setVisible(false),
  }));

  const options2 = {
    mediaType: 'photo',
    maxWidth: props?.width || 300,
    maxHeight: props?.height || 300,
    quality: props?.quality || 1,
    includeBase64: props.base64 || false,
  };

  const launchCameras = async () => {
    launchCamera(options2, (response) => {
      console.log(response)
      if (response.didCancel) {
        props?.cancel()
        console.log('User cancelled image picker');
      } else if (response.error) {
        props?.cancel()
        console.log('ImagePicker Error:', response.error);
      } else if (response.customButton) {
        props?.cancel()
        console.log('User tapped custom button: ', response.customButton);
      } else {
        props.getImageValue(response);
        props?.cancel()
      }
    });
  };

  const launchImageLibrarys = async () => {
    launchImageLibrary(options2, (response) => {
      console.log(response)
      if (response.didCancel) {
        props?.cancel()
        console.log('User cancelled image picker');
      } else if (response.error) {
        props?.cancel()
        console.log('ImagePicker Error:', response.error);
      } else if (response.customButton) {
        props?.cancel()
        console.log('User tapped custom button: ', response.customButton);
      } else {
        props.getImageValue(response);
        props?.cancel()
      }
    });
  };

  const requestMediaPermission = async (type) => {
    try {
      const permission = Platform.OS === 'ios'
        ? PERMISSIONS.IOS.PHOTO_LIBRARY
        : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;

      const result = await check(permission);
      console.log(result)
      if (result === RESULTS.GRANTED) {
        setTimeout(() => {
          type();
        }, 500);
        console.log('Permission already granted');
        return;
      }

      if (result === RESULTS.DENIED || result === RESULTS.UNAVAILABLE) {
        const permissionResult = await request(permission);

        if (permissionResult === RESULTS.GRANTED) {
          console.log('Permission granted');
          setTimeout(() => {
            type();
          }, 500);
        } else {
          console.log('Permission denied');
          setTimeout(() => {
            type();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error checking or requesting permission:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={() => {
        setVisible(false);
        props?.cancel();
      }}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => {
          setVisible(false);
          props?.cancel();
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.modalContent, { backgroundColor: props.backgroundColor || '#FFFFFF' }]}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 30 }}>
            <View style={{ marginLeft: 10 }}>
              <Text
                style={{
                  color: props?.headerColor || Constants.black,
                  fontSize: 20,
                  fontWeight: '700',
                  marginBottom: 20,
                }}>
                {t('camera.choose_photo')}
              </Text>
            </View>

            <TouchableOpacity
              style={{ flexDirection: 'row', width: '100%', paddingVertical: 12 }}
              onPress={() => {
                setVisible(false);
                requestMediaPermission(launchCameras);
              }}>
              <View style={{ marginLeft: 10 }}>
                <Text
                  style={{
                    color: props?.titleColor || Constants.black,
                    fontSize: 18,
                    fontWeight: '500',
                    opacity: 0.7,
                  }}>
                  {t('camera.take_picture')}
                </Text>
              </View>
            </TouchableOpacity>

            {props.hidegallaryoption ? null : (
              <TouchableOpacity
                style={{ flexDirection: 'row', marginTop: 10, paddingVertical: 12 }}
                onPress={() => {
                  setVisible(false);
                  requestMediaPermission(launchImageLibrarys);

                }}>
                <View style={{ marginLeft: 10 }}>
                  <Text
                    style={{
                      color: props?.titleColor || Constants.black,
                      fontSize: 18,
                      fontWeight: '500',
                      opacity: 0.7,
                    }}>
                    {t('camera.choose_gallery')}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={{
                flexDirection: 'row',
                marginTop: 20,
                alignItems: 'flex-end',
                paddingVertical: 12,
              }}
              onPress={() => {
                setVisible(false);
                props?.cancel();
              }}>
              <View style={{ marginLeft: 10, width: '100%' }}>
                <Text
                  style={{
                    color: props?.cancelButtonColor || Constants.black,
                    fontSize: 18,
                    fontWeight: '500',
                    textAlign: 'right',
                    marginRight: 20,
                  }}>
                  {t('firstname.cancel').toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default CameraGalleryPicker;
