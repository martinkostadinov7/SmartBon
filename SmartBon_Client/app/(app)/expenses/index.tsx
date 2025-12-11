import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { fetchExpenses } from '../../services/expensesService';
import { Expense } from '../../types';
import { colors } from '../../theme/colors';

export default function ExpensesScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchExpenses();
        setItems(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Recent expenses</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.amount}>${item.amount.toFixed(2)}</Text>
            <Text style={styles.meta}>{item.category} • {new Date(item.date).toLocaleDateString()}</Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.muted}>No expenses yet</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text
  },
  amount: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary
  },
  meta: {
    marginTop: 4,
    color: colors.muted
  },
  separator: {
    height: 10
  },
  muted: {
    color: colors.muted
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  error: {
    color: colors.danger,
    textAlign: 'center'
  }
});
