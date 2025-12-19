import { Stack } from 'expo-router';
import { CategoriesProvider } from "./context/CategoriesContext";

export default function Layout() {
  return (
     <CategoriesProvider>
      <Stack 
        screenOptions={{
          headerShown: false
        }}
      />
    </CategoriesProvider>
  );
}