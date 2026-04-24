import "@/global.css";
import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function App() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-xl font-bold text-primary">
        Welcome to Nativewind!
      </Text>

      <Link href="/onboarding" className="mt-4 rounded bg-primary px-4 py-2">
        Get Started
      </Link>
      <Link href="/(auth)/sing-in" className="mt-4 rounded bg-primary px-4 py-2">
        Get sing in
      </Link>
      <Link href="/(auth)/sing-up" className="mt-4 rounded bg-primary px-4 py-2">
        Get sing const [first, setfirst] = useState(second)
      </Link>
    </View>
  );
}