import {
    AuthButton,
    AuthField,
    AuthInlineError,
    AuthScaffold,
    AuthTextLink,
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

type MfaStrategy = "email_code" | "phone_code" | "totp" | "backup_code";

export default function SignInScreen() {
  const { isLoaded, isSignedIn } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mfaStrategy, setMfaStrategy] = useState<MfaStrategy | null>(null);
  const [formError, setFormError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [codeError, setCodeError] = useState("");
  const isBusy = fetchStatus === "fetching";

  if (!isLoaded || isSignedIn) return null;

  async function finishSignIn() {
    const { error } = await signIn.finalize();
    if (error) throw error;
    router.replace("/");
  }

  async function handleSignIn() {
    const normalizedEmail = normalizeEmail(email);
    const validEmail = isValidEmail(normalizedEmail);
    setEmailError(validEmail ? "" : "Enter a valid email address.");
    setPasswordError(password ? "" : "Enter your password.");
    setFormError("");
    setCodeError("");
    if (!validEmail || !password) return;

    try {
      const { error } = await signIn.password({
        emailAddress: normalizedEmail,
        password,
      });
      if (error) throw error;

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      if (signIn.status === "needs_client_trust") {
        const { error: verificationError } = await signIn.mfa.sendEmailCode();
        if (verificationError) throw verificationError;
        setMfaStrategy("email_code");
        return;
      }

      if (signIn.status === "needs_second_factor") {
        const strategies = signIn.supportedSecondFactors.map(
          (factor) => factor.strategy,
        );
        const nextStrategy = (
          ["email_code", "phone_code", "totp", "backup_code"] as const
        ).find((strategy) => strategies.includes(strategy));

        if (!nextStrategy) {
          setFormError(
            "This account requires a verification method that isn't available here.",
          );
          return;
        }

        if (nextStrategy === "email_code") {
          const { error: verificationError } = await signIn.mfa.sendEmailCode();
          if (verificationError) throw verificationError;
        }
        if (nextStrategy === "phone_code") {
          const { error: verificationError } = await signIn.mfa.sendPhoneCode();
          if (verificationError) throw verificationError;
        }
        setMfaStrategy(nextStrategy);
        return;
      }

      setFormError(
        "We couldn't start your sign-in. Check your details and try again.",
      );
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  async function handleVerify() {
    setFormError("");
    setCodeError(code.trim() ? "" : "Enter the verification code.");
    if (!code.trim() || !mfaStrategy) return;

    try {
      let error: unknown = null;
      if (mfaStrategy === "email_code")
        ({ error } = await signIn.mfa.verifyEmailCode({ code: code.trim() }));
      if (mfaStrategy === "phone_code")
        ({ error } = await signIn.mfa.verifyPhoneCode({ code: code.trim() }));
      if (mfaStrategy === "totp")
        ({ error } = await signIn.mfa.verifyTOTP({ code: code.trim() }));
      if (mfaStrategy === "backup_code")
        ({ error } = await signIn.mfa.verifyBackupCode({ code: code.trim() }));
      if (error) throw error;

      if (signIn.status === "complete") {
        await finishSignIn();
      } else {
        setFormError(
          "That code didn't finish sign-in. Try another code or start again.",
        );
      }
    } catch (error) {
      setCodeError(getAuthErrorMessage(error));
    }
  }

  async function resendCode() {
    if (isBusy || !mfaStrategy) return;
    setFormError("");
    try {
      if (mfaStrategy === "email_code") {
        const { error } = await signIn.mfa.sendEmailCode();
        if (error) throw error;
      }
      if (mfaStrategy === "phone_code") {
        const { error } = await signIn.mfa.sendPhoneCode();
        if (error) throw error;
      }
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  const isVerifying =
    signIn.status === "needs_client_trust" ||
    signIn.status === "needs_second_factor";
  const verificationDescription =
    mfaStrategy === "totp"
      ? "Enter the code from your authenticator app."
      : mfaStrategy === "backup_code"
        ? "Enter one of your saved backup codes."
        : mfaStrategy === "phone_code"
          ? "Enter the code sent to your phone."
          : "Enter the code we sent to your email.";

  return (
    <AuthScaffold
      title={isVerifying ? "Verify it's you" : "Welcome back"}
      subtitle={
        isVerifying
          ? verificationDescription
          : "Sign in to keep every recurring bill in view."
      }
      footer={
        <Text className="auth-trust-copy">
          Private by design. Your account details stay protected.
        </Text>
      }
    >
      {isVerifying ? (
        <View className="auth-form">
          <AuthInlineError message={formError} />
          <AuthField
            label="Verification code"
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
            label="Verify and continue"
            onPress={handleVerify}
            loading={isBusy}
          />
          {(mfaStrategy === "email_code" || mfaStrategy === "phone_code") && (
            <View className="auth-link-row">
              <Text className="auth-link-copy">Didn't receive a code?</Text>
              <AuthTextLink onPress={resendCode}>Send again</AuthTextLink>
            </View>
          )}
          <Pressable
            accessibilityRole="button"
            className="auth-secondary-button mt-2"
            onPress={() => {
              void signIn.reset();
              setMfaStrategy(null);
              setCode("");
              setFormError("");
            }}
          >
            <Text className="auth-secondary-button-text">Back to sign in</Text>
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
            }}
            error={passwordError}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="current-password"
            autoCapitalize="none"
            trailing={
              <AuthTextLink
                onPress={() => setShowPassword((current) => !current)}
              >
                {showPassword ? "Hide" : "Show"}
              </AuthTextLink>
            }
            returnKeyType="go"
            onSubmitEditing={() => void handleSignIn()}
          />
          <View className="auth-forgot-row">
            <Link href="/forgot-password" asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text className="auth-link">Forgot password?</Text>
              </Pressable>
            </Link>
          </View>
          <AuthButton label="Sign in" onPress={handleSignIn} loading={isBusy} />
          <View className="auth-link-row">
            <Text className="auth-link-copy">New to Recurly?</Text>
            <Link href="/sign-up" asChild>
              <Pressable accessibilityRole="link" hitSlop={8}>
                <Text className="auth-link">Create an account</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      )}
    </AuthScaffold>
  );
}
