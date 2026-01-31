import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface VoiceModeToggleProps {
  mode: 'text' | 'voice';
  onModeChange: (mode: 'text' | 'voice') => void;
  disabled?: boolean;
}

export const VoiceModeToggle: React.FC<VoiceModeToggleProps> = ({
  mode,
  onModeChange,
  disabled = false,
}) => {
  const handleModeChange = async (newMode: 'text' | 'voice') => {
    if (disabled || newMode === mode) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onModeChange(newMode);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.leftButton,
          mode === 'text' && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => handleModeChange('text')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            mode === 'text' && styles.buttonTextActive,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          Text
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.rightButton,
          mode === 'voice' && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={() => handleModeChange('voice')}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.buttonText,
            mode === 'voice' && styles.buttonTextActive,
            disabled && styles.buttonTextDisabled,
          ]}
        >
          Voice
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 4,
    height: 44,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  leftButton: {
    marginRight: 2,
  },
  rightButton: {
    marginLeft: 2,
  },
  buttonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontFamily: 'InstrumentSans-Regular',
    color: '#A0A0A0',
  },
  buttonTextActive: {
    fontFamily: 'InstrumentSans-Bold',
    color: '#1A1A1A',
  },
  buttonTextDisabled: {
    color: '#CCCCCC',
  },
});
