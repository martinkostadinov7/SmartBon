import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  UIManager
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createExpense } from '../../services/expensesService';
import { colors } from '../../theme/colors';
import { useCategories } from '../../hooks/useCategories';
import { Category, PaymentType, Subcategory } from '../../types';
import { IconBadge } from '../../components/IconBadge';
import { createCategory, createSubcategory } from '../../services/categoryService';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function AddExpenseScreen() {
  const {
    items: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refresh: refreshCategories
  } = useCategories();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('Cash');
  const [saving, setSaving] = useState(false);
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [subcategorySheetVisible, setSubcategorySheetVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍔');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('🧾');
  const [creatingSub, setCreatingSub] = useState(false);

  const selectedSubcategories = useMemo(() => selectedCategory?.subcategories ?? [], [selectedCategory]);

  useEffect(() => {
    if (categories.length === 0 && !categoriesLoading && !categoriesError) {
      refreshCategories();
    }
  }, [categories.length, categoriesLoading, categoriesError, refreshCategories]);

  const emojiChoices = ['🍔', '💳', '🧾', '🛒', '🚗', '📚', '🏠', '☕'];

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const created = await createCategory({
        name: newCategoryName.trim(),
        iconType: 'Emoji',
        iconValue: newCategoryIcon
      });
      await refreshCategories();
      setSelectedCategory(created);
      setSelectedSubcategory(null);
      setCategorySheetVisible(false);
      setNewCategoryName('');
      setNewCategoryIcon('🍔');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not create category');
    } finally {
      setCreatingCategory(false);
    }
  };

  const handleCreateSubcategory = async () => {
    if (!selectedCategory || !newSubName.trim()) return;
    setCreatingSub(true);
    try {
      await createSubcategory(selectedCategory.id, {
        name: newSubName.trim(),
        iconType: 'Emoji',
        iconValue: newSubIcon
      });
      await refreshCategories();
      setSubcategorySheetVisible(false);
      setNewSubName('');
      setNewSubIcon('🧾');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not create subcategory');
    } finally {
      setCreatingSub(false);
    }
  };

  const handleSave = async () => {
    const normalizedAmount = Number((amount || '').replace(',', '.'));

    if (!title || !amount || !selectedCategory || Number.isNaN(normalizedAmount)) {
      Alert.alert('Missing info', 'Please provide a title, numeric amount, and category');
      return;
    }

    setSaving(true);

    try {
      await createExpense({
        title,
        description: description || undefined,
        cost: normalizedAmount,
        categoryId: selectedCategory.id,
        subcategoryId: selectedSubcategory?.id,
        expenseDate: new Date().toISOString(),
        paymentType
      });

      Alert.alert('Saved', 'Expense added successfully');
      setTitle('');
      setDescription('');
      setAmount('');
      setSelectedCategory(null);
      setSelectedSubcategory(null);
      setPaymentType('Cash');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Could not save expense');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.header}>Add expense</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.fieldLabel}>Title</Text>
      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.fieldLabel}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.selectorLabel}>Category</Text>
      <View style={styles.listContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
        >
          {categoriesLoading ? (
            <View style={styles.centerRow}>
              <ActivityIndicator />
            </View>
          ) : categoriesError ? (
            <TouchableOpacity style={styles.retryCard} onPress={refreshCategories}>
              <Text style={styles.errorText}>{categoriesError}</Text>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          ) : categories.length === 0 ? (
            <TouchableOpacity style={styles.retryCard} onPress={refreshCategories}>
              <Text style={styles.errorText}>No categories</Text>
              <Text style={styles.retryText}>Refresh</Text>
            </TouchableOpacity>
          ) : (
            <>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    selectedCategory?.id === cat.id && styles.categoryChipActive
                  ]}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setSelectedCategory(cat);
                    setSelectedSubcategory(null);
                  }}
                >
                  <IconBadge
                    iconType={cat.iconType}
                    iconValue={cat.iconValue}
                    size={48}
                    style={{ marginBottom: 6 }}
                  />
                  <Text style={styles.categoryLabel}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.categoryChip, styles.addChip]}
                onPress={() => setCategorySheetVisible(true)}
              >
                <Ionicons name="add" size={24} color={colors.text} />
                <Text style={styles.addLabel}>Add</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>

      {selectedSubcategories.length > 0 ? (
        <>
          <Text style={[styles.selectorLabel, { marginTop: 8 }]}>Subcategory</Text>
          <View style={styles.listContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalList}
          >
            {selectedSubcategories.map((sub) => (
              <TouchableOpacity
                key={sub.id}
                style={[
                  styles.subcategoryChip,
                  selectedSubcategory?.id === sub.id && styles.categoryChipActive
                ]}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setSelectedSubcategory(sub);
                }}
              >
                <IconBadge
                  iconType={sub.iconType}
                  iconValue={sub.iconValue}
                  size={36}
                  style={{ marginBottom: 4 }}
                />
                <Text style={styles.subcategoryLabel}>{sub.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.subcategoryChip, styles.addChip]}
              onPress={() => {
                if (!selectedCategory) {
                  Alert.alert('Pick a category first');
                  return;
                }
                setSubcategorySheetVisible(true);
              }}
            >
              <Ionicons name="add" size={20} color={colors.text} />
              <Text style={styles.addLabel}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </>
      ) : null}

      <View style={styles.paymentRow}>
        {(['Cash', 'DebitCard', 'CreditCard', 'Bank_Transfer'] as PaymentType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.paymentPill, paymentType === type && styles.paymentPillActive]}
            onPress={() => setPaymentType(type)}
          >
            <Text
              style={[
                styles.paymentPillText,
                paymentType === type && styles.paymentPillTextActive
              ]}
            >
              {type.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save'}</Text>
      </TouchableOpacity>

      <Modal
        visible={categorySheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCategorySheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New category</Text>
              <TouchableOpacity onPress={() => setCategorySheetVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Category name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
            />
            <Text style={styles.fieldLabel}>Icon (emoji)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {emojiChoices.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    newCategoryIcon === emoji && styles.emojiOptionActive
                  ]}
                  onPress={() => setNewCategoryIcon(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, { marginTop: 8 }]}
              onPress={handleCreateCategory}
              disabled={creatingCategory}
            >
              <Text style={styles.buttonText}>{creatingCategory ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={subcategorySheetVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSubcategorySheetVisible(false)}
      >
        <View style={styles.sheetOverlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>New subcategory</Text>
              <TouchableOpacity onPress={() => setSubcategorySheetVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <Text style={styles.fieldLabel}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Subcategory name"
              value={newSubName}
              onChangeText={setNewSubName}
            />
            <Text style={styles.fieldLabel}>Icon (emoji)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
              {emojiChoices.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.emojiOption,
                    newSubIcon === emoji && styles.emojiOptionActive
                  ]}
                  onPress={() => setNewSubIcon(emoji)}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.button, { marginTop: 8 }]}
              onPress={handleCreateSubcategory}
              disabled={creatingSub}
            >
              <Text style={styles.buttonText}>{creatingSub ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
    justifyContent: 'space-between'
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700'
  },
  selector: {
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 12
  },
  selectorLabel: {
    color: colors.muted,
    fontSize: 12,
    marginBottom: 8
  },
  fieldLabel: {
    color: colors.muted,
    fontSize: 13,
    marginTop: 8,
    marginBottom: 4,
    fontWeight: '600'
  },
  paymentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16
  },
  paymentPill: {
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  paymentPillActive: {
    backgroundColor: colors.primary
  },
  paymentPillText: {
    color: colors.text,
    fontWeight: '600'
  },
  paymentPillTextActive: {
    color: '#fff'
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center'
  },
  horizontalList: {
    gap: 12,
    marginBottom: 12
  },
  listContainer: {
    marginBottom: 0
  },
  categoryChip: {
    width: 110,
    height: 110,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  subcategoryChip: {
    width: 90,
    height: 90,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4
  },
  categoryChipActive: {
    borderColor: colors.primary
  },
  categoryLabel: {
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600',
    fontSize: 14
  },
  subcategoryLabel: {
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600',
    fontSize: 13
  },
  retryCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderColor: colors.border,
    borderWidth: 1,
    backgroundColor: colors.card,
    justifyContent: 'center'
  },
  retryText: {
    color: colors.primary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '600'
  },
  centerRow: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  addChip: {
    borderStyle: 'dashed'
  },
  addLabel: {
    marginTop: 6,
    fontWeight: '700',
    color: colors.text
  },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'flex-end'
  },
  sheet: {
    backgroundColor: colors.card,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    minHeight: '45%'
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  emojiOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center'
  },
  emojiOptionActive: {
    borderColor: colors.primary,
    backgroundColor: '#EFF6FF'
  },
  emojiText: {
    fontSize: 20
  }
});
  const [categorySheetVisible, setCategorySheetVisible] = useState(false);
  const [subcategorySheetVisible, setSubcategorySheetVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('🍔');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubIcon, setNewSubIcon] = useState('🧾');
  const [creatingSub, setCreatingSub] = useState(false);
