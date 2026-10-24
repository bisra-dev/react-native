import { useClerk, useUser } from "@clerk/expo";
import { styled } from "nativewind";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");

  async function handleSignOut() {
    if (isSigningOut) return;
    setIsSigningOut(true);
    setSignOutError("");
    try {
      await signOut();
    } catch {
      setSignOutError(
        "Couldn't sign out. Check your connection and try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="list-title">Settings</Text>
      <View className="settings-account-card">
        <Text className="settings-account-label">Signed in as</Text>
        <Text className="settings-account-value" numberOfLines={2}>
          {user?.primaryEmailAddress?.emailAddress ?? "Your Recurly account"}
        </Text>
        {signOutError ? (
          <Text accessibilityRole="alert" className="auth-error mt-3">
            {signOutError}
          </Text>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
          className="settings-signout"
          disabled={isSigningOut}
          onPress={() => void handleSignOut()}
        >
          <Text className="settings-signout-text">
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default Settings;
