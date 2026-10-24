import {
    AuthButton,
    AuthField,
    AuthInlineError,
    AuthScaffold,
} from "@/components/auth/AuthScaffold";
import {
    getAuthErrorMessage,
    isValidEmail,
    normalizeEmail,
} from "@/lib/auth-errors";
import { useAuth, useSignIn } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [codeError, setCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const isBusy = fetchStatus === "fetching";

  if (!isLoaded || isSignedIn) return null;

  async function sendResetCode() {
    if (isBusy) return;
    const normalizedEmail = normalizeEmail(email);
    const validEmail = isValidEmail(normalizedEmail);
    setEmailError(validEmail ? "" : "Enter a valid email address.");
    setFormError("");
    if (!validEmail) return;

    try {
      const { error: createError } = await signIn.create({
        identifier: normalizedEmail,
      });
      if (createError) throw createError;
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) throw error;
      setCodeSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  async function verifyResetCode() {
    setCodeError(code.trim() ? "" : "Enter the reset code.");
    setFormError("");
    if (!code.trim()) return;

    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code: code.trim(),
      });
      if (error) throw error;
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
    }
  }

  async function saveNewPassword() {
    setPasswordError(password.length >= 8 ? "" : "Use at least 8 characters.");
    setConfirmError(
      confirmPassword === password ? "" : "Passwords don't match.",
    );
    setFormError("");
    if (password.length < 8 || confirmPassword !== password) return;

    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
        signOutOfOtherSessions: true,
      });
      if (error) throw error;

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();
        if (finalizeError) throw finalizeError;
        router.replace("/");
      } else {
        setFormError(
          "Your password was updated, but sign-in needs another step. Please sign in again.",
        );
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  const needsNewPassword = signIn.status === "needs_new_password";
  const title = needsNewPassword
    ? "Choose a new password"
    : codeSent
      ? "Check your inbox"
      : "Reset your password";
  const subtitle = needsNewPassword
    ? "Use a strong password you haven't used here before."
    : codeSent
      ? `Enter the reset code sent to ${normalizeEmail(email)}.`
      : "We'll email you a code to securely reset your password.";

  return (
    <AuthScaffold
      title={title}
      subtitle={subtitle}
      footer={
        <Text className="auth-trust-copy">
          For your security, other signed-in devices will be signed out.
        </Text>
      }
    >
      <View className="auth-form">
        <AuthInlineError message={formError} />
        {needsNewPassword ? (
          <>
            <AuthField
              label="New password"
              value={password}
              onChangeText={(value) => {
                setPassword(value);
                setPasswordError("");
                if (confirmPassword && value !== confirmPassword)
                  setConfirmError("Passwords don't match.");
              }}
              error={passwordError}
              placeholder="Create a new password"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              autoCapitalize="none"
              helperText="At least 8 characters"
            />
            <AuthField
              label="Confirm new password"
              value={confirmPassword}
              onChangeText={(value) => {
                setConfirmPassword(value);
                setConfirmError("");
              }}
              error={confirmError}
              placeholder="Enter your new password again"
              secureTextEntry
              textContentType="newPassword"
              autoComplete="new-password"
              autoCapitalize="none"
              returnKeyType="go"
              onSubmitEditing={() => void saveNewPassword()}
            />
            <AuthButton
              label="Save new password"
              onPress={saveNewPassword}
              loading={isBusy}
            />
          </>
        ) : codeSent ? (
          <>
            <AuthField
              label="Password reset code"
              value={code}
              onChangeText={(value) => {
                setCode(value.replace(/\s/g, ""));
                setCodeError("");
              }}
              error={codeError}
              placeholder="Enter your code"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              autoCapitalize="characters"
              maxLength={12}
            />
            <AuthButton
              label="Verify code"
              onPress={verifyResetCode}
              loading={isBusy}
            />
            <View className="auth-link-row">
              <Text className="auth-link-copy">Didn't receive the email?</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: isBusy }}
                disabled={isBusy}
                hitSlop={8}
                onPress={sendResetCode}
              >
                <Text className="auth-link">Send again</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <AuthField
              label="Email"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setEmailError("");
              }}
              onBlur={() => {
                if (email && !isValidEmail(email))
                  setEmailError("Enter a valid email address.");
              }}
              error={emailError}
              placeholder="Enter your email"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="go"
              onSubmitEditing={() => void sendResetCode()}
            />
            <AuthButton
              label="Send reset code"
              onPress={sendResetCode}
              loading={isBusy}
            />
          </>
        )}
        <View className="auth-link-row">
          <Text className="auth-link-copy">Remember your password?</Text>
          <Link href="/sign-in" asChild>
            <Pressable accessibilityRole="link" hitSlop={8}>
              <Text className="auth-link">Back to sign in</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </AuthScaffold>
  );
}
