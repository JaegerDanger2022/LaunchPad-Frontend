import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { View, ActivityIndicator, Animated } from 'react-native';
import { NavigationContainer, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import HomeScreen from './src/screens/HomeScreen';
import MilestoneScreen from './src/screens/MilestoneScreen';
import DreamPage from './src/screens/DreamPage';
import AllDreamsScreen from './src/screens/AllDreamsScreen';
import EvidenceBoardScreen from './src/screens/EvidenceBoardScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import { useAuthStore } from './src/store/authStore';
import { Color } from './src/constants/GlobalStyles';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;

  // App tab screens
  HomeTabs: undefined;

  // Modal screens (shown on top of tabs)
  Milestone: { milestoneId: string };
  Dream: undefined;
};

export type TabParamList = {
  Home: undefined;
  AllDreams: undefined;
  EvidenceBoard: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// HOC to add fade-in animation to tab screens
const withFadeAnimation = (Component: any) => {
  return (props: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useFocusEffect(() => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return (
      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <Component {...props} />
      </Animated.View>
    );
  };
};

// Wrapper components that accept navigation as a prop
const HomeScreenBase = ({ navigation }: any) => (
  <HomeScreen onNavigate={(screen) => {
    if (screen === 'AllDreams' || screen === 'EvidenceBoard') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const HomeScreenWrapper = withFadeAnimation(HomeScreenBase);

const MilestoneScreenWrapper = ({ navigation, route }: any) => (
  <MilestoneScreen
    onNavigate={(screen) => {
      if (screen === 'Home') {
        navigation.goBack();
      } else {
        navigation.navigate(screen as keyof RootStackParamList);
      }
    }}
    milestoneId={route.params?.milestoneId}
  />
);

const AllDreamsScreenBase = ({ navigation }: any) => (
  <AllDreamsScreen onNavigate={(screen) => {
    if (screen === 'Home' || screen === 'EvidenceBoard') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const AllDreamsScreenWrapper = withFadeAnimation(AllDreamsScreenBase);

const DreamPageWrapper = ({ navigation }: any) => (
  <DreamPage onNavigate={(screen, params) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard') {
      navigation.goBack();
      // Navigate to the tab after closing the modal
      setTimeout(() => {
        navigation.navigate('HomeTabs', {
          screen: screen as keyof TabParamList,
        });
      }, 100);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }} />
);

const EvidenceBoardScreenBase = ({ navigation }: any) => (
  <EvidenceBoardScreen onNavigate={(screen) => {
    if (screen === 'Home' || screen === 'AllDreams') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const EvidenceBoardScreenWrapper = withFadeAnimation(EvidenceBoardScreenBase);

// Auth Navigator
function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Hide default tab bar - using custom BottomNavbar
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AllDreams"
        component={AllDreamsScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="EvidenceBoard"
        component={EvidenceBoardScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
}

// App Navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Group screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="HomeTabs"
          component={TabNavigator}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Group>

      {/* Modal screens */}
      <Stack.Group
        screenOptions={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'slide_from_bottom',
        }}>
        <Stack.Screen
          name="Milestone"
          component={MilestoneScreenWrapper}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Dream"
          component={DreamPageWrapper}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, loading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Color.colorSnow }}>
        <ActivityIndicator size="large" color={Color.colorOrangered} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
