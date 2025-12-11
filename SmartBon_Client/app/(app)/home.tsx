import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';

export default function HomeScreen() {
  const { token } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SmartBon</Text>
      <Text style={styles.subtitle}>Your expenses at a glance.</Text>
      {token ? <Text style={styles.helper}>Token loaded</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: 'center'
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
    marginTop: 24,
    color: colors.primary,
    fontWeight: '600'
  }
});
