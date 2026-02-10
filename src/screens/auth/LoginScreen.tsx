import { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { EyeIcon, EyeOffIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import Svg, { Path, G } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Color } from "../../constants/GlobalStyles";
import { useAuthStore } from "../../store/authStore";

const GoogleIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24">
    <G>
      <Path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <Path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <Path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <Path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </G>
  </Svg>
);

// Animated background blob component
const AnimatedBlob: React.FC<{
  delay: number;
  size: number;
  color: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}> = ({ delay, size, color, top, bottom, left, right }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 3000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const scale = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.1, 1],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 15, 0],
  });

  const style: any = {
    position: "absolute",
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: color,
    opacity: 0.3,
    transform: [{ scale }, { translateY }],
  };

  if (top) style.top = top;
  if (bottom) style.bottom = bottom;
  if (left) style.left = left;
  if (right) style.right = right;

  return <Animated.View style={style} />;
};

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleSignIn, loading, error, clearError } = useAuthStore();
  const insets = useSafeAreaInsets();

  const isValidEmail = (e: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(e);
  };

  const handleLogin = async () => {
    if (!email || !password) return;
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
      style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* Animated Background Blobs */}
      <AnimatedBlob delay={0} size={288} color="#FF6B35" top="80" left="80" />
      <AnimatedBlob
        delay={700}
        size={288}
        color="#A855F7"
        top="160"
        right="80"
      />
      <AnimatedBlob
        delay={1000}
        size={288}
        color="rgba(255, 107, 53, 0.5)"
        bottom="80"
        left="50%"
      />

      {/* Blur Overlay */}
      <BlurView
        intensity={50}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, paddingHorizontal: 24 }}>
          {/* Header */}
          <View style={{ paddingTop: 80, marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 34,
                fontWeight: "700",
                color: "#1A1A1A",
                fontFamily: "InstrumentSans-Bold",
                marginBottom: 8,
              }}>
              Log in to continue your journey
            </Text>
          </View>

          {/* Error Message */}
          {error && (
            <View
              style={{
                backgroundColor: "rgba(231, 76, 60, 0.15)",
                borderWidth: 1,
                borderColor: "rgba(231, 76, 60, 0.4)",
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 10,
                marginBottom: 20,
              }}>
              <Text
                style={{
                  color: "#E74C3C",
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
                fontSize: 13,
                fontWeight: "600",
                color: "#666666",
                fontFamily: "InstrumentSans-Bold",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}>
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: "#F9F9F9",
                borderWidth: 1,
                borderColor: error ? "rgba(231,76,60,0.5)" : "#E0E0E0",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                fontFamily: "InstrumentSans-Regular",
                color: "#1A1A1A",
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
          <View style={{ marginBottom: 8 }}>
            <Text
              style={{
                fontSize: 13,
                fontWeight: "600",
                color: "#666666",
                fontFamily: "InstrumentSans-Bold",
                marginBottom: 8,
                textTransform: "uppercase",
                letterSpacing: 0.8,
              }}>
              Password
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#F9F9F9",
                borderWidth: 1,
                borderColor: error ? "rgba(231,76,60,0.5)" : "#E0E0E0",
                borderRadius: 12,
                paddingHorizontal: 16,
              }}>
              <TextInput
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  fontSize: 16,
                  fontFamily: "InstrumentSans-Regular",
                  color: "#1A1A1A",
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

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate("ForgotPassword")}
            disabled={loading}
            style={{ alignSelf: "flex-end", marginBottom: 28 }}>
            <Text
              style={{
                color: Color.colorOrangered,
                fontSize: 14,
                fontFamily: "InstrumentSans-Bold",
              }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={!canSubmit}
            activeOpacity={0.8}
            style={{ opacity: canSubmit ? 1 : 0.45 }}>
            <LinearGradient
              colors={["#fb6322", "#f79971"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                borderRadius: 12,
                paddingVertical: 15,
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
                    letterSpacing: 0.5,
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
            <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
            <Text
              style={{
                fontSize: 13,
                color: "#A0A0A0",
                fontFamily: "InstrumentSans-Regular",
              }}>
              or continue with
            </Text>
            <View style={{ flex: 1, height: 1, backgroundColor: "#E0E0E0" }} />
          </View>

          {/* Google Sign-In */}
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={loading}
            activeOpacity={0.8}
            style={{ opacity: loading ? 0.5 : 1 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E0E0E0",
                borderRadius: 12,
                paddingVertical: 15,
                gap: 10,
              }}>
              <GoogleIcon />
              <Text
                style={{
                  fontSize: 16,
                  color: "#1A1A1A",
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "600",
                }}>
                Sign in with Google
              </Text>
            </View>
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              gap: 4,
              marginTop: "auto",
              paddingTop: 40,
              paddingBottom: Math.max(insets.bottom + 16, 40),
            }}>
            <Text
              style={{
                fontSize: 14,
                color: "#666666",
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
                  color: Color.colorOrangered,
                  fontFamily: "InstrumentSans-Bold",
                  fontWeight: "600",
                }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
