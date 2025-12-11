import { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { Stack, router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function AppLayout() {
  const { status, processing } = useAuth();

  useEffect(() => {
    if (status === 'unauthenticated' && !processing) {
      router.replace('/');
    }
  }, [status, processing]);

  if (status === 'checking') {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false
      }}
    />
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});
