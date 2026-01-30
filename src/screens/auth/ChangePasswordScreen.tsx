import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { getThemeColors, Color } from '../../constants/GlobalStyles';
import Toast from 'react-native-toast-message';
import { ChevronLeft } from 'lucide-react-native';

interface ChangePasswordScreenProps {
  onNavigate?: (screen: string) => void;
}

export const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ onNavigate }) => {
  const { theme } = useThemeStore();
  const { changePassword } = useAuthStore();
  const themeColors = getThemeColors(theme);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validation
    if (!currentPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Current Password Required',
        text2: 'Please enter your current password',
        visibilityTime: 2500,
      });
      return;
    }

    if (!newPassword.trim()) {
      Toast.show({
        type: 'error',
        text1: 'New Password Required',
        text2: 'Please enter a new password',
        visibilityTime: 2500,
      });
      return;
    }

    if (newPassword.length < 6) {
      Toast.show({
        type: 'error',
        text1: 'Password Too Short',
        text2: 'Password must be at least 6 characters',
        visibilityTime: 2500,
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Passwords Don\'t Match',
        text2: 'New password and confirmation must match',
        visibilityTime: 2500,
      });
      return;
    }

    if (currentPassword === newPassword) {
      Toast.show({
        type: 'error',
        text1: 'Same Password',
        text2: 'New password must be different from current password',
        visibilityTime: 2500,
      });
      return;
    }

    try {
      setLoading(true);
      await changePassword(currentPassword, newPassword);

      Toast.show({
        type: 'success',
        text1: 'Password Changed',
        text2: 'Your password has been updated successfully',
        visibilityTime: 2500,
      });

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Navigate back to settings after a short delay
      setTimeout(() => {
        onNavigate?.('Settings');
      }, 1500);
    } catch (error: any) {
      let errorMessage = 'Failed to change password';

      if (error.message.includes('wrong-password') || error.message.includes('invalid-credential')) {
        errorMessage = 'Current password is incorrect';
      } else if (error.message.includes('too-many-requests')) {
        errorMessage = 'Too many attempts. Please try again later';
      } else if (error.message.includes('requires-recent-login')) {
        errorMessage = 'Please log out and log in again before changing password';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Password Change Failed',
        text2: errorMessage,
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.bg_primary }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Back Button - Semi-transparent Background */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
              <TouchableOpacity
                onPress={() => onNavigate?.('Settings')}
                style={{
                  width: 48,
                  height: 48,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <ChevronLeft size={24} color={themeColors.text_primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: themeColors.text_primary }]}>
              Change Password
            </Text>
            <Text style={[styles.subtitle, { color: themeColors.text_secondary }]}>
              Please enter your current password and choose a new one
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text_primary }]}>
                Current Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.bg_secondary,
                    color: themeColors.text_primary,
                    borderColor: themeColors.border,
                  },
                ]}
                placeholder="Enter current password"
                placeholderTextColor={themeColors.text_secondary}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text_primary }]}>
                New Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.bg_secondary,
                    color: themeColors.text_primary,
                    borderColor: themeColors.border,
                  },
                ]}
                placeholder="Enter new password"
                placeholderTextColor={themeColors.text_secondary}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
              <Text style={[styles.hint, { color: themeColors.text_secondary }]}>
                Must be at least 6 characters
              </Text>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: themeColors.text_primary }]}>
                Confirm New Password
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.bg_secondary,
                    color: themeColors.text_primary,
                    borderColor: themeColors.border,
                  },
                ]}
                placeholder="Confirm new password"
                placeholderTextColor={themeColors.text_secondary}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                { backgroundColor: Color.colorOrangered },
                loading && styles.submitButtonDisabled,
              ]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Color.colorWhite} />
              ) : (
                <Text style={styles.submitButtonText}>Change Password</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: 'InstrumentSans-Bold',
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'InstrumentSans-Regular',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontFamily: 'InstrumentSans-Medium',
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontFamily: 'InstrumentSans-Regular',
  },
  hint: {
    fontSize: 14,
    fontFamily: 'InstrumentSans-Regular',
    marginTop: 4,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Color.colorWhite,
    fontSize: 18,
    fontFamily: 'InstrumentSans-Bold',
    fontWeight: '700',
  },
});
