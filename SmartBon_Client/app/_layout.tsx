import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CategoriesProvider } from "./context/CategoriesContext";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <CategoriesProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Tabs group */}
            <Stack.Screen name="(app)" options={{ headerShown: false }} />

            <Stack.Screen
              name="(modals)"
              options={{ presentation: "transparentModal", headerShown: false }}
            />
          </Stack>
        </CategoriesProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
