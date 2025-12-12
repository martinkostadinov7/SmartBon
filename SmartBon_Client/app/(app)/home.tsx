import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { token, signOut } = useAuth();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>SmartBon</Text>
          <Text style={styles.subtitle}>Your expenses at a glance.</Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/expenses/add')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {token ? (
        <View style={styles.actionsRow}>
          <Text style={styles.helper}>Signed in</Text>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign out</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'flex-start'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    marginTop: 8,
    color: colors.muted,
    fontSize: 16
  },
  helper: {
    color: colors.primary,
    fontWeight: '600'
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700'
  },
  actionsRow: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  signOutButton: {
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.card
  },
  signOutText: {
    color: colors.text,
    fontWeight: '700'
  }
});
