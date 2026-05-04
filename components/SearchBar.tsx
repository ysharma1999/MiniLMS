import React, { useCallback, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChangeText, placeholder = "Search courses..." }: Props): React.JSX.Element {
  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    onChangeText("");
    inputRef.current?.blur();
  }, [onChangeText]);

  return (
    <View className="flex-row items-center bg-dark-800 border border-dark-700 rounded-xl px-4 py-2.5 gap-3">
      <Ionicons name="search" size={18} color="#64748B" />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#475569"
        className="flex-1 text-white text-sm"
        returnKeyType="search"
        accessibilityLabel="Search courses"
        accessibilityHint="Type to filter the course list"
        clearButtonMode="never"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={handleClear}
          accessibilityLabel="Clear search"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close-circle" size={18} color="#475569" />
        </TouchableOpacity>
      )}
    </View>
  );
}
