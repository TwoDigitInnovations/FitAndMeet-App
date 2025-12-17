import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Constants, { FONTS } from '../utils/Constant';
import Home from '../screens/app/Home'
import Reports from '../screens/app/Report'
import Settings from '../screens/app/Settings'
import { HomeIcon, SettingIcon, ReportIcon } from '../Assets/theme'





const Tab = createBottomTabNavigator();

export const TabNav = () => {
  const tabOffsetValue = useRef(new Animated.Value(0)).current;
  function getWidth() {
    let width = Dimensions.get("window").width
    // Total five Tabs...
    return width / 3
  }

  const TabArr = [
    {
      iconActive: <HomeIcon color={Constants.black} height={24} width={24} />,
      iconInActive: <HomeIcon color={Constants.white} height={22} width={22} />,
      component: Home,
      routeName: 'Home',
    },
    {
      iconActive: <ReportIcon color={Constants.black} height={24} width={24} />,
      iconInActive: <ReportIcon color={Constants.white} height={22} width={22} />,
      component: Reports,
      routeName: 'Reports',
    },
    {
      iconActive: <SettingIcon color={Constants.black} height={24} width={24} />,
      iconInActive: <SettingIcon color={Constants.white} height={22} width={22} />,
      component: Settings,
      routeName: 'Settings',
    },
    // {
    //   iconActive: <StatisticsIcon color={Constants.white} height={20} width={20} />,
    //   iconInActive: <StatisticsIcon color={Constants.custom_blue} height={20} width={20} />,
    //   component: Account,
    //   routeName: 'Account',
    // },
  ];

  const TabButton = useCallback(
    (props) => {
      const isSelected = props?.['aria-selected'];
      const onPress = props?.onPress;
      const onclick = props?.onclick;
      const item = props?.item;
      const index = props?.index;
      useEffect(() => {

        {
          isSelected &&
            Animated.spring(tabOffsetValue, {
              toValue: getWidth() * index,
              useNativeDriver: true
            }).start();
        }

      }, [isSelected])

      const scaleAnim = useRef(new Animated.Value(1)).current;
      useEffect(() => {
        Animated.spring(scaleAnim, {
          toValue: isSelected ? 1.3 : 1, // scale up when selected, back when unselected
          useNativeDriver: true,
        }).start();
      }, [isSelected]);

      return (
        <View style={styles.tabBtnView}>
          {index === 0 && <Animated.View style={{
            // width: getWidth() -15,
            height: 40,
            width: 40,
            backgroundColor: Constants.white,
            position: 'absolute',
            top: -12,
            borderRadius: 30,
            transform: [
              { translateX: tabOffsetValue }
            ]
          }}>
          </Animated.View>}

          <TouchableOpacity
            onPress={onclick ? onclick : onPress}
            style={[
              styles.tabBtn,
              // {backgroundColor:isSelected?Constants.custom_green:null}
            ]}>
            <Animated.View style={{
              transform: [{ scale: scaleAnim }],
              // height: 48,
              // width: 48,
              // marginTop: 15
            }}>
              {isSelected ? item.iconActive : item.iconInActive}
            </Animated.View>

          </TouchableOpacity>
          <Text style={{ color: Constants.white, }}>{item.routeName}</Text>
          {/* <Text style={[styles.tabtxt,{color:isSelected?Constants.custom_green:Constants.tabgrey}]} onPress={onclick ? onclick : onPress}>{item.name}</Text> */}
        </View>
      );
    },
    [],
  );

  return (

    <Tab.Navigator
      screenOptions={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          width: '100%',
          height: 80,
          backgroundColor: Constants.black,
          // boxShadow: '0px 0px 3px 0.2px grey',
          borderTopLeftRadius: 15,
          borderTopRightRadius: 15,
          borderWidth: 1,
          borderBottomWidth: 0,
          borderColor: Constants.custom_blue
        },
      }}>
      {TabArr.map((item, index) => {
        return (
          <Tab.Screen
            key={index}
            name={item.routeName}
            component={item.component}

            options={{
              tabBarShowLabel: false,
              tabBarButton: props => (
                <TabButton {...props} item={item} index={index} />
              ),
            }}
          />
        );
      })}
    </Tab.Navigator>

  );

}

const styles = StyleSheet.create({
  tabBtnView: {
    // backgroundColor: isSelected ? 'blue' : '#FFFF',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20
  },
  tabBtn: {
    height: 40,
    width: 40,
    // padding:10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 25,
  },
  tabBtnActive: {
    backgroundColor: Constants.white,
  },
  tabBtnInActive: {
    backgroundColor: 'white',
  },
  tabtxt: {
    color: Constants.white,
    fontSize: 12,
    fontWeight: '400',
    // alignSelf:'center'
  },
});
