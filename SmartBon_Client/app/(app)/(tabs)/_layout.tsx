import { Tabs, useSegments } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTranslation } from "react-i18next";

export default function AppLayout() {
  const segments = useSegments();
const { t, i18n } = useTranslation();

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
      <Tabs.Screen name="home" options={{ title: `${t("home")}` }} />
      <Tabs.Screen name="expenses" options={{ title: `${t("expenses")}` }} />
      <Tabs.Screen name="statistics" options={{ title: `${t("statistics")}` }} />
      <Tabs.Screen name="settings" options={{ title: `${t("settings")}` }} />
      
    </Tabs>
  );
}
