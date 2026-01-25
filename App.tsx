import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import HomeScreen from './src/screens/HomeScreen';
import MilestoneScreen from './src/screens/MilestoneScreen';
import DreamPage from './src/screens/DreamPage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');

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
