import { parseApiError } from "@/services/api";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { Link, router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen(): React.JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);

  const validate = useCallback((): boolean => {
    const errors: { email?: string; password?: string } = {};
    if (!email.trim()) errors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errors.email = "Enter a valid email";
    if (!password) errors.password = "Password is required";
    else if (password.length < 6)
      errors.password = "Password must be at least 6 characters";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [email, password]);

  const handleLogin = useCallback(async () => {
    if (!validate()) return;
    try {
      await login({ email: email.trim().toLowerCase(), password });
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Login Failed", parseApiError(err));
    }
  }, [email, password, login, validate]);

  return (
    <SafeAreaView className="flex-1 bg-dark-900">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 pt-12 pb-8">

            <View className="mb-10">
              <View className="w-14 h-14 rounded-2xl bg-primary-500/20 border border-primary-500/30 items-center justify-center mb-5">
                <Ionicons name="school" size={28} color="#6366F1" />
              </View>
              <Text className="text-white text-3xl font-bold mb-2">
                Welcome back 👋
              </Text>
              <Text className="text-dark-400 text-base">
                Sign in to continue your learning journey
              </Text>
            </View>

            <View className="gap-4 mb-6">

              <View>
                <Text className="text-dark-300 text-sm font-medium mb-1.5">
                  Email address
                </Text>
                <View
                  className={`flex-row items-center bg-dark-800 border rounded-xl px-4 py-3 gap-3 ${fieldErrors.email
                    ? "border-rose-500"
                    : "border-dark-700"
                    }`}
                >
                  <Ionicons name="mail-outline" size={18} color="#64748B" />
                  <TextInput
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      if (fieldErrors.email)
                        setFieldErrors((e) => ({ ...e, email: undefined }));
                    }}
                    placeholder="you@example.com"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white text-sm"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    returnKeyType="next"
                    accessibilityLabel="Email input"
                  />
                </View>
                {fieldErrors.email && (
                  <Text className="text-rose-400 text-xs mt-1 ml-1">
                    {fieldErrors.email}
                  </Text>
                )}
              </View>

              <View>
                <Text className="text-dark-300 text-sm font-medium mb-1.5">
                  Password
                </Text>
                <View
                  className={`flex-row items-center bg-dark-800 border rounded-xl px-4 py-3 gap-3 ${fieldErrors.password
                    ? "border-rose-500"
                    : "border-dark-700"
                    }`}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={18}
                    color="#64748B"
                  />
                  <TextInput
                    value={password}
                    onChangeText={(t) => {
                      setPassword(t);
                      if (fieldErrors.password)
                        setFieldErrors((e) => ({
                          ...e,
                          password: undefined,
                        }));
                    }}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="#475569"
                    className="flex-1 text-white text-sm"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                    accessibilityLabel="Password input"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    accessibilityLabel={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                </View>
                {fieldErrors.password && (
                  <Text className="text-rose-400 text-xs mt-1 ml-1">
                    {fieldErrors.password}
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              className={`rounded-xl py-4 items-center mb-4 ${isLoading ? "bg-primary-700" : "bg-primary-500"
                }`}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-dark-400 text-sm">
                Don't have an account?
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-400 text-sm font-semibold">
                    Sign up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
