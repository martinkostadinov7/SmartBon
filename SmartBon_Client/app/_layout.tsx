import { Stack } from 'expo-router';
import { AuthProvider } from './providers/AuthProvider';
import { CategoriesProvider } from './providers/CategoriesProvider';

export default function Layout() {
  return (
    <AuthProvider>
      <CategoriesProvider>
        <Stack
          screenOptions={{
            headerShown: false
          }}
        />
      </CategoriesProvider>
    </AuthProvider>
  );
}
