import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignIn from '../screens/auth/SignIn'
import SignUp from '../screens/auth/SignUp'
import { navigationRef } from '../utils/navigationRef';
import ForgotPassword from "../screens/auth/ForgotPassword"
import { TabNav } from './TabNavigation';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import SelectGym from '../screens/app/SelectGym';
import TermsScreen from '../screens/app/TermsScreen';
import UploadDocuments from '../screens/app/UploadDocuments';
import FirstName from '../screens/app/FirstName';
import RegistrationSuccess from '../screens/app/RegistrationSuccess';
import MatchScreen from '../screens/app/MatchScreen';
import ProfileDetails from '../screens/app/ProfileDetails';
import ChatList from '../screens/app/ChatList';
import ChatRoom from '../screens/app/ChatRoom';
import TermsAndConditions from '../screens/TermsAndConditions';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigate = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Welcome'>
            <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
            <AuthStack.Screen name="SignIn" component={SignIn} />
            <AuthStack.Screen name="SignUp" component={SignUp} />
            <AuthStack.Screen name="SelectGym" component={SelectGym} />
            <AuthStack.Screen name="TermsScreen" component={TermsScreen} />
            <AuthStack.Screen name="UploadDocuments" component={UploadDocuments} />
            <AuthStack.Screen name="FirstName" component={FirstName} />
            <AuthStack.Screen name="RegistrationSuccess" component={RegistrationSuccess} />
            <AuthStack.Screen name="ForgotPassword" component={ForgotPassword} />
            <AuthStack.Screen name="TermsAndConditions" component={TermsAndConditions} />
        </AuthStack.Navigator>
    );
};

const AppNavigate = () => {
    return (
        <AppStack.Navigator screenOptions={{ headerShown: false }} initialRouteName='TabNav'>
            <AppStack.Screen name="TabNav" component={TabNav} />
            <AppStack.Screen name="MatchScreen" component={MatchScreen} />
            <AppStack.Screen name="ProfileDetails" component={ProfileDetails} />
            <AppStack.Screen name="ChatList" component={ChatList} />
            <AppStack.Screen name="ChatRoom" component={ChatRoom} />
        </AppStack.Navigator>
    );
};

export default function Navigation({ isAuthenticated = false }) {
    console.log("🚀 Navigation component received isAuthenticated:", isAuthenticated);

    if (isAuthenticated) {
        console.log("✅ User is authenticated - showing App navigation (Home screen)");
        // User is authenticated - go directly to App (Home screen)
        return (
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName="App"
                >
                    <Stack.Screen name="App" component={AppNavigate} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    } else {
        console.log("❌ User is not authenticated - showing Auth navigation (Welcome/Login flow)");
        // User is not authenticated - show normal flow
        return (
            <NavigationContainer ref={navigationRef}>
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName="Splash"
                >
                    <Stack.Screen name="Splash" component={SplashScreen} />
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Auth" component={AuthNavigate} />
                    <Stack.Screen name="App" component={AppNavigate} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    }
}