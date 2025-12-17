import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from '../screens/auth/SignIn'
import SignUp from '../screens/auth/SignUp'
import { navigationRef } from '../utils/navigationRef';
import ForgotPassword from "../screens/auth/ForgotPassword"
import { TabNav } from './TabNavigation';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();


const AuthNavigate = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName='SignIn'>
            <AuthStack.Screen name="SignIn" component={SignIn} />
            <AuthStack.Screen name="SignUp" component={SignUp} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />

        </AuthStack.Navigator>
    );
};

export default function Navigation(props) {

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Auth" component={AuthNavigate} />
                <Stack.Screen name="App" component={TabNav} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}