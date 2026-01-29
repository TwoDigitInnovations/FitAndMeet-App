import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width } = Dimensions.get('window');

const RegistrationProgressModal = ({ 
  visible, 
  onClose, 
  onContinue, 
  currentStep = 0, 
  stepDescription = '',
  progressPercent = 0 
}) => {
  const getStepTitle = (step) => {
    switch (step) {
      case 0: return 'Gym Selection';
      case 1: return 'Terms & Conditions';
      case 2: return 'Document Upload';
      case 3:
      case 4: return 'Basic Information';
      case 5:
      case 6: return 'Preferences';
      case 7:
      case 8: return 'Interests & Bio';
      case 9:
      case 10: return 'Photos';
      default: return 'Profile Setup';
    }
  };

  const steps = [
    { id: 0, title: 'Gym Selection', completed: currentStep > 0 },
    { id: 1, title: 'Terms', completed: currentStep > 1 },
    { id: 2, title: 'Documents', completed: currentStep > 2 },
    { id: 3, title: 'Basic Info', completed: currentStep > 3 },
    { id: 4, title: 'Preferences', completed: currentStep > 5 },
    { id: 5, title: 'Interests', completed: currentStep > 7 },
    { id: 6, title: 'Photos', completed: currentStep > 9 },
  ];

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <LinearGradient 
            colors={['#FF3B6D', '#FF6B9D']} 
            style={styles.header}>
            <Text style={styles.headerTitle}>Complete Your Profile</Text>
            <Text style={styles.headerSubtitle}>
              {progressPercent}% Complete
            </Text>
          </LinearGradient>

          <View style={styles.content}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill, 
                    { width: `${progressPercent}%` }
                  ]} 
                />
              </View>
              <Text style={styles.progressText}>{progressPercent}%</Text>
            </View>

            <Text style={styles.currentStepTitle}>
              Next Step: {getStepTitle(currentStep)}
            </Text>
            
            <Text style={styles.stepDescription}>
              {stepDescription}
            </Text>

            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>Registration Steps:</Text>
              {steps.map((step, index) => (
                <View key={step.id} style={styles.stepItem}>
                  <View style={[
                    styles.stepIndicator,
                    step.completed && styles.stepCompleted,
                    currentStep === step.id && styles.stepCurrent
                  ]}>
                    {step.completed ? (
                      <Text style={styles.checkMark}>✓</Text>
                    ) : (
                      <Text style={styles.stepNumber}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={[
                    styles.stepTitle,
                    step.completed && styles.stepTitleCompleted,
                    currentStep === step.id && styles.stepTitleCurrent
                  ]}>
                    {step.title}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.laterButton} 
              onPress={onClose}>
              <Text style={styles.laterButtonText}>Complete Later</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.continueButton} 
              onPress={onContinue}>
              <LinearGradient 
                colors={['#FF3B6D', '#FF6B9D']} 
                style={styles.continueButtonGradient}>
                <Text style={styles.continueButtonText}>Continue Now</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.9,
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    padding: 20,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF3B6D',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF3B6D',
    minWidth: 40,
  },
  currentStepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  stepsContainer: {
    marginBottom: 10,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 15,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepCompleted: {
    backgroundColor: '#4CAF50',
  },
  stepCurrent: {
    backgroundColor: '#FF3B6D',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepNumber: {
    color: '#666666',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepTitle: {
    fontSize: 14,
    color: '#666666',
  },
  stepTitleCompleted: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  stepTitleCurrent: {
    color: '#FF3B6D',
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
  },
  laterButton: {
    flex: 1,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    marginRight: 10,
  },
  laterButtonText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  continueButton: {
    flex: 1,
    marginLeft: 10,
  },
  continueButtonGradient: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  continueButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default RegistrationProgressModal;