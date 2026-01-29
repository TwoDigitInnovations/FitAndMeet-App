import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useTranslation} from 'react-i18next';

const TermsAndConditions = ({navigation}) => {
  const {t} = useTranslation();

  return (
    <LinearGradient
      colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
      locations={[0, 0.4, 0.9, 1]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#571D38" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../Assets/images/backicon.png')} 
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('terms.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>{t('terms.section1_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section1_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section2_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section2_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section3_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section3_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section4_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section4_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section5_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section5_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section6_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section6_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section7_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section7_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section8_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section8_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section9_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section9_content')}
        </Text>

        <Text style={styles.sectionTitle}>{t('terms.section10_title')}</Text>
        <Text style={styles.paragraph}>
          {t('terms.section10_content')}
        </Text>

        <Text style={styles.lastUpdated}>
          {t('terms.last_updated')}
        </Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 28,
    height: 28,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'left',
    marginLeft: 15,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 15,
    opacity: 0.9,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.7,
  },
});

export default TermsAndConditions;
