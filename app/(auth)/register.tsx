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

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
}

export default function RegisterScreen(): React.JSX.Element {
  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const register = useAuthStore((s) => s.register);
  const isLoading = useAuthStore((s) => s.isLoading);

  const updateField = useCallback(
    (field: keyof FormState) => (value: string) => {
      setForm((f) => ({ ...f, [field]: value }));
      if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (form.username.length < 3)
      newErrors.username = "Username must be at least 3 characters";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      newErrors.username = "Only letters, numbers and underscores";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords don't match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleRegister = useCallback(async () => {
    if (!validate()) return;
    try {
      await register({
        email: form.email.trim().toLowerCase(),
        username: form.username.trim().toLowerCase(),
        password: form.password,
        fullName: form.fullName.trim(),
      });
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Registration Failed", parseApiError(err));
    }
  }, [form, register, validate]);

  const renderInputField = ({
    field,
    label,
    icon,
    placeholder,
    keyboardType = "default",
    autoComplete,
    secure,
    rightElement,
  }: {
    field: keyof FormState;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    placeholder: string;
    keyboardType?: "default" | "email-address";
    autoComplete?: string;
    secure?: boolean;
    rightElement?: React.ReactNode;
  }) => (
    <View>
      <Text className="text-dark-300 text-sm font-medium mb-1.5">{label}</Text>
      <View
        className={`flex-row items-center bg-dark-800 border rounded-xl px-4 py-3 gap-3 ${errors[field] ? "border-rose-500" : "border-dark-700"
          }`}
      >
        <Ionicons name={icon} size={18} color="#64748B" />
        <TextInput
          value={form[field]}
          onChangeText={updateField(field)}
          placeholder={placeholder}
          placeholderTextColor="#475569"
          className="flex-1 text-white text-sm"
          keyboardType={keyboardType}
          autoCapitalize="none"
          secureTextEntry={secure && !showPassword}
          returnKeyType="next"
          accessibilityLabel={label}
        />
        {rightElement}
      </View>
      {errors[field] && (
        <Text className="text-rose-400 text-xs mt-1 ml-1">
          {errors[field]}
        </Text>
      )}
    </View>
  );

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
          <View className="flex-1 px-6 pt-10 pb-8">
            <TouchableOpacity
              onPress={() => router.back()}
              className="flex-row items-center gap-1 mb-8"
            >
              <Ionicons name="arrow-back" size={20} color="#94A3B8" />
              <Text className="text-dark-400 text-sm">Back</Text>
            </TouchableOpacity>

            <View className="mb-8">
              <Text className="text-white text-3xl font-bold mb-2">
                Create account 🚀
              </Text>
              <Text className="text-dark-400 text-base">
                Join thousands of learners worldwide
              </Text>
            </View>

            <View className="gap-4 mb-6">
              {renderInputField({
                field: "fullName",
                label: "Full Name",
                icon: "person-outline",
                placeholder: "John Doe",
              })}
              {renderInputField({
                field: "username",
                label: "Username",
                icon: "at-outline",
                placeholder: "johndoe",
              })}
              {renderInputField({
                field: "email",
                label: "Email Address",
                icon: "mail-outline",
                placeholder: "you@example.com",
                keyboardType: "email-address",
              })}
              {renderInputField({
                field: "password",
                label: "Password",
                icon: "lock-closed-outline",
                placeholder: "Min. 6 characters",
                secure: true,
                rightElement: (
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={
                        showPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={18}
                      color="#64748B"
                    />
                  </TouchableOpacity>
                ),
              })}
              {renderInputField({
                field: "confirmPassword",
                label: "Confirm Password",
                icon: "shield-checkmark-outline",
                placeholder: "Re-enter password",
                secure: true,
              })}
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={isLoading}
              className={`rounded-xl py-4 items-center mb-6 ${isLoading ? "bg-primary-700" : "bg-primary-500"
                }`}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-base">
                  Create Account
                </Text>
              )}
            </TouchableOpacity>


            <View className="flex-row justify-center items-center gap-1">
              <Text className="text-dark-400 text-sm">
                Already have an account?
              </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text className="text-primary-400 text-sm font-semibold">
                    Sign in
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
