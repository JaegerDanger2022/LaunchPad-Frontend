import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Color } from "../../constants/GlobalStyles";
import { useAuthStore, checkGoogleSignInAvailable } from "../../store/authStore";

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleSignInAvailable, setGoogleSignInAvailable] = useState(false);
  const { login, googleSignIn, loading, error, clearError } = useAuthStore();

  useEffect(() => {
    setGoogleSignInAvailable(checkGoogleSignInAvailable());
  }, []);

  const isValidEmail = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await login(email, password);
    } catch (err) {
      // Error is handled by the store
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await googleSignIn();
    } catch (err) {
      // Error is handled by the store
    }
  };

  const canSubmit = email && password && isValidEmail(email) && !loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Color.colorSnow }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1 }}>
          {/* Orange Gradient Header */}
          <LinearGradient
            colors={["#fb6322", "#f79971"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingHorizontal: 22,
              paddingTop: 60,
              paddingBottom: 40,
            }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "700",
                color: Color.colorWhite,
                fontFamily: "InstrumentSans-Bold",
                marginBottom: 8,
              }}>
              Welcome Back!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: Color.colorWhite,
                fontFamily: "InstrumentSans-Regular",
                fontWeight: "400",
                opacity: 0.9,
              }}>
              Log in to continue your journey
            </Text>
          </LinearGradient>

          {/* Form Content */}
          <View
            style={{
              flex: 1,
              paddingHorizontal: 22,
              paddingTop: 32,
              paddingBottom: 32,
            }}>
            {/* Error Message */}
            {error && (
              <View
                style={{
                  backgroundColor: "#ffebee",
                  borderLeftWidth: 4,
                  borderLeftColor: "#e74c3c",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    color: "#c0392b",
                    fontSize: 14,
                    fontFamily: "InstrumentSans-Regular",
                  }}>
                  {error}
                </Text>
              </View>
            )}

            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: Color.colorBlack,
                  fontFamily: "InstrumentSans-Bold",
                  marginBottom: 8,
                }}>
                Email Address
              </Text>
              <TextInput
                style={{
                  backgroundColor: Color.colorWhite,
                  borderWidth: 1,
                  borderColor: error ? "#e74c3c" : "#E0E0E0",
                  borderRadius: 10,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontSize: 16,
                  fontFamily: "InstrumentSans-Regular",
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

            {/* Password Input */}
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: Color.colorBlack,
                  fontFamily: "InstrumentSans-Bold",
                  marginBottom: 8,
                }}>
                Password
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: Color.colorWhite,
                  borderWidth: 1,
                  borderColor: error ? "#e74c3c" : "#E0E0E0",
                  borderRadius: 10,
                  paddingHorizontal: 16,
                }}>
                <TextInput
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    fontSize: 16,
                    fontFamily: "InstrumentSans-Regular",
                    color: Color.colorBlack,
                  }}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) clearError();
                  }}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}>
                  {showPassword ? (
                    <EyeOffIcon size={20} color="#A0A0A0" />
                  ) : (
                    <EyeIcon size={20} color="#A0A0A0" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
              disabled={loading}
              style={{ marginBottom: 24 }}>
              <Text
                style={{
                  textAlign: "right",
                  color: "#fb6322",
                  fontSize: 14,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "600",
                }}>
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={!canSubmit}
              activeOpacity={0.8}
              style={{
                marginBottom: 20,
                opacity: canSubmit ? 1 : 0.5,
              }}>
              <LinearGradient
                colors={["#fb6322", "#f79971"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 10,
                  paddingVertical: 14,
                  alignItems: "center",
                }}>
                {loading ? (
                  <ActivityIndicator size="small" color={Color.colorWhite} />
                ) : (
                  <Text
                    style={{
                      color: Color.colorWhite,
                      fontSize: 16,
                      fontFamily: "InstrumentSans-Bold",
                      fontWeight: "700",
                    }}>
                    LOG IN
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 24,
                gap: 12,
              }}>
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: "#A0A0A0",
                  fontFamily: "InstrumentSans-Regular",
                }}>
                or continue with
              </Text>
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }}
              />
            </View>

            {/* Google Sign-In Button - Only show if available */}
            {googleSignInAvailable && (
              <TouchableOpacity
                onPress={handleGoogleSignIn}
                disabled={loading}
                activeOpacity={0.8}
                style={{
                  marginBottom: 12,
                  opacity: loading ? 0.6 : 1,
                }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: Color.colorWhite,
                    borderWidth: 1,
                    borderColor: "#E0E0E0",
                    borderRadius: 10,
                    paddingVertical: 14,
                    gap: 8,
                  }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: Color.colorBlack,
                      fontFamily: "InstrumentSans-Bold",
                      fontWeight: "600",
                    }}>
                    Sign in with Google
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {/* Info message for Expo Go users */}
            {!googleSignInAvailable && (
              <View
                style={{
                  backgroundColor: "#FFF3CD",
                  borderLeftWidth: 4,
                  borderLeftColor: "#FFC107",
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderRadius: 8,
                  marginBottom: 20,
                }}>
                <Text
                  style={{
                    color: "#856404",
                    fontSize: 12,
                    fontFamily: "InstrumentSans-Regular",
                    lineHeight: 16,
                  }}>
                  Google Sign-In requires building the app. Use email/password login for now, or run: {"\n"}
                  <Text style={{ fontFamily: "InstrumentSans-Bold", fontWeight: "600" }}>
                    expo prebuild {"&&"} npm run build:ios/android
                  </Text>
                </Text>
              </View>
            )}

            {/* Sign Up Link */}
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 4,
              }}>
              <Text
                style={{
                  fontSize: 14,
                  color: "#A0A0A0",
                  fontFamily: "InstrumentSans-Regular",
                }}>
                Don't have an account?
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Signup")}
                disabled={loading}>
                <Text
                  style={{
                    fontSize: 14,
                    color: "#fb6322",
                    fontFamily: "InstrumentSans-Bold",
                    fontWeight: "600",
                  }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
