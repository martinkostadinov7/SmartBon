import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { useAuth } from '../hooks/useAuth';
import { useCategories } from '../hooks/useCategories';
import { router } from 'expo-router';
import { fetchRecentExpenses } from '../services/expensesService';
import { Expense } from '../types';
import { IconBadge } from '../components/IconBadge';

export default function HomeScreen() {
  const { token, signOut } = useAuth();
  const { items: categories } = useCategories();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRecentExpenses(15);
        setExpenses(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to load expenses');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const getCategoryInfo = (expense: Expense) => {
    const category = categories.find((c) => c.id === expense.categoryId);
    const subcategory = category?.subcategories?.find((s) => s.id === expense.subcategoryId);
    return {
      categoryName: category?.name ?? 'Category',
      categoryIconType: category?.iconType,
      categoryIconValue: category?.iconValue,
      subcategoryName: subcategory?.name,
      subcategoryIconType: subcategory?.iconType,
      subcategoryIconValue: subcategory?.iconValue
    };
  };

  const formatDate = (value: string) => {
    const date = new Date(value);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>SmartBon</Text>
          <Text style={styles.subtitle}>Your expenses at a glance.</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() =>
            router.push({
              pathname: '/expenses/add',
              params: { returnTo: '/home' }
            })
          }
        >
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

      <View style={styles.listHeader}>
        <Text style={styles.sectionTitle}>Recent expenses</Text>
      </View>

      {loading ? (
        <Text style={styles.muted}>Loading...</Text>
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          showsVerticalScrollIndicator={false}
          data={expenses}
          keyExtractor={(item) => String(item.id)}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={({ item }) => {
            const info = getCategoryInfo(item);
            return (
              <Pressable
                style={styles.expenseRow}
                onPress={() => router.push(`/expenses/${item.id}`)}
              >
                <IconBadge
                  iconType={info.categoryIconType || 'FontAwesome'}
                  iconValue={info.categoryIconValue || 'credit-card'}
                />
                <View style={styles.expenseText}>
                  <Text style={styles.expenseTitle}>{item.title}</Text>
                  <View style={styles.expenseMetaRow}>
                    <Text style={styles.expenseCategory}>{info.categoryName}</Text>
                    {info.subcategoryName ? (
                      <View style={styles.subcategoryPill}>
                        <IconBadge
                          iconType={info.subcategoryIconType || 'Emoji'}
                          iconValue={info.subcategoryIconValue || '•'}
                          size={22}
                          style={{ marginBottom: 0 }}
                    />
                    <Text style={styles.subcategoryText}>{info.subcategoryName}</Text>
                  </View>
                ) : null}
              </View>
                </View>
                <View style={styles.expenseAmountColumn}>
                  <Text style={styles.expenseAmount}>${item.cost.toFixed(2)}</Text>
                  <Text style={styles.expenseDate}>{formatDate(item.expenseDate)}</Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
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
  },
  listHeader: {
    marginTop: 16,
    marginBottom: 8
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  muted: {
    color: colors.muted
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12
  },
  expenseText: {
    flex: 1,
    marginHorizontal: 12
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  expenseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  expenseCategory: {
    color: colors.muted,
    fontSize: 13
  },
  subcategoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#EEF2FF'
  },
  subcategoryText: {
    marginLeft: 2,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600'
  },
  expenseAmountColumn: {
    alignItems: 'flex-end'
  },
  expenseAmount: {
    color: '#DC2626',
    fontWeight: '800'
  },
  expenseDate: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12
  },
  separator: {
    height: 10
  },
  error: {
    color: colors.danger
  }
});
