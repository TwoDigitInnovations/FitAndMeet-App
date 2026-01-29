import React, {useEffect, useRef} from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Home from '../screens/app/Home';
import Discover from '../screens/app/Discover';
import Settings from '../screens/app/Settings';
import ChatList from '../screens/app/ChatList';
import {Home as HomeIcon, Heart, MessageCircle, User} from 'lucide-react-native';

const Tab = createBottomTabNavigator();
const {width, height} = Dimensions.get('window');

const CustomTabBar = ({state, descriptors, navigation}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const tabs = [
    {icon: HomeIcon, label: 'Home'},
    {icon: Heart, label: 'Like'},
    {icon: MessageCircle, label: 'Chat'},
    {icon: User, label: 'Profile'},
  ];

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: state.index,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
  }, [state.index]);

  const tabWidth = width / 4;

  return (
<ImageBackground
  key={state.index}
  source={
    state.index === 1 ? require('../Assets/images/like.png') :
    state.index === 2 ? require('../Assets/images/chat.png') :
    state.index === 3 ? require('../Assets/images/profile.png') :
    require('../Assets/images/home1.png')
  }
  style={[
    styles.tabBar, 
    {
      bottom: height * 0.015, 
      marginLeft: state.index === 0 || state.index === 1 ? width * 0.01 : 
                  state.index === 2 ? width * 0.015 :  
                  state.index === 3 ? width * 0.015 : 0,  
    }
  ]}
  resizeMode={state.index === 1 ? "contain" : "contain"} 
  imageStyle={{height: '100%'}}>
      
      <Animated.View
        style={[
          styles.slider,
          {
            transform: [
              {
                translateX: animatedValue.interpolate({
                  inputRange: [0, 1, 2, 3],
                  outputRange: [
                    15 + width * 0.01,  
                    tabWidth + 15 - 20, 
                    tabWidth * 2 + 15 - 45, 
                    tabWidth * 3 + 15 - 55
                  ],
                }),
              },
              {
                translateY: animatedValue.interpolate({
                  inputRange: [0, 1, 2, 3],
                  outputRange: [
                    -height * 0.008,  
                    0,  
                    0,  
                    0   
                  ],
                }),
              },
            ],
          },
        ]}
      />

    
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const Icon = tabs[index].icon;
        const label = tabs[index].label;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}>
  <View style={[
  styles.tabInner,
  index === 0 && (isFocused ? styles.tabInnerHomeActive : (!isFocused && (state.index !== 0) && (state.index === 3 ? styles.tabInnerHomeWhenProfileActive : styles.tabInnerHomeInactive))),
  index === 1 && (isFocused ? styles.tabInnerHeartActive : (state.index === 2 ? styles.tabInnerHeartWhenChatActive : (state.index === 3 ? styles.tabInnerHeartWhenProfileActive : styles.tabInnerHeart))),
  index === 2 && (isFocused ? styles.tabInnerChatActive : (state.index === 1 ? styles.tabInnerChatWhenLikeActive : (state.index === 3 ? styles.tabInnerChatWhenProfileActive : styles.tabInnerChatInactive))),

 
  
 
  index === 3 && (isFocused ? styles.tabInnerProfileActive : (state.index === 1 ? styles.tabInnerProfileWhenLikeActive : (state.index === 2 ? styles.tabInnerProfileWhenChatActive : styles.tabInnerProfileInactive)))
]}>
              {!isFocused && (
                <View style={styles.inactiveIconContainer}>
                  <Icon
                    size={26}
                    color="#374151"
                    strokeWidth={2.5}
                  />
                </View>
              )}
              {isFocused && (
                <>
                  <Icon
                    size={26}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />
                  {label && (
                    <Text style={styles.label} numberOfLines={1}>{label}</Text>
                  )}
                </>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </ImageBackground>
  );
};

export const TabNav = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{headerShown: false}}>
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Likes" component={Discover} />
      <Tab.Screen name="Messages" component={ChatList} />
      <Tab.Screen name="Profile" component={Settings} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    height: 80,
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: width * 0.014, 
     overflow: 'hidden',
  },
  slider: {
    position: 'absolute',
    width: width / 4 + 15,
    height: 50,
    backgroundColor: '#F23576',
    borderRadius: 30,
    alignSelf: 'center',
    top: '20%', 
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 75,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: width * 0.022,  
    marginLeft: width * 0.05,  
  },
  label: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    flexShrink: 0,
  },
  tabInnerHomeActive: {
    marginLeft: width * 0.087,
    marginRight: 0,
     marginTop: -height * 0.012,
   
  },
  tabInnerHeart: {
    marginLeft: width * 0.23,  
    marginRight: width * 0.027,
     marginTop: -height * 0.005, 
  },
 tabInnerHeartActive: {
  marginLeft: width * 0.022,
  marginRight: width * 0.054,
  flexDirection: 'row',     
  flexWrap: 'nowrap',       
  alignItems: 'center',     
},
  tabInnerChat: {
    marginLeft: width * 0.108,  
   
  },
  tabInnerChatActive: {
    marginLeft: 0,
    marginRight: width * 0.10,  
    flexDirection: 'row',   
    flexWrap: 'nowrap',      
    alignItems: 'center',    
  },
  tabInnerChatInactive: {
    marginLeft: width * 0.19, 
    marginRight: width * 0.014,  
    justifyContent: 'center',
     marginTop: -height * 0.005,
  },

  tabInnerChatWhenLikeActive: {
  marginLeft: width * 0.16,  
  marginRight: width * 0.068,
  marginTop: -height * 0.0001,
},
tabInnerProfileWhenChatActive: {
  marginLeft: width * 0.025, 
  marginRight: 0,
  justifyContent: 'center',
},
tabInnerProfileWhenLikeActive: {
  marginLeft: width * 0.035,  
  marginRight: 0,
  justifyContent: 'center',
},
  tabInnerHomeInactive: {
    marginLeft: 0,
    marginRight: width * 0.076, 
  },
  tabInnerHeartWhenChatActive: {
    marginLeft: width * 0.025, 
    marginRight: width * 0.189,  
  },
  tabInnerProfileActive: {
    marginLeft: -width * 0.122,  
    marginRight: width * 0.054,  
    justifyContent: 'flex-start',
     gap: 8,
       flexWrap: 'nowrap', 
  },
  tabInnerProfileInactive: {
    marginLeft: width * 0.009,  
    marginRight: 0,
    justifyContent: 'center',
  },
  tabInnerHomeWhenProfileActive: {
    marginLeft: 0,
    marginRight: width * 0.081, 
  },
  tabInnerHeartWhenProfileActive: {
   marginLeft: width * 0.014,
    marginRight: width * 0.189,  
  },
  tabInnerChatWhenProfileActive: {
  marginLeft: width * 0.029,
    marginRight: width * 0.324,  
  },
  inactiveIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 55,
    width: 55,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
});