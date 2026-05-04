import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";

export default function Index(): React.JSX.Element {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Redirect href={isAuthenticated ? "/(tabs)" : "/(auth)/login"} />;
}
