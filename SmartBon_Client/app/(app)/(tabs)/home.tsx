import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { useCategories } from "../../context/CategoriesContext";
import { Currency, Expense } from "../../types/expense";
import { ExpenseCard } from "../../components/expense";
import { AddButton } from "../../components/addButton";
import { apiFetch } from "../../services/api";
import { Budget } from "../../types/budget";
import { BudgetCard } from "../../components/budgetCard";

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

export default function HomeScreen() {
  const { categories } = useCategories();
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("Unidentified");

  const loadData =  useCallback(async () => {
    const userResponse = await apiFetch(`/Users/me`);
    if (!userResponse.ok) throw new Error("Failed");
    const profileData = await userResponse.json();
    const currencyStr = currencyFromNumber[profileData.defaultCurrency];
    setUserDefaultCurrency(currencyStr);

    const budgetResponse = await apiFetch("/Budgets");
    if (!budgetResponse.ok) {
      throw new Error("Failed to load budgets");
    }
    await budgetResponse.json().then(setBudgets);
   
    const recentExpenseResponse = await apiFetch("/Expenses/recent/10");
    if (!recentExpenseResponse.ok) {
      throw new Error("Failed to load expenses");
    }
    await recentExpenseResponse.json().then(setRecentExpenses);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  function handleAddExpense() {
    router.push("../expenses/addExpense");
  }

  function handleBudgetView(id: number){
    router.push(`/(modals)/budgets/${id}`);
  }

  function handleBudgetCreate(){
      router.push(`/(modals)/budgets/addBudget`);
  }

  function handleExpenseView(id: number){
    router.push(`/(modals)/expenses/${id}`);
  }

  const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode, // Тук подаваш директно "EUR", "BGN" или "USD"
  }).format(amount);
};

  function getProgressBarColor(percentage: number): string {
    if(percentage > 0 && percentage < 60){
      return "#2ad100"
    }
    else if(percentage >= 60 && percentage < 80){
      return "#ffff00"
    }
    else if(percentage >= 80){
      return "#e60000"
    }
    return "#ffffff"
  }

  const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "";

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    // Only show year if it's not the current year
    year: dateYear !== currentYear ? 'numeric' : undefined 
  });
};
  return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
        <Text style={{fontSize: 32, color: "white", fontWeight: '600'}}>SmartBon</Text>
    </View>
    <ScrollView style={{padding: 12}}>
      <View>
        <View style={styles.row}>
          <Text style={{fontSize: 20, marginVertical: 10, fontWeight: '700'}}>Budgets</Text>
          <TouchableOpacity style={{marginLeft: 10}} onPress={handleBudgetCreate}>
            <Text style={{color: "#3077ce", fontWeight: "600", fontSize: 16}}>+ Add New</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal>

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
              icon={budget.icon}
              colorHex={budget.colorHex}
              progressBarColor={getProgressBarColor((budget.currentAmount / budget.limit * 100))}
              name={budget.name}
              percentage={Number(((budget.currentAmount / budget.limit) * 100).toFixed(0))}
              from={formatDate(budget.from)} 
              to={formatDate(budget.to)} 
              limit={String(formatCost(budget.limit, userDefaultCurrency))} 
              currentAmount={String(formatCost(budget.currentAmount, userDefaultCurrency))} 
              remainingAmount={String(formatCost(budget.limit - budget.currentAmount, userDefaultCurrency))} 
              categories={budgetCategories} 
              subCategories={budgetSubcategories} 
              onPress={function (): void {
                  handleBudgetView(budget.id)
                } } />)})
          }
        </ScrollView>
      </View>
      <Text style={{fontSize: 20, marginVertical: 10, fontWeight: '700'}}>Recent expenses</Text>
      {recentExpenses.map(expense => {
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
            categoryName= {category?.name ?? "Unknown"}
            categoryEmoji={category?.icon ?? "❌"}
            categoryColor={category?.colorHex ?? "x"}
            subcategoryEmoji={subcategory?.icon}
            subcategoryText={subcategory?.name}
            subcategoryColor={subcategory?.colorHex ?? "#ff7575"}
            onPress={() => handleExpenseView(expense.id)}
          />
        );
      })}
    </ScrollView>
    <AddButton
      onPress={handleAddExpense}
    />
  </>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    borderRadius: 10,
    elevation: 2,
  },
  cost: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    marginTop: 4,
    color: "#444",
  },
  date: {
    marginTop: 4,
    fontSize: 12,
    color: "#888",
  },
  category: {
    marginTop: 6,
    fontSize: 13,
    color: "#555",
  },
  row:{
    flexDirection: 'row',
    alignItems: 'center',
  },
});
