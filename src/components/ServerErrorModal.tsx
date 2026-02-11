import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Color } from '../constants/GlobalStyles';
import { useAppStore } from '../store/appStore';

export const ServerErrorModal: React.FC = () => {
  const { serverErrorVisible, hideServerError } = useAppStore();

  if (!serverErrorVisible) return null;

  return (
    <Modal visible={serverErrorVisible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          <LinearGradient
            colors={['#1e1b4b', '#312e81']}
            style={styles.gradient}
          >
            <Text style={styles.icon}>🛠️</Text>

            <Text style={styles.title}>We'll Be Right Back</Text>

            <Text style={styles.message}>
              We're experiencing some technical difficulties on our end. Your data is safe — please try again in a few moments.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={hideServerError}
            >
              <Text style={styles.buttonText}>Got It</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '85%',
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradient: {
    padding: 32,
    alignItems: 'center',
  },
  icon: {
    fontSize: 56,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Color.colorWhite,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  button: {
    backgroundColor: Color.colorWhite,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 20,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#312e81',
  },
});
