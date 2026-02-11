import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import apiService from '../../services/apiService';
import {useTranslation} from 'react-i18next';

const TermsScreen = ({navigation}) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsService, setTermsService] = useState(false);
  const [connectingUsers, setConnectingUsers] = useState(false);
  const [contentModeration, setContentModeration] = useState(false);
  const [improvingService, setImprovingService] = useState(false);
  const {t} = useTranslation();

  const allChecked =
    ageConfirmed &&
    termsAccepted &&
    privacyAccepted &&
    termsService &&
    connectingUsers &&
    contentModeration &&
    improvingService;

  const handleClose = () => {
    // Navigate back to SelectGym (previous step in registration)
    navigation.navigate('SelectGym');
  };

  const handleContinue = async () => {
    if (allChecked) {
      try {
        const response = await apiService.Post('api/registration/accept-terms', {
          termsAccepted: true,
        });

        if (response.success) {
          navigation.navigate('UploadDocuments');
        } else {
          Alert.alert(t('auth.otp.error'), response.message || t('termsscreen.accept_error'));
        }
      } catch (error) {
        console.error('Accept terms error:', error);
        Alert.alert(t('auth.otp.error'), t('termsscreen.accept_error'));
      }
    }
  };

  const CheckBox = ({checked, onPress}) => (
    <TouchableOpacity style={styles.checkbox} onPress={onPress}>
      {checked && (
        <Text style={styles.checkMark}>✓</Text>
      )}
    </TouchableOpacity>
  );

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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('termsscreen.title')}</Text>
        <Text style={styles.subtitle}>
          {t('termsscreen.subtitle')}
        </Text>

        <View style={styles.divider} />

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('termsscreen.age_section')}</Text>
          <View style={styles.checkboxRow}>
            <CheckBox
              checked={ageConfirmed}
              onPress={() => setAgeConfirmed(!ageConfirmed)}
            />
            <Text style={styles.checkboxText}>
              {t('termsscreen.age_confirmation')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

       
        <View style={styles.section}>
          <View style={styles.checkboxRow}>
            <CheckBox
              checked={termsAccepted}
              onPress={() => setTermsAccepted(!termsAccepted)}
            />
            <Text style={styles.checkboxText}>
              {t('termsscreen.terms_service')}
            </Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={privacyAccepted}
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
            />
            <Text style={styles.checkboxText}>
              {t('termsscreen.privacy_policy')}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.checkboxRow}>
            <CheckBox
              checked={termsService}
              onPress={() => setTermsService(!termsService)}
            />
            <Text style={styles.checkboxText}>
              {t('termsscreen.terms_service')}
            </Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={connectingUsers}
              onPress={() => setConnectingUsers(!connectingUsers)}
            />
            <Text style={styles.checkboxText}>{t('termsscreen.connecting_users')}</Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={contentModeration}
              onPress={() => setContentModeration(!contentModeration)}
            />
            <Text style={styles.checkboxText}>
              {t('termsscreen.content_moderation')}
            </Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={improvingService}
              onPress={() => setImprovingService(!improvingService)}
            />
            <Text style={styles.checkboxText}>
              {t('termsscreen.improving_service')}
            </Text>
          </View>
        </View>
      </ScrollView>

   
      <TouchableOpacity
        style={[styles.continueButton, !allChecked && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!allChecked}>
        <Text style={styles.continueButtonText}>{t('termsscreen.continue_button')}</Text>
      </TouchableOpacity>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 100,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#D0D0D0',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 5,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginVertical: 15,
  },
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  marginTop: {
    marginTop: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#FF3B6D',
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkMark: {
    fontSize: 14,
    color: '#FF3B6D',
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#D0D0D0',
    lineHeight: 20,
  },
  highlight: {
    color: '#FF3B6D',
    fontWeight: '600',
  },
  continueButton: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    right: 20,
    backgroundColor: '#FF3B6D',
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#8B4A5F',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default TermsScreen;
