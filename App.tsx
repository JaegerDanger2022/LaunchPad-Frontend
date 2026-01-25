import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import MilestoneScreen from './src/screens/MilestoneScreen';
import DreamPage from './src/screens/DreamPage';
import { useAppStore } from './src/store/appStore';

export default function App() {
  const currentScreen = useAppStore((state) => state.currentScreen);
  const setCurrentScreen = useAppStore((state) => state.setCurrentScreen);

  return (
    <>
      {currentScreen === 'Home' && <HomeScreen onNavigate={setCurrentScreen} />}
      {currentScreen === 'Milestone' && (
        <MilestoneScreen onNavigate={setCurrentScreen} />
      )}
      {currentScreen === 'Dream' && <DreamPage onNavigate={setCurrentScreen} />}
      <StatusBar style="dark" />
    </>
  );
}
