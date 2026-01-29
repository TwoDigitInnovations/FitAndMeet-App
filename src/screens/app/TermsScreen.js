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

const TermsScreen = ({navigation}) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [termsService, setTermsService] = useState(false);
  const [connectingUsers, setConnectingUsers] = useState(false);
  const [contentModeration, setContentModeration] = useState(false);
  const [improvingService, setImprovingService] = useState(false);

  const allChecked =
    ageConfirmed &&
    termsAccepted &&
    privacyAccepted &&
    termsService &&
    connectingUsers &&
    contentModeration &&
    improvingService;

  const handleContinue = async () => {
    if (allChecked) {
      try {
        const response = await apiService.Post('api/registration/accept-terms', {
          termsAccepted: true,
        });

        if (response.success) {
          navigation.navigate('UploadDocuments');
        } else {
          Alert.alert('Error', response.message || 'Failed to accept terms');
        }
      } catch (error) {
        console.error('Accept terms error:', error);
        Alert.alert('Error', 'Failed to accept terms. Please try again.');
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

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Before You start....</Text>
        <Text style={styles.subtitle}>
          To ensure a safe and legal environment,{'\n'}Please review and accept
          our terms.
        </Text>

        <View style={styles.divider} />

       
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>[18+]</Text>
          <View style={styles.checkboxRow}>
            <CheckBox
              checked={ageConfirmed}
              onPress={() => setAgeConfirmed(!ageConfirmed)}
            />
            <Text style={styles.checkboxText}>
              I certify that I am <Text style={styles.highlight}>18</Text> years
              of age or older.
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
              I accept{' '}
              <Text style={styles.highlight}>Terms of service.</Text>
            </Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={privacyAccepted}
              onPress={() => setPrivacyAccepted(!privacyAccepted)}
            />
            <Text style={styles.checkboxText}>
              I have read a{' '}
              <Text style={styles.highlight}>* Privacy Policy</Text> and consent
              to the processing to my profile, photos, and messages.
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
              I accept{' '}
              <Text style={styles.highlight}>Terms of service.</Text>
            </Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={connectingUsers}
              onPress={() => setConnectingUsers(!connectingUsers)}
            />
            <Text style={styles.checkboxText}>Connecting with other users</Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={contentModeration}
              onPress={() => setContentModeration(!contentModeration)}
            />
            <Text style={styles.checkboxText}>
              Content moderation & saftey
            </Text>
          </View>

          <View style={[styles.checkboxRow, styles.marginTop]}>
            <CheckBox
              checked={improvingService}
              onPress={() => setImprovingService(!improvingService)}
            />
            <Text style={styles.checkboxText}>
              Improving the service experience
            </Text>
          </View>
        </View>
      </ScrollView>

   
      <TouchableOpacity
        style={[styles.continueButton, !allChecked && styles.buttonDisabled]}
        onPress={handleContinue}
        disabled={!allChecked}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
