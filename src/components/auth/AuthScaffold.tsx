import clsx from "clsx";
import { styled } from "nativewind";
import type { ReactNode } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    type TextInputProps,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

type AuthScaffoldProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthScaffold({
  title,
  subtitle,
  children,
  footer,
}: AuthScaffoldProps) {
  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurly</Text>
                <Text className="auth-wordmark-sub">SMART BILLING</Text>
              </View>
            </View>
            <Text accessibilityRole="header" className="auth-title">
              {title}
            </Text>
            <Text className="auth-subtitle">{subtitle}</Text>
          </View>
          <View className="auth-card">{children}</View>
          {footer ? <View className="auth-screen-footer">{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type AuthFieldProps = TextInputProps & {
  label: string;
  error?: string;
  helperText?: string;
  trailing?: ReactNode;
};

export function AuthField({
  label,
  error,
  helperText,
  trailing,
  ...inputProps
}: AuthFieldProps) {
  return (
    <View className="auth-field">
      <View className="flex-row items-center justify-between">
        <Text className="auth-label">{label}</Text>
        {trailing}
      </View>
      <TextInput
        accessibilityLabel={label}
        className={clsx("auth-input", error && "auth-input-error")}
        placeholderTextColor="#79766c"
        selectionColor="#ea7a53"
        {...inputProps}
      />
      {helperText && !error ? (
        <Text className="auth-helper">{helperText}</Text>
      ) : null}
      {error ? (
        <Text accessibilityRole="alert" className="auth-error">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function AuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: AuthButtonProps) {
  const unavailable = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      className={clsx("auth-button", unavailable && "auth-button-disabled")}
      disabled={unavailable}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color="#081126" />
      ) : (
        <Text className="auth-button-text">{label}</Text>
      )}
    </Pressable>
  );
}

export function AuthInlineError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <View accessibilityRole="alert" className="auth-error-banner">
      <Text className="auth-error">{message}</Text>
    </View>
  );
}

export function AuthTextLink({
  children,
  onPress,
}: {
  children: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" hitSlop={8} onPress={onPress}>
      <Text className="auth-link">{children}</Text>
    </Pressable>
  );
}
