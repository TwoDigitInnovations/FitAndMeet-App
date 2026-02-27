import React, { useContext, useEffect, useState } from 'react';
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
import Notifications from '../screens/app/Notifications';
import EditProfile from '../screens/app/EditProfile';
import UserManagement from '../screens/app/UserManagement';
import ArchivedUsers from '../screens/app/ArchivedUsers';
import AdminLogin from '../screens/auth/AdminLogin';
import { UserContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const AppStack = createNativeStackNavigator();

const AuthNavigate = () => {
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName='Welcome'>
            <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
            <AuthStack.Screen name="SignIn" component={SignIn} />
            <AuthStack.Screen name="SignUp" component={SignUp} />
            <AuthStack.Screen name="AdminLogin" component={AdminLogin} />
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
    const [user] = useContext(UserContext);

    const getRequiredRoute = () => {
        if (!user) return 'TabNav';

        if (user.isAdmin) return 'UserManagement';

        if (user.profileCompleted) return 'TabNav';

        if (!user.gymName) return 'SelectGym';
        if (!user.termsAccepted) return 'TermsScreen';
        if (!user.idDocument || !user.gymMembershipDocument) return 'UploadDocuments';
        if (!user.firstName || !user.birthday || !user.gender) return 'FirstName';
        if (!user.interestedIn || !user.lookingFor || !user.ageRange) return 'FirstName';
        if (!user.interests || user.interests.length === 0) return 'FirstName';
        if (!user.bio) return 'FirstName';
        if (!user.photos || user.photos.length === 0) return 'FirstName';

        return 'TabNav';
    };

    const initialRoute = getRequiredRoute();

    return (
        <AppStack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={initialRoute}
        >
            <AppStack.Screen name="SelectGym" component={SelectGym} />
            <AppStack.Screen name="TermsScreen" component={TermsScreen} />
            <AppStack.Screen name="UploadDocuments" component={UploadDocuments} />
            <AppStack.Screen name="FirstName" component={FirstName} />
            <AppStack.Screen name="TabNav" component={TabNav} />
            <AppStack.Screen name="MatchScreen" component={MatchScreen} />
            <AppStack.Screen name="ProfileDetails" component={ProfileDetails} />
            <AppStack.Screen name="ChatList" component={ChatList} />
            <AppStack.Screen name="ChatRoom" component={ChatRoom} />
            <AppStack.Screen name="Notifications" component={Notifications} />
            <AppStack.Screen name="EditProfile" component={EditProfile} />
            <AppStack.Screen name="UserManagement" component={UserManagement} />
            <AppStack.Screen name="ArchivedUsers" component={ArchivedUsers} />
        </AppStack.Navigator>
    );
};

export default function Navigation({ isAuthenticated = false }) {
    const [isFirstLaunch, setIsFirstLaunch] = useState(null);

    useEffect(() => {
        const checkFirstLaunch = async () => {
            try {
                const hasLaunched = await AsyncStorage.getItem('hasLaunched');
                if (hasLaunched === null) {
                    setIsFirstLaunch(true);
                    await AsyncStorage.setItem('hasLaunched', 'true');
                } else {
                    setIsFirstLaunch(false);
                }
            } catch (error) {
                console.error('Error checking first launch:', error);
                setIsFirstLaunch(false);
            }
        };

        checkFirstLaunch();
    }, []);

    // Add a key to force remount when authentication changes
    const navigationKey = isAuthenticated ? 'authenticated' : 'unauthenticated';

    // Show nothing while checking first launch
    if (isFirstLaunch === null) {
        return null;
    }

    if (isAuthenticated) {
        return (
            <NavigationContainer ref={navigationRef} key={navigationKey}>
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName="App"
                >
                    <Stack.Screen name="App" component={AppNavigate} />
                </Stack.Navigator>
            </NavigationContainer>
        );
    } else {
        return (
            <NavigationContainer ref={navigationRef} key={navigationKey}>
                <Stack.Navigator
                    screenOptions={{ headerShown: false }}
                    initialRouteName={isFirstLaunch ? "Onboarding" : "Auth"}
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