import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../services/api';
import { Budget } from '../../types/budget';
import { BudgetCard } from '../../components/budgetCard';
import { Currency } from '../../types/expense';
import { Category } from '../../types/category';
import { useTranslation } from 'react-i18next';

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

export default function ArchivedBudgets() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("EUR");
  const [categories, setCategories] = useState<Category[]>([]);
  const { t, i18n } = useTranslation();

      const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: currencyCode, // Тук подаваш директно "EUR", "BGN" или "USD"
  }).format(amount);
};
function getProgressBarColorBudget(percentage: number): string {
    // Ограничаваме процента между 0 и 100
    const clamped = Math.min(Math.max(percentage, 0), 100);

    // Изчисляваме Hue (Хю):
    // При 0% искаме 120 (зелено), при 100% искаме 0 (червено).
    // Формула: 120 - (процент * 1.2)
    const hue = 120 - (clamped * 1.2);

    // Връщаме HSL стринг с фиксирана наситеност и светлина за пастелен ефект
    return `hsl(${hue}, 100%, 60%)`;
  }
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


  function handleBudgetView(id: number){
    router.push(`/(modals)/budgets/${id}`);
  }

async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error(`${t('error_occured')}`);
    const data = await response.json();
    setCategories(data);
}

    useFocusEffect(
      useCallback(() => {
        const fetchBudgets = async () => {
          try {
loadCategories();

            const response = await apiFetch(`/Budgets/archived`);
            if (!response.ok) throw new Error(`${t('error_occured')}`);
            const data = await response.json()
            setBudgets(data);


            const userResponse = await apiFetch(`/Users/me`);
            if (!userResponse.ok) throw new Error(`${t('error_occured')}`);
            const profileData = await userResponse.json();
            const currencyStr = currencyFromNumber[profileData.defaultCurrency];
            setUserDefaultCurrency(currencyStr);
            
          } catch (error) {
            console.error(error);
          }
        };
    
        fetchBudgets();
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
                {budgets.length <= 0 && (<Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ color: '#999', fontStyle: 'italic' }}>{t('no_archived_budgets_left')}</Text>)}
                <ScrollView>
                    {
                    budgets.map(budget => {
                        let budgetCategories = categories.filter(category => 
                        budget.categoryIds.includes(category.id)
                    );
                    if(budgetCategories.length == categories.length){
                        budgetCategories = [];
                    } 
                    
                        const allSubcategories = categories.flatMap(cat => cat.subcategories);

                        const budgetSubcategories = allSubcategories.filter(sub => 
                        budget.subcategoryIds.includes(sub.id)
                        );
                        return (
                    <BudgetCard 
                        key={budget.id}
                        id={budget.id}
                        icon={budget.icon}
                        colorHex={budget.colorHex}
                        progressBarColor={getProgressBarColorBudget((budget.currentAmount / budget.limit * 100))}
                        name={budget.name}
                        percentage={Number(((budget.currentAmount / budget.limit) * 100).toFixed(0))}
                        from={formatDate(budget.from)}
                        to={formatDate(budget.to)}
                        limit={String(formatCost(budget.limit, userDefaultCurrency))}
                        currentAmount={String(formatCost(budget.currentAmount, userDefaultCurrency))}
                        remainingAmount={String(formatCost(budget.limit - budget.currentAmount, userDefaultCurrency))}
                        categories={budgetCategories}
                        subCategories={budgetSubcategories}
                        limitReached={true}
                        archived={true}
                        onPress={function (): void {
                        } } 
                        reloadComponent={function (): void {
                            throw new Error('Function not implemented.');
                        } } />)})
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
