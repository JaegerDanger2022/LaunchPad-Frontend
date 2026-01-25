import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import HomeScreen from './src/screens/HomeScreen';
import MilestoneScreen from './src/screens/MilestoneScreen';
import DreamPage from './src/screens/DreamPage';

export type RootStackParamList = {
  Home: undefined;
  Milestone: undefined;
  Dream: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Wrapper components that accept navigation as a prop
const HomeScreenWrapper = ({ navigation }: any) => (
  <HomeScreen onNavigate={(screen) => navigation.navigate(screen as keyof RootStackParamList)} />
);

const MilestoneScreenWrapper = ({ navigation }: any) => (
  <MilestoneScreen onNavigate={(screen) => {
    if (screen === 'Home') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

const DreamPageWrapper = ({ navigation }: any) => (
  <DreamPage onNavigate={(screen) => {
    if (screen === 'Home') {
      navigation.goBack();
    } else {
      navigation.navigate(screen as keyof RootStackParamList);
    }
  }} />
);

export default function App() {
  return (
    <NavigationContainer>
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
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}
