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
import { StreakStatsScreen } from './src/screens/StreakStatsScreen';
import { CommunityScreen } from './src/screens/CommunityScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import ShareVictoryScreen from './src/screens/ShareVictoryScreen';
import ShareJourneyRecapScreen from './src/screens/ShareJourneyRecapScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import { ChangePasswordScreen } from './src/screens/auth/ChangePasswordScreen';
import { useAuthStore } from './src/store/authStore';
import { useThemeStore } from './src/store/themeStore';
import { Color } from './src/constants/GlobalStyles';
import Toast from 'react-native-toast-message';
import { configureRevenueCat } from './src/config/revenuecat';

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
  StreakStats: undefined;
  ShareVictory: { victory: any };
  ShareJourneyRecap: { journeyRecap: any };
  ChangePassword: undefined;
};

export type TabParamList = {
  Home: undefined;
  AllDreams: undefined;
  EvidenceBoard: undefined;
  Community: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// HOC to add fade-in animation to tab screens
const withFadeAnimation = (Component: any) => {
  return (props: any) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const { theme } = useThemeStore();

    useFocusEffect(() => {
      fadeAnim.setValue(0.95);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });

    return (
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          backgroundColor: theme === 'dark' ? '#121212' : '#FAFBFC'
        }}>
        <Component {...props} />
      </Animated.View>
    );
  };
};

// Wrapper components that accept navigation as a prop
const HomeScreenBase = ({ navigation }: any) => (
  <HomeScreen onNavigate={(screen, params) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Settings') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }} />
);

const HomeScreenWrapper = withFadeAnimation(HomeScreenBase);

const MilestoneScreenWrapper = ({ navigation, route }: any) => (
  <MilestoneScreen
    onNavigate={(screen, params?) => {
      if (screen === 'Home') {
        navigation.goBack();
      } else {
        navigation.navigate(screen as keyof RootStackParamList, params);
      }
    }}
    milestoneId={route.params?.milestoneId}
  />
);

const AllDreamsScreenBase = ({ navigation }: any) => (
  <AllDreamsScreen onNavigate={(screen) => {
    if (screen === 'Home' || screen === 'EvidenceBoard' || screen === 'AllDreams' || screen === 'Community' || screen === 'Settings') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const AllDreamsScreenWrapper = withFadeAnimation(AllDreamsScreenBase);

const DreamPageWrapper = ({ navigation }: any) => (
  <DreamPage onNavigate={(screen, params) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Settings') {
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
  <EvidenceBoardScreen onNavigate={(screen, params) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Settings') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }} />
);

const EvidenceBoardScreenWrapper = withFadeAnimation(EvidenceBoardScreenBase);

const CommunityScreenBase = ({ navigation }: any) => (
  <CommunityScreen onNavigate={(screen) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Settings') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const CommunityScreenWrapper = withFadeAnimation(CommunityScreenBase);

const SettingsScreenBase = ({ navigation }: any) => (
  <SettingsScreen onNavigate={(screen) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Settings') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const SettingsScreenWrapper = withFadeAnimation(SettingsScreenBase);

const StreakStatsScreenWrapper = ({ navigation }: any) => (
  <StreakStatsScreen onNavigate={(screen) => {
    if (screen === 'Home') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const ShareVictoryScreenWrapper = ({ navigation, route }: any) => (
  <ShareVictoryScreen
    onNavigate={(screen) => {
      if (screen === 'Home') {
        navigation.goBack();
      } else if (screen === 'EvidenceBoard') {
        // Navigate to Evidence Board tab
        navigation.navigate('HomeTabs', {
          screen: 'EvidenceBoard',
        });
      } else {
        navigation.navigate(screen as keyof RootStackParamList);
      }
    }}
    victory={route.params?.victory}
  />
);

const ShareJourneyRecapScreenWrapper = ({ navigation, route }: any) => (
  <ShareJourneyRecapScreen
    onNavigate={(screen) => {
      if (screen === 'Home') {
        navigation.goBack();
      } else if (screen === 'EvidenceBoard') {
        // Navigate to Evidence Board tab
        navigation.navigate('HomeTabs', {
          screen: 'EvidenceBoard',
        });
      } else {
        navigation.navigate(screen as keyof RootStackParamList);
      }
    }}
    journeyRecap={route.params?.journeyRecap}
  />
);

const ChangePasswordScreenWrapper = ({ navigation }: any) => (
  <ChangePasswordScreen
    onNavigate={(screen) => {
      if (screen === 'Settings') {
        navigation.goBack();
        // After closing the modal, navigate to the Settings tab
        setTimeout(() => {
          navigation.navigate('HomeTabs', {
            screen: 'Settings',
          });
        }, 100);
      } else {
        navigation.navigate(screen as keyof RootStackParamList);
      }
    }}
  />
);

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
      <Tab.Screen
        name="Community"
        component={CommunityScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreenWrapper}
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
        <Stack.Screen
          name="StreakStats"
          component={StreakStatsScreenWrapper}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ShareVictory"
          component={ShareVictoryScreenWrapper}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ShareJourneyRecap"
          component={ShareJourneyRecapScreenWrapper}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreenWrapper}
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
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize RevenueCat SDK
    configureRevenueCat().catch((error) => {
      console.error('[App] RevenueCat initialization error:', error);
      // Don't block app on RevenueCat error
    });

    // Initialize auth (will also identify user in RevenueCat if logged in)
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
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} backgroundColor={theme === 'light' ? Color.colorSnow : '#050938'} />
      <Toast />
    </NavigationContainer>
  );
}
