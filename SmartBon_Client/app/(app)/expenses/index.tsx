import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchExpenses } from '../../services/expensesService';
import { Expense } from '../../types';
import { colors } from '../../theme/colors';
import { router } from 'expo-router';

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
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Recent expenses</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/expenses/add')}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.amount}>${item.cost.toFixed(2)}</Text>
            <Text style={styles.meta}>
              {item.categoryName ?? 'Category'} • {new Date(item.date).toLocaleDateString()}
            </Text>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={<Text style={styles.muted}>No expenses yet</Text>}
      />
    </SafeAreaView>
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
    color: colors.text
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700'
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
