import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { View, Animated } from 'react-native';
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
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';
import ShareVictoryScreen from './src/screens/ShareVictoryScreen';
import ShareJourneyRecapScreen from './src/screens/ShareJourneyRecapScreen';
import { PaywallScreen } from './src/screens/PaywallScreen';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import TimezoneScreen from './src/screens/auth/TimezoneScreen';
import NotificationTimeScreen from './src/screens/auth/NotificationTimeScreen';
import PledgeScreen from './src/screens/auth/PledgeScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import { ChangePasswordScreen } from './src/screens/auth/ChangePasswordScreen';
import { useAuthStore } from './src/store/authStore';
import { useThemeStore } from './src/store/themeStore';
import { useNotificationStore } from './src/store/notificationStore';
import { Color } from './src/constants/GlobalStyles';
import Toast from 'react-native-toast-message';
import { toastConfig } from './src/components/CustomToast';
import { configureRevenueCat } from './src/config/revenuecat';

export type RootStackParamList = {
  // Auth screens
  Login: undefined;
  Signup: undefined;
  Timezone: { email: string; password: string; name: string };
  NotificationTime: { email: string; password: string; name: string; timezone: string };
  Pledge: { email: string; password: string; name: string; timezone: string; notificationTime?: string | null };
  ForgotPassword: undefined;

  // App tab screens
  HomeTabs: undefined;

  // Modal screens (shown on top of tabs)
  Milestone: { milestoneId: string; threadId: string };
  Dream: { threadId: string };
  StreakStats: undefined;
  ShareVictory: { victory: any };
  ShareJourneyRecap: { journeyRecap: any };
  ChangePassword: undefined;
  Paywall: undefined;
  Settings: undefined;
};

export type TabParamList = {
  Home: undefined;
  AllDreams: undefined;
  EvidenceBoard: undefined;
  Community: undefined;
  Analytics: undefined;
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
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Analytics') {
      navigation.navigate(screen as keyof TabParamList, params);
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
    dreamThreadId={route.params?.threadId}
  />
);

const AllDreamsScreenBase = ({ navigation, route }: any) => (
  <AllDreamsScreen
    onNavigate={(screen, params?) => {
      if (screen === 'Home' || screen === 'EvidenceBoard' || screen === 'AllDreams' || screen === 'Community' || screen === 'Analytics') {
        navigation.navigate(screen as keyof TabParamList);
      } else {
        navigation.navigate(screen as keyof RootStackParamList, params);
      }
    }}
    creatingDream={route.params?.creatingDream === true}
  />
);

const AllDreamsScreenWrapper = withFadeAnimation(AllDreamsScreenBase);

const DreamPageWrapper = ({ navigation, route }: any) => (
  <DreamPage
    threadId={route.params?.threadId}
    onNavigate={(screen, params) => {
      if (screen === 'Back') {
        navigation.goBack();
      } else if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Analytics') {
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
    }}
  />
);

const EvidenceBoardScreenBase = ({ navigation }: any) => (
  <EvidenceBoardScreen onNavigate={(screen, params) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Analytics') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }} />
);

const EvidenceBoardScreenWrapper = withFadeAnimation(EvidenceBoardScreenBase);

const CommunityScreenBase = ({ navigation }: any) => (
  <CommunityScreen onNavigate={(screen) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Analytics') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const CommunityScreenWrapper = withFadeAnimation(CommunityScreenBase);

const AnalyticsScreenBase = ({ navigation }: any) => (
  <AnalyticsScreen onNavigate={(screen: string) => {
    if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Analytics') {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const AnalyticsScreenWrapper = withFadeAnimation(AnalyticsScreenBase);

const SettingsModalWrapper = ({ navigation }: any) => (
  <SettingsScreen onNavigate={(screen: string) => {
    if (screen === 'Settings') {
      navigation.goBack();
    } else if (screen === 'Home' || screen === 'AllDreams' || screen === 'EvidenceBoard' || screen === 'Community' || screen === 'Analytics') {
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('HomeTabs', { screen: screen as keyof TabParamList });
      }, 100);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

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
        // Close the ShareVictory modal first
        navigation.goBack();
        // Then close the Milestone modal after a brief delay
        setTimeout(() => {
          // Check if we can go back (to close Milestone screen if it's open)
          if (navigation.canGoBack()) {
            navigation.goBack();
          }
          // Then navigate to Evidence Board
          setTimeout(() => {
            navigation.navigate('HomeTabs', {
              screen: 'EvidenceBoard',
            });
          }, 300);
        }, 300);
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
        // Step 1: Close the ShareJourneyRecap modal (goes back to Milestone screen)
        navigation.goBack();

        setTimeout(() => {
          // Step 2: Close the Milestone modal (goes back to Dream screen)
          if (navigation.canGoBack()) {
            navigation.goBack();
          }

          // Step 3: Wait a bit, then navigate to Evidence Board from Dream screen
          setTimeout(() => {
            navigation.navigate('HomeTabs', {
              screen: 'EvidenceBoard',
            });
          }, 400);
        }, 300);
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

const PaywallScreenWrapper = ({ navigation }: any) => (
  <PaywallScreen
    onClose={() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Fallback to Settings tab if no history
        navigation.navigate('HomeTabs', { screen: 'Settings' });
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
      <Stack.Screen name="Timezone" component={TimezoneScreen} />
      <Stack.Screen name="NotificationTime" component={NotificationTimeScreen} />
      <Stack.Screen name="Pledge" component={PledgeScreen} />
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
        name="Analytics"
        component={AnalyticsScreenWrapper}
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
        <Stack.Screen
          name="Paywall"
          component={PaywallScreenWrapper}
          options={{
            presentation: 'transparentModal',
            headerShown: false,
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="Settings"
          component={SettingsModalWrapper}
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
  const { initializeNotifications } = useNotificationStore();
  // Track whether the initial auth check has completed at least once.
  // After that, never show the blank loading view again — let the real
  // screens (auth or home with skeletons) handle their own loading states.
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Initialize RevenueCat SDK
    configureRevenueCat().catch((error) => {
      console.error('[App] RevenueCat initialization error:', error);
      // Don't block app on RevenueCat error
    });

    // Initialize auth (will also identify user in RevenueCat if logged in)
    initializeAuth();
  }, []);

  // Mark initial check done once loading flips to false for the first time
  useEffect(() => {
    if (!loading && !initialCheckDone) {
      setInitialCheckDone(true);
    }
  }, [loading, initialCheckDone]);

  // Initialize notifications after user is authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('[App] User authenticated, initializing notifications...');
      initializeNotifications();
    }
  }, [isAuthenticated, loading]);

  // Show blank loading view ONLY during the very first auth check on cold start.
  // Once that's done, or if the user is already authenticated, go straight to
  // the real navigator so HomeScreen can show its own skeletons.
  const showLoadingView = !initialCheckDone && !isAuthenticated;

  return (
    <NavigationContainer>
      {showLoadingView ? (
        <View style={{ flex: 1, backgroundColor: theme === 'light' ? Color.colorSnow : '#050938' }} />
      ) : isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} backgroundColor={theme === 'light' ? Color.colorSnow : '#050938'} />
      <Toast config={toastConfig} />
    </NavigationContainer>
  );
}
