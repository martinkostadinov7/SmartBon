import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Tabs group */}
            <Stack.Screen name="(app)" options={{ headerShown: false }} />

            <Stack.Screen
              name="(modals)"
              options={{ presentation: "transparentModal", headerShown: false }}
            />
          </Stack>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
