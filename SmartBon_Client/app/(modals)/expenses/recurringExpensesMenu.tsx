import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../../services/api';
import { Currency, Expense } from '../../../types/expense';
import { ExpenseCard } from '../../../components/expense';
import { RecurringExpense } from '../../../types/recurringExpense';
import { Category } from '../../../types/category';
import { useTranslation } from 'react-i18next';

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

const frequencyFromNumber: Record<number, string> = {
  0: "Daily",
  1: "Weekly",
  2: "Monthly",
  3: "Yearly"
};

export default function ChangeCategory() {
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([]);
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("EUR");
        const [categories, setCategories] = useState<Category[]>([]);
const { t, i18n } = useTranslation();
      const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: currencyCode, // Тук подаваш директно "EUR", "BGN" или "USD"
  }).format(amount);
};
const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "";

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  return date.toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    // Only show year if it's not the current year
    year: dateYear !== currentYear ? 'numeric' : undefined 
  });
};


  function handleRecurringExpenseView(id: number){
    router.push(`/(modals)/expenses/recurring/${id}`);
  }

  async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error(`${t("error_occured")}`);
    const data = await response.json();
    setCategories(data);
}

    useFocusEffect(
      useCallback(() => {
        const fetchRecurringExpenses = async () => {
          try {

            loadCategories();
            const response = await apiFetch(`/expenses/recurring`);
            if (!response.ok) throw new Error(`${t('error_occured')}`);
            const data = await response.json()
            setRecurringExpenses(data);

            const userResponse = await apiFetch(`/Users/me`);
            if (!userResponse.ok) throw new Error(`${t('error_occured')}`);
            const profileData = await userResponse.json();
            const currencyStr = currencyFromNumber[profileData.defaultCurrency];
            setUserDefaultCurrency(currencyStr);
            
          } catch (error) {
            console.error(error);
          }
        };
    
        fetchRecurringExpenses();
        return () => {}; 
      }, []) 
    );
    function handleCloseScreen(){
           router.back();
       }
              
  return (
  <>
        <Pressable style={styles.overlay} onPress={handleCloseScreen}>
        <KeyboardAvoidingView
            style={styles.wrapper}
        >
            <Pressable style={[styles.container]} onPress={() => {}}>
                {recurringExpenses.length <= 0 && (<Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ color: '#999', fontStyle: 'italic' }}>{t('no_recurring_expenses')}</Text>)}
                <ScrollView>
                    {recurringExpenses.map(expense => {
                        const category = categories.find(c => c.id === expense.categoryId);
                        const subcategory = categories
                        .find(c => c.id === expense.categoryId)
                        ?.subcategories.find(sc => sc.id === expense.subcategoryId);
                        return (
                        <ExpenseCard
                            key={expense.id}
                            title={expense.title}
                            amount={formatCost(expense.cost, currencyFromNumber[expense.currency])}
                            date={String(expense.expenseDate)}
                            recurringFrequency={frequencyFromNumber[expense?.frequency]}
                            categoryName= {t(category?.name ?? "Unknown")}
                            categoryEmoji={category?.icon ?? "❌"}
                            categoryColor={category?.colorHex ?? "x"}
                            subcategoryEmoji={subcategory?.icon}
                            subcategoryText={subcategory?.name}
                            subcategoryColor={subcategory?.colorHex ?? "#ff7575"}
                            onPress={() => handleRecurringExpenseView(expense.id)}
                        />
                        );
                    })
                    }
                </ScrollView>
            </Pressable>
        </KeyboardAvoidingView>
        </Pressable>
    </>
  )
}


const styles = StyleSheet.create({
    buttonPicker: {
    marginHorizontal: 15,
    marginBottom: 10,
    flex: 1, // Прави всички бутони с еднаква ширина
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  activeButton: {
    backgroundColor: '#f5f5f5', // Бял фон за активния елемент
    // Сянка за дълбочина
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // За Android
  },
  textPicker: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93', // По-блед цвят за неактивните
  },
  activeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000', // Черен цвят за активния
  },
    text: {
    marginBottom: 10,
    fontSize: 17
  },
   row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorBox:{
    height: 50,
    width: 50,
    margin: 5,
    borderRadius: 25
  }, 
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  wrapper: { width: "100%" },
  container: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: 630,
    minHeight: 100
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "600" },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  label: { marginTop: 12, marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15
  },
  iconButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: 52,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600" },
});
