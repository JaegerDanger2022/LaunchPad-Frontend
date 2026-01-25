import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronLeft, CheckCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Color } from '../../constants/GlobalStyles';
import { useAuthStore } from '../../store/authStore';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { resetPassword, loading, error, clearError } = useAuthStore();

  const isValidEmail = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const canSubmit = email && isValidEmail(email) && !loading;

  const handleResetPassword = async () => {
    if (!canSubmit) return;

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      // Error is handled by the store
    }
  };

  if (submitted) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1, backgroundColor: Color.colorSnow }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 22 }}>
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#e8f5e9',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 24,
              }}>
              <CheckCircle size={48} color="#00D4AA" />
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '700',
                color: Color.colorBlack,
                fontFamily: 'InstrumentSans-Bold',
                marginBottom: 12,
                textAlign: 'center',
              }}>
              Check Your Email
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#A0A0A0',
                fontFamily: 'InstrumentSans-Regular',
                textAlign: 'center',
                lineHeight: 24,
                marginBottom: 32,
              }}>
              We've sent a password reset link to{'\n'}
              <Text style={{ color: Color.colorBlack, fontFamily: 'InstrumentSans-Bold', fontWeight: '600' }}>
                {email}
              </Text>
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: '#A0A0A0',
                fontFamily: 'InstrumentSans-Regular',
                textAlign: 'center',
                lineHeight: 20,
                marginBottom: 40,
              }}>
              Click the link in your email to reset your password. The link will expire in 24 hours.
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
              style={{ width: '100%' }}>
              <LinearGradient
                colors={['#fb6322', '#f79971']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                <Text
                  style={{
                    color: Color.colorWhite,
                    fontSize: 16,
                    fontFamily: 'InstrumentSans-Bold',
                    fontWeight: '700',
                  }}>
                  BACK TO LOGIN
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSubmitted(false);
                setEmail('');
              }}
              style={{ marginTop: 16 }}>
              <Text
                style={{
                  color: '#fb6322',
                  fontSize: 14,
                  fontFamily: 'InstrumentSans-Bold',
                  fontWeight: '600',
                }}>
                Try another email
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: Color.colorSnow }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          {/* Header with Back Button */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 22,
              paddingTop: 16,
              paddingBottom: 24,
              backgroundColor: Color.colorSnow,
            }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: 'rgba(251, 99, 34, 0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <ChevronLeft size={24} color="#fb6322" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 22,
              paddingTop: 20,
              paddingBottom: 32,
            }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: Color.colorBlack,
                fontFamily: 'InstrumentSans-Bold',
                marginBottom: 8,
              }}>
              Reset Password
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#A0A0A0',
                fontFamily: 'InstrumentSans-Regular',
                lineHeight: 24,
                marginBottom: 32,
              }}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>

            {/* Error Message */}
            {error && (
              <View
                style={{
                  backgroundColor: '#ffebee',
                  borderLeftWidth: 4,
                  borderLeftColor: '#e74c3c',
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    color: '#c0392b',
                    fontSize: 14,
                    fontFamily: 'InstrumentSans-Regular',
                  }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: Color.colorBlack,
                  fontFamily: 'InstrumentSans-Bold',
                  marginBottom: 8,
                }}>
                Email Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: Color.colorWhite,
                  borderWidth: 1,
                  borderColor: error ? '#e74c3c' : '#E0E0E0',
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: 'InstrumentSans-Regular',
                  color: Color.colorBlack,
                }}
                placeholder="you@example.com"
                placeholderTextColor="#A0A0A0"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
                editable={!loading}
              />
            </View>

            {/* Send Reset Link Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
              disabled={!canSubmit}
              activeOpacity={0.8}
              style={{
                opacity: canSubmit ? 1 : 0.5,
              }}>
              <LinearGradient
                colors={['#fb6322', '#f79971']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                {loading ? (
                  <ActivityIndicator size="small" color={Color.colorWhite} />
                ) : (
                  <Text
                    style={{
                      color: Color.colorWhite,
                      fontSize: 16,
                      fontFamily: 'InstrumentSans-Bold',
                      fontWeight: '700',
                    }}>
                    SEND RESET LINK
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default ForgotPasswordScreen;
