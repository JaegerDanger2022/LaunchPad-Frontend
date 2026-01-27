import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import MilestoneScreen from './src/screens/MilestoneScreen';
import DreamPage from './src/screens/DreamPage';
import AllDreamsScreen from './src/screens/AllDreamsScreen';
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

  // App screens
  Home: undefined;
  AllDreams: undefined;
  Milestone: { milestoneId: string };
  Dream: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper components that accept navigation as a prop
const HomeScreenWrapper = ({ navigation }: any) => (
  <HomeScreen onNavigate={(screen) => navigation.navigate(screen as keyof RootStackParamList)} />
);

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

const AllDreamsScreenWrapper = ({ navigation }: any) => (
  <AllDreamsScreen onNavigate={(screen) => navigation.navigate(screen as keyof RootStackParamList)} />
);

const DreamPageWrapper = ({ navigation }: any) => (
  <DreamPage onNavigate={(screen, params) => {
    if (screen === 'Home') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList, params);
    }
  }} />
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

// App Navigator
function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="AllDreams"
        component={AllDreamsScreenWrapper}
        options={{
          headerShown: false,
        }}
      />
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
          headerShown: false,
        }}
      />
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
