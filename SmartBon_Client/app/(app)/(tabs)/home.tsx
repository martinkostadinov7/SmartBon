import { ScrollView, StyleSheet, Text, TouchableOpacity } from "react-native";
import React, { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { useCategories } from "../../context/CategoriesContext";
import { Expense } from "../../types/expense";
import { ExpenseCard } from "../../components/expense";
import { AddButton } from "../../components/addButton";
import { apiFetch } from "../../services/api";

export default function HomeScreen() {
  const { categories } = useCategories();
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const loadExpenses =  useCallback(async () => {
      const response = await apiFetch("/Expenses/recent/10");
      if (!response.ok) {
        throw new Error("Failed to load expenses");
      }
      await response.json().then(setRecentExpenses);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );
  function handleAddExpense() {
    router.push("../expenses/addExpense");
  }

  function handleExpenseView(id: number){
    router.push(`/(modals)/expenses/${id}`);
  }

  return (<>
    <ScrollView style={styles.container}>
      {recentExpenses.map(expense => {
        const category = categories.find(c => c.id === expense.categoryId);
        const subcategory = categories
          .find(c => c.id === expense.categoryId)
          ?.subcategories.find(sc => sc.id === expense.subcategoryId);
        return (
          <ExpenseCard
            key={expense.id}
            title={expense.title}
            amount={expense.cost}
            date={String(expense.expenseDate)}
            categoryName= {category?.name ?? "Unknown"}
            categoryEmoji={category?.icon ?? "❌"}
            categoryColor={category?.colorHex ?? "#FFFFFF"}
            subcategoryEmoji={subcategory?.icon}
            subcategoryText={subcategory?.name}
            subcategoryColor={subcategory?.colorHex ?? "#FFFFFF"}
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
  container: {
    padding: 16,
    backgroundColor: "#e1ebffff"
  },
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
});
