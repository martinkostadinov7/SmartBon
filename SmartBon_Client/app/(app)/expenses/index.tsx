import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fetchExpenses } from '../../services/expensesService';
import { Expense } from '../../types';
import { colors } from '../../theme/colors';
import { router } from 'expo-router';
import { useCategories } from '../../hooks/useCategories';
import { IconBadge } from '../../components/IconBadge';

export default function ExpensesScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Expense[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { items: categories } = useCategories();

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Invalid date';

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

  const sections = useMemo(() => {
    const groups: Record<string, { label: string; total: number; items: Expense[] }> = {};

    items.forEach((item) => {
      const label = formatDate(item.expenseDate);
      const key = item.expenseDate.split('T')[0] || label;

      if (!groups[key]) {
        groups[key] = { label, total: 0, items: [] };
      }

      groups[key].items.push(item);
      groups[key].total += item.cost;
    });

    return Object.entries(groups)
      .sort(([a], [b]) => (a > b ? -1 : 1))
      .map(([, value]) => ({
        title: value.label,
        total: value.total,
        data: value.items
      }));
  }, [items, formatDate]);

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
        <Text style={styles.header}>Expenses</Text>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => String(item.id)}
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionTotal}>${section.total.toFixed(2)}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/expenses/${item.id}`)}
          >
            <IconBadge
              iconType={getCategoryInfo(item).categoryIconType || 'FontAwesome'}
              iconValue={getCategoryInfo(item).categoryIconValue || 'credit-card'}
            />
            <View style={styles.expenseText}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{getCategoryInfo(item).categoryName}</Text>
                {getCategoryInfo(item).subcategoryName ? (
                  <View style={styles.subPill}>
                    <IconBadge
                      iconType={getCategoryInfo(item).subcategoryIconType || 'Emoji'}
                      iconValue={getCategoryInfo(item).subcategoryIconValue || '•'}
                      size={22}
                      style={{ marginBottom: 0 }}
                    />
                    <Text style={styles.subText}>{getCategoryInfo(item).subcategoryName}</Text>
                  </View>
                ) : null}
              </View>
            </View>
            <View style={styles.amountColumn}>
              <Text style={styles.amount}>${item.cost.toFixed(2)}</Text>
            </View>
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        SectionSeparatorComponent={() => <View style={styles.sectionGap} />}
        ListEmptyComponent={<Text style={styles.muted}>No expenses yet</Text>}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() =>
          router.push({
            pathname: '/expenses/add',
            params: { returnTo: '/expenses' }
          })
        }
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 6,
    paddingHorizontal: 4
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text
  },
  sectionTotal: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.muted
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4
  },
  fabText: {
    color: '#fff',
    fontSize: 30,
    marginTop: -2,
    fontWeight: '700'
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  expenseText: {
    flex: 1,
    marginHorizontal: 12
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4
  },
  meta: {
    color: colors.muted,
    fontSize: 13
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: '#EEF2FF'
  },
  subText: {
    marginLeft: 2,
    color: colors.text,
    fontSize: 12,
    fontWeight: '600'
  },
  amountColumn: {
    alignItems: 'flex-end'
  },
  amount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626'
  },
  date: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 12
  },
  separator: {
    height: 10
  },
  sectionGap: {
    height: 6
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
