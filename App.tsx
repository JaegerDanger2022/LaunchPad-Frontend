import { StatusBar } from 'expo-status-bar';
import { useEffect, useCallback, useState, useRef } from 'react';
import { View, Alert, Platform, Animated } from 'react-native';
import { NavigationContainer, useIsFocused } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import React from 'react';
import { AnimatedSplashScreen } from './src/components/animations/AnimatedSplashScreen';
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
import { PrivacyPolicyScreen } from './src/screens/PrivacyPolicyScreen';
import { TermsOfServiceScreen } from './src/screens/TermsOfServiceScreen';
import { HelpSupportScreen } from './src/screens/HelpSupportScreen';
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
  Signup: { emailError?: string; name?: string; email?: string } | undefined;
  Timezone: { email: string; password: string; name: string; isGoogleSignUp?: boolean };
  NotificationTime: { email: string; password: string; name: string; timezone: string; isGoogleSignUp?: boolean };
  Pledge: { email: string; password: string; name: string; timezone: string; notificationTime?: string | null; isGoogleSignUp?: boolean };
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
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  HelpSupport: undefined;
};

export type TabParamList = {
  Home: undefined;
  AllDreams: undefined;
  EvidenceBoard: undefined;
  Community: { highlightVictoryId?: string } | undefined;
  Analytics: undefined;
};


// Keep native splash visible while JS loads and Lottie splash mounts
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_SCREENS = new Set<string>(['Home', 'AllDreams', 'EvidenceBoard', 'Community', 'Analytics']);

// Fade-in animation wrapper for tab screens
const FadeInTabWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isFocused = useIsFocused();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFocused) {
      // Fade in when screen becomes focused
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset opacity when screen loses focus
      fadeAnim.setValue(0);
    }
  }, [isFocused, fadeAnim]);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
};

// Memoized wrapper components with fade-in animation
const HomeScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string, params?: any) => {
    if (TAB_SCREENS.has(screen)) {
      navigation.navigate(screen as keyof TabParamList, params);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }, [navigation]);
  return (
    <FadeInTabWrapper>
      <HomeScreen onNavigate={onNavigate} />
    </FadeInTabWrapper>
  );
});

const MilestoneScreenWrapper = React.memo(({ navigation, route }: any) => {
  const onNavigate = useCallback((screen: string, params?: any) => {
    if (screen === 'Home') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }, [navigation]);
  return (
    <MilestoneScreen
      onNavigate={onNavigate}
      milestoneId={route.params?.milestoneId}
      dreamThreadId={route.params?.threadId}
    />
  );
});

const AllDreamsScreenWrapper = React.memo(({ navigation, route }: any) => {
  const onNavigate = useCallback((screen: string, params?: any) => {
    if (TAB_SCREENS.has(screen)) {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }, [navigation]);
  return (
    <FadeInTabWrapper>
      <AllDreamsScreen onNavigate={onNavigate} creatingDream={route.params?.creatingDream === true} />
    </FadeInTabWrapper>
  );
});

const DreamPageWrapper = React.memo(({ navigation, route }: any) => {
  const onNavigate = useCallback((screen: string, params?: any) => {
    if (screen === 'Back') {
      navigation.goBack();
    } else if (TAB_SCREENS.has(screen)) {
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('HomeTabs', { screen: screen as keyof TabParamList });
      }, 100);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }, [navigation]);
  return <DreamPage threadId={route.params?.threadId} onNavigate={onNavigate} />;
});

const EvidenceBoardScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string, params?: any) => {
    if (TAB_SCREENS.has(screen)) {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }, [navigation]);
  return (
    <FadeInTabWrapper>
      <EvidenceBoardScreen onNavigate={onNavigate} />
    </FadeInTabWrapper>
  );
});

const CommunityScreenWrapper = React.memo(({ navigation, route }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (TAB_SCREENS.has(screen)) {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return (
    <FadeInTabWrapper>
      <CommunityScreen onNavigate={onNavigate} highlightVictoryId={route.params?.highlightVictoryId} />
    </FadeInTabWrapper>
  );
});

const AnalyticsScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (TAB_SCREENS.has(screen)) {
      navigation.navigate(screen as keyof TabParamList);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return (
    <FadeInTabWrapper>
      <AnalyticsScreen onNavigate={onNavigate} />
    </FadeInTabWrapper>
  );
});

const SettingsModalWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (screen === 'Settings') {
      navigation.goBack();
    } else if (TAB_SCREENS.has(screen)) {
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('HomeTabs', { screen: screen as keyof TabParamList });
      }, 100);
    } else {
      // Close the Settings modal first, then navigate to the other screen
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate(screen as keyof RootStackParamList);
      }, 100);
    }
  }, [navigation]);
  return <SettingsScreen onNavigate={onNavigate} />;
});

const StreakStatsScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (screen === 'Home') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return <StreakStatsScreen onNavigate={onNavigate} />;
});

