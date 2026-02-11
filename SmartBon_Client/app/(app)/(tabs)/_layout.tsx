import { Tabs, useSegments } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

export default function AppLayout() {
  const segments = useSegments();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof FontAwesome6.glyphMap;

          switch (route.name) {
            case "home":
              iconName = "house";
              break;
            case "expenses":
              iconName = "receipt";
              break;
            case "statistics":
              iconName = "chart-pie";
              break;
            case "settings":
            iconName = "user-gear";
            break;
            default:
              iconName = "receipt";
          }

          return <FontAwesome6 name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: "Home" }} />
      <Tabs.Screen name="expenses" options={{ title: "Expenses" }} />
      <Tabs.Screen name="statistics" options={{ title: "Statistics" }} />
      <Tabs.Screen name="settings" options={{ title: "Settings" }} />
      
    </Tabs>
  );
}
