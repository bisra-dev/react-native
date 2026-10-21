import "@/global.css"
import { Link } from "expo-router";
import { Text, View } from "react-native";
 
export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link href="/onboarding" className="mt-4 rounded bg-primary text-white p-4">Get Started</Link>
      <Link href="/(auth)/SignIn" className="mt-4 rounded bg-primary text-white p-4">Go To Sign In</Link>
      <Link href="/(auth)/SignUp" className="mt-4 rounded bg-primary text-white p-4">Go To Sign Up</Link>

      <Link href="/Subscription/spotify">Spotify Subscription</Link>
      <Link 
      href={{
        pathname: "/Subscription/[id]",
        params: { id: "cloude" }
      }}
      >Apple Music Subscription</Link>
    </View>
  );
}