const ShareVictoryScreenWrapper = React.memo(({ navigation, route }: any) => {
  const onNavigate = useCallback((screen: string) => {
    navigation.goBack();
    setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, 300);
  }, [navigation]);
  return <ShareVictoryScreen onNavigate={onNavigate} victory={route.params?.victory} />;
});

const ShareJourneyRecapScreenWrapper = React.memo(({ navigation, route }: any) => {
  const onNavigate = useCallback((screen: string) => {
    navigation.goBack();
    setTimeout(() => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }, 300);
  }, [navigation]);
  return <ShareJourneyRecapScreen onNavigate={onNavigate} journeyRecap={route.params?.journeyRecap} />;
});

const ChangePasswordScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (screen === 'Settings') {
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('HomeTabs', { screen: 'Settings' });
      }, 100);
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return <ChangePasswordScreen onNavigate={onNavigate} />;
});

const PaywallScreenWrapper = React.memo(({ navigation }: any) => {
  const onClose = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('HomeTabs', { screen: 'Settings' });
    }
  }, [navigation]);
  return <PaywallScreen onClose={onClose} />;
});

const PrivacyPolicyScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (screen === 'Settings') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return <PrivacyPolicyScreen onNavigate={onNavigate} />;
});

const TermsOfServiceScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (screen === 'Settings') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return <TermsOfServiceScreen onNavigate={onNavigate} />;
});

const HelpSupportScreenWrapper = React.memo(({ navigation }: any) => {
  const onNavigate = useCallback((screen: string) => {
    if (screen === 'Settings') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }, [navigation]);
  return <HelpSupportScreen onNavigate={onNavigate} />;
});

// Auth Navigator
function AuthNavigator({ initialRoute = 'Login' }: { initialRoute?: string }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRoute as any}>
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
        <Stack.Screen
          name="PrivacyPolicy"
          component={PrivacyPolicyScreenWrapper}
          options={{
            presentation: 'card',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="TermsOfService"
          component={TermsOfServiceScreenWrapper}
          options={{
            presentation: 'card',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="HelpSupport"
          component={HelpSupportScreenWrapper}
          options={{
            presentation: 'card',
            headerShown: false,
            animation: 'slide_from_right',
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}

export default function App() {
  const { isAuthenticated, loading, initializeAuth, needsOnboarding } = useAuthStore();
  const { theme } = useThemeStore();
  const { initializeNotifications } = useNotificationStore();
  // Track whether the initial auth check has completed at least once.
  // After that, never show the blank loading view again — let the real
  // screens (auth or home with skeletons) handle their own loading states.
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [splashComplete, setSplashComplete] = useState(false);

  // Check for OTA updates
  useEffect(() => {
    async function checkForUpdates() {
      if (__DEV__) {
        console.log('[Updates] Skipping update check in development mode');
        return;
      }

      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          console.log('[Updates] Update available, fetching...');
          await Updates.fetchUpdateAsync();

          // Alert user about the update
          Alert.alert(
            'Update Available',
            'A new version of the app is available. Restart now to use the latest version?',
            [
              {
                text: 'Later',
                style: 'cancel',
                onPress: () => console.log('[Updates] User chose to update later'),
              },
              {
                text: 'Restart',
                onPress: async () => {
                  console.log('[Updates] Reloading app with new update');
                  await Updates.reloadAsync();
                },
              },
            ]
          );
        } else {
          console.log('[Updates] App is up to date');
        }
      } catch (error) {
        console.error('[Updates] Error checking for updates:', error);
      }
    }

    checkForUpdates();
  }, []);

  useEffect(() => {
    // Initialize RevenueCat SDK
    configureRevenueCat().catch((error) => {
      console.error('[App] RevenueCat initialization error:', error);
      // Don't block app on RevenueCat error
    });

    // Initialize auth (will also identify user in RevenueCat if logged in)
    initializeAuth();
  }, []);

  // Hide the native splash immediately so the video splash takes over
  useEffect(() => {
    SplashScreen.hideAsync();
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

  const isAppReady = initialCheckDone || isAuthenticated || needsOnboarding;

  const handleSplashComplete = useCallback(() => {
    setSplashComplete(true);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {isAppReady ? (
          isAuthenticated ? <AppNavigator /> : needsOnboarding ? <AuthNavigator initialRoute="Timezone" /> : <AuthNavigator />
        ) : (
          <View style={{ flex: 1, backgroundColor: '#050938' }} />
        )}
        <StatusBar style={theme === 'light' ? 'dark' : 'light'} backgroundColor={theme === 'light' ? Color.colorSnow : '#050938'} />
        <Toast config={toastConfig} />
      </NavigationContainer>
      {!splashComplete && (
        <AnimatedSplashScreen
          isAppReady={isAppReady}
          onAnimationComplete={handleSplashComplete}
        />
      )}
    </View>
  );
}
