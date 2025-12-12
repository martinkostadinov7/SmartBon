import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createExpense } from '../../services/expensesService';
import { colors } from '../../theme/colors';
import { useCategories } from '../../hooks/useCategories';
import { Category, PaymentType, Subcategory } from '../../types';

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
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);

  const selectedSubcategories = useMemo(() => selectedCategory?.subcategories ?? [], [selectedCategory]);

  useEffect(() => {
    if (categoryModalVisible && categories.length === 0 && !categoriesLoading && !categoriesError) {
      refreshCategories();
    }
  }, [categoryModalVisible, categories.length, categoriesLoading, categoriesError, refreshCategories]);

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
      <Text style={styles.header}>Add expense</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.input}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <Pressable style={styles.selector} onPress={() => setCategoryModalVisible(true)}>
        <Text style={styles.selectorLabel}>Category</Text>
        <Text style={styles.selectorValue}>
          {selectedCategory ? selectedCategory.name : 'Select a category'}
        </Text>
      </Pressable>

      {selectedSubcategories.length > 0 ? (
        <Pressable
          style={styles.selector}
          onPress={() => setSubcategoryModalVisible(true)}
          disabled={!selectedCategory}
        >
          <Text style={styles.selectorLabel}>Subcategory</Text>
          <Text style={styles.selectorValue}>
            {selectedSubcategory ? selectedSubcategory.name : 'Optional'}
          </Text>
        </Pressable>
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

      <Modal visible={categoryModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <Text style={styles.modalTitle}>Choose a category</Text>
          {categoriesLoading ? (
            <View style={styles.center}>
              <ActivityIndicator />
            </View>
          ) : categoriesError ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>{categoriesError}</Text>
              <TouchableOpacity style={styles.modalClose} onPress={refreshCategories}>
                <Text style={styles.modalCloseText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : categories.length === 0 ? (
            <View style={styles.center}>
              <Text style={styles.errorText}>No categories available</Text>
              <TouchableOpacity style={styles.modalClose} onPress={refreshCategories}>
                <Text style={styles.modalCloseText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.categoriesGrid}>
              {categories.map((cat) => (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    selectedCategory?.id === cat.id && styles.categoryCardActive
                  ]}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setSelectedSubcategory(null);
                    setCategoryModalVisible(false);

                    if (cat.subcategories && cat.subcategories.length > 0) {
                      Alert.alert(
                        'Subcategory',
                        'Do you want to pick a subcategory?',
                        [
                          { text: 'No', style: 'cancel' },
                          {
                            text: 'Yes',
                            onPress: () => setSubcategoryModalVisible(true)
                          }
                        ]
                      );
                    }
                  }}
                >
                  <View style={styles.iconCircle}>
                    {cat.iconType === 'Emoji' ? (
                      <Text style={styles.iconText}>{cat.iconValue || '🙂'}</Text>
                    ) : cat.iconValue ? (
                      <Image
                        source={{ uri: cat.iconValue }}
                        style={styles.iconImage}
                        resizeMode="contain"
                      />
                    ) : (
                      <Text style={styles.iconText}>🔗</Text>
                    )}
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.modalClose} onPress={() => setCategoryModalVisible(false)}>
            <Text style={styles.modalCloseText}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      <Modal visible={subcategoryModalVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <Text style={styles.modalTitle}>Choose a subcategory</Text>
          <ScrollView contentContainerStyle={styles.categoriesGrid}>
            {selectedSubcategories.map((sub) => (
              <Pressable
                key={sub.id}
                style={[
                  styles.categoryCard,
                  selectedSubcategory?.id === sub.id && styles.categoryCardActive
                ]}
                onPress={() => {
                  setSelectedSubcategory(sub);
                  setSubcategoryModalVisible(false);
                }}
              >
                <View style={styles.iconCircle}>
                  {sub.iconType === 'Emoji' ? (
                    <Text style={styles.iconText}>{sub.iconValue || '🙂'}</Text>
                  ) : sub.iconValue ? (
                    <Image
                      source={{ uri: sub.iconValue }}
                      style={styles.iconImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Text style={styles.iconText}>🔗</Text>
                  )}
                </View>
                <Text style={styles.categoryName}>{sub.name}</Text>
              </Pressable>
            ))}
          </ScrollView>

          <TouchableOpacity style={styles.modalClose} onPress={() => {
            setSelectedSubcategory(null);
            setSubcategoryModalVisible(false);
          }}>
            <Text style={styles.modalCloseText}>Skip</Text>
          </TouchableOpacity>
        </SafeAreaView>
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
    fontSize: 12
  },
  selectorValue: {
    marginTop: 6,
    color: colors.text,
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
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: colors.background
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.text
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  categoryCard: {
    width: '47%',
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  categoryCardActive: {
    borderColor: colors.primary
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    marginBottom: 8
  },
  iconText: {
    fontSize: 24
  },
  iconImage: {
    width: 28,
    height: 28
  },
  categoryName: {
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600'
  },
  modalClose: {
    marginTop: 20,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: colors.primary,
    borderRadius: 10
  },
  modalCloseText: {
    color: '#fff',
    fontWeight: '700'
  },
  errorText: {
    color: colors.danger,
    textAlign: 'center'
  }
});
