import React, {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import ConfettiCannon from 'react-native-confetti-cannon';
import {useTranslation} from 'react-i18next';

const {width, height} = Dimensions.get('window');

const MatchScreen = ({navigation, route}) => {
  const {t} = useTranslation();
  const {currentUser, matchedUser} = route.params || {};
  const [showCelebration, setShowCelebration] = useState(true);
  const confettiRef = useRef(null);

  console.log('MatchScreen rendered with params:', {
    currentUser: currentUser?.name,
    matchedUser: matchedUser?.name,
    currentUserImage: currentUser?.profileImage,
    matchedUserImage: matchedUser?.profileImage
  });

 
  useEffect(() => {
    const celebrationCycle = () => {
      setShowCelebration(true);
      
    
      if (confettiRef.current) {
        confettiRef.current.start();
      }
      
     
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      }, 1000);
      
      setTimeout(() => {
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      }, 2000);
      
  
      setTimeout(() => {
        setShowCelebration(false);
        
      
        setTimeout(() => {
          celebrationCycle();
        }, 3000);
      }, 5000);
    };

    celebrationCycle();
    
  
    return () => {
      setShowCelebration(false);
    };
  }, []);

  console.log('MatchScreen rendered with params:', {
    currentUser: currentUser?.name,
    matchedUser: matchedUser?.name,
    currentUserImage: currentUser?.profileImage,
    matchedUserImage: matchedUser?.profileImage
  });

  const handleStartChatting = () => {
 
    navigation.navigate('ChatRoom', {
      userId: matchedUser?.id,
      userName: matchedUser?.name,
      userImage: matchedUser?.profileImage,
      conversationId: null 
    });
  };

  const handleSkip = () => {

    navigation.navigate('TabNav', { screen: 'Home' });
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <LinearGradient
      colors={['#571D38', '#31132A', '#0A0B1B', '#000000']}
      locations={[0, 0.4, 0.9, 1]}
      style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#571D38" />
      
   
      <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
        <Image 
          source={require('../../Assets/images/backicon.png')} 
          style={styles.backIcon}
        />
      </TouchableOpacity>


      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.congratulationsText}>{t('matchscreen.congratulations')}</Text>
        <Text style={styles.matchText}>{t('matchscreen.its_a_match')}</Text>

        {showCelebration && (
          <>
          
            <ConfettiCannon
              ref={confettiRef}
              count={200}
              origin={{x: width/2, y: height * 0.3}}
              explosionSpeed={350}
              fallSpeed={2500}
              fadeOut={true}
              colors={['#FF6B9D', '#F23576', '#FFD93D', '#6BCF7F', '#4D96FF', '#9B59B6', '#E74C3C', '#F39C12', '#1ABC9C', '#F1C40F']}
            />
            
        
            <ConfettiCannon
              count={150}
              origin={{x: width * 0.2, y: height * 0.25}}
              explosionSpeed={300}
              fallSpeed={2000}
              fadeOut={true}
              colors={['#FF1744', '#FF9100', '#FFEA00', '#00E676', '#00B0FF', '#D500F9']}
            />
            
      
            <ConfettiCannon
              count={150}
              origin={{x: width * 0.8, y: height * 0.35}}
              explosionSpeed={300}
              fallSpeed={2000}
              fadeOut={true}
              colors={['#FF5722', '#795548', '#607D8B', '#9C27B0', '#673AB7', '#3F51B5']}
            />
            
       
            <ConfettiCannon
              count={100}
              origin={{x: width/2, y: height * 0.15}}
              explosionSpeed={250}
              fallSpeed={1800}
              fadeOut={true}
              colors={['#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#F44336', '#E91E63']}
            />

          
         

           
         
          </>
        )}

     
        <View style={styles.profileContainer}>
         
          <Image 
            source={require('../../Assets/images/cele.png')} 
            style={styles.celebrationImage}
            resizeMode="contain"
          />
          
        
          <View style={[styles.profileImageContainer, styles.leftProfile]}>
            <Image
              source={
                currentUser?.profileImage 
                  ? {uri: currentUser.profileImage}
                  : {uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'}
              }
              style={styles.profileImage}
              onError={(error) => {
                console.log('Current user image load error:', error);
              }}
              onLoad={() => {
                console.log('Current user image loaded successfully');
              }}
            />
          </View>

    
          <View style={styles.heartContainer}>
            <View style={styles.heartBackground}>
              <Image 
                source={require('../../Assets/images/matching.png')} 
                style={styles.matchingImage}
                resizeMode="contain"
              />
            </View>
          </View>

      
          <View style={[styles.profileImageContainer, styles.rightProfile]}>
            <Image
              source={
                matchedUser?.profileImage 
                  ? {uri: matchedUser.profileImage}
                  : {uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80'}
              }
              style={styles.profileImage}
              onError={(error) => {
                console.log('Matched user image load error:', error);
              }}
              onLoad={() => {
                console.log('Matched user image loaded successfully');
              }}
            />
          </View>
        </View>

      
        <View style={styles.confettiContainer}>
         
        </View>
      </View>

    
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startChattingButton} onPress={handleStartChatting}>
          <Text style={styles.startChattingText}>{t('matchscreen.start_chatting_now')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>{t('matchscreen.no_skip')}</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
 
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  congratulationsText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  matchText: {
    fontSize: 28,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 100, 
   
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 80,
    position: 'relative',
  },
  celebrationImage: {
    position: 'absolute',
    width: 350,
    height: 350,
    top: height * -0.085, 
    zIndex: 0,
   
  },
  profileImageContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 11,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    position: 'absolute',
  },
  leftProfile: {
    left: width * -0.25, 
    top: height * -0.07,
    zIndex: 1,
  },
  rightProfile: {
    right: width * -0.25, 
    top: height * 0.01, 
    zIndex: 1,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heartContainer: {
    zIndex: 10, 
    position: 'relative',
  },
  heartBackground: {
    width: 90,
    height: 90,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  matchingImage: {
    width: 65,
    height: 65,
  },
  heartIcon: {
    fontSize: 30,
  },
  confettiContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    paddingHorizontal: 40,
    paddingBottom: 50,
    gap: 15,
  },
  startChattingButton: {
    backgroundColor: '#F23576',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#F23576',
    
  },
  startChattingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  skipButton: {
    backgroundColor: '#F23576',
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#F23576',
   
  },
  skipText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  celebrationTextContainer: {
    position: 'absolute',
    top: height * 0.15,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  celebrationText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textShadowColor: '#FF6B9D',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 5,
  },
  sparkleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 8,
    pointerEvents: 'none',
  },
  sparkleText: {
    position: 'absolute',
    fontSize: 20,
    color: '#FFD700',
  },
});

export default MatchScreen;