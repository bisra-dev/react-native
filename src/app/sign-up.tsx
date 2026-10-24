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
import { useAuth, useSignUp } from "@clerk/expo";
import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SignUpScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp, fetchStatus } = useSignUp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [codeError, setCodeError] = useState("");
  const isBusy = fetchStatus === "fetching";

  if (!isLoaded || isSignedIn) return null;

  async function finishSignUp() {
    const { error } = await signUp.finalize();
    if (error) throw error;
    router.replace("/");
  }

  async function handleCreateAccount() {
    const normalizedEmail = normalizeEmail(email);
    const validEmail = isValidEmail(normalizedEmail);
    setEmailError(validEmail ? "" : "Enter a valid email address.");
    setPasswordError(password.length >= 8 ? "" : "Use at least 8 characters.");
    setConfirmError(
      confirmPassword === password ? "" : "Passwords don't match.",
    );
    setFormError("");

    if (!validEmail || password.length < 8 || confirmPassword !== password)
      return;

    try {
      const { error } = await signUp.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) throw error;

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      const { error: verificationError } =
        await signUp.verifications.sendEmailCode();
      if (verificationError) throw verificationError;
      setCodeSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  async function handleVerifyEmail() {
    setFormError("");
    setCodeError(code.trim() ? "" : "Enter the verification code.");
    if (!code.trim()) return;

    try {
      const { error } = await signUp.verifications.verifyEmailCode({
        code: code.trim(),
      });
      if (error) throw error;

      if (signUp.status === "complete") {
        await finishSignUp();
      } else {
        setFormError("One more account detail is required. Please try again.");
      }
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
    }
  }

  async function resendCode() {
    if (isBusy) return;
    setFormError("");
    try {
      const { error } = await signUp.verifications.sendEmailCode();
      if (error) throw error;
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  return (
    <AuthScaffold
      title={codeSent ? "Check your inbox" : "Start saving with Recurly"}
      subtitle={
        codeSent
          ? `We sent a verification code to ${normalizeEmail(email)}.`
          : "One clear place for every subscription and renewal."
      }
      footer={
        <Text className="auth-trust-copy">
          Your subscription details stay private and secure.
        </Text>
      }
    >
      {codeSent ? (
        <View className="auth-form">
          <AuthInlineError message={formError} />
          <AuthField
            label="Email verification code"
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
            label="Verify email"
            onPress={handleVerifyEmail}
            loading={isBusy}
          />
          <View className="auth-link-row">
            <Text className="auth-link-copy">Didn't receive the email?</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled: isBusy }}
              disabled={isBusy}
              hitSlop={8}
              onPress={resendCode}
            >
              <Text className="auth-link">Send again</Text>
            </Pressable>
          </View>
          <Pressable
            accessibilityRole="button"
            className="auth-secondary-button mt-2"
            onPress={() => {
              void signUp.reset();
              setCodeSent(false);
              setCode("");
              setFormError("");
            }}
          >
            <Text className="auth-secondary-button-text">
              Change email address
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="auth-form">
          <AuthInlineError message={formError} />
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
            returnKeyType="next"
          />
          <AuthField
            label="Password"
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              setPasswordError("");
              if (confirmPassword && value !== confirmPassword)
                setConfirmError("Passwords don't match.");
            }}
            error={passwordError}
            placeholder="Create a password"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            autoCapitalize="none"
            trailing={
              <Pressable
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setShowPassword((current) => !current)}
              >
                <Text className="auth-link">
                  {showPassword ? "Hide" : "Show"}
                </Text>
              </Pressable>
            }
            helperText="At least 8 characters"
          />
          <AuthField
            label="Confirm password"
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              setConfirmError("");
            }}
            error={confirmError}
            placeholder="Enter your password again"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="new-password"
            autoCapitalize="none"
            returnKeyType="go"
            onSubmitEditing={() => void handleCreateAccount()}
          />
          <AuthButton
            label="Create account"
            onPress={handleCreateAccount}
            loading={isBusy}
          />
          <View className="auth-link-row">
            <Text className="auth-link-copy">Already have an account?</Text>
            <Link href="/sign-in" asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}
    </AuthScaffold>
  );
}
