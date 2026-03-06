import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../services/api';
import { Goal } from '../../types/goal';
import { GoalCard } from '../../components/goalCard';
import { useCategories } from '../../context/CategoriesContext';
import { Currency } from '../../types/expense';

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

export default function ChangeCategory() {
    const [goals, setGoals] = useState<Goal[]>([]);
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("EUR");
      const { categories } = useCategories();
      const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode, // Тук подаваш директно "EUR", "BGN" или "USD"
  }).format(amount);
};
function getProgressBarColorGoal(percentage: number): string {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    
    const opacity = 0.3 + (clampedPercentage / 100) * 0.9;

    return `rgba(42, 209, 0, ${opacity.toFixed(2)})`;
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

    useFocusEffect(
      useCallback(() => {
        const fetchGoals = async () => {
          try {
            const response = await apiFetch(`/Goals/realised`);
            if (!response.ok) throw new Error("Failed");
            const data = await response.json()
            setGoals(data);


            const userResponse = await apiFetch(`/Users/me`);
            if (!userResponse.ok) throw new Error("Failed");
            const profileData = await userResponse.json();
            const currencyStr = currencyFromNumber[profileData.defaultCurrency];
            setUserDefaultCurrency(currencyStr);
            
          } catch (error) {
            console.error(error);
          }
        };
    
        fetchGoals();
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
                {goals.length <= 0 && (<Text style={{ color: '#999', fontStyle: 'italic' }}>No archived goals yet.</Text>)}
                <ScrollView>
                    {
                    goals.map(goal => {
                        
                        return (
                    <GoalCard 
                        key={goal.id}
                        id={goal.id}
                        icon={goal.icon}
                        colorHex={goal.colorHex}
                        progressBarColor={getProgressBarColorGoal((goal.currentAmount / goal.finalAmount * 100))}
                        name={goal.name}
                        percentage={Number(Math.floor((goal.currentAmount / goal.finalAmount) * 100).toFixed(0))}
                        to={formatDate(goal.targetDate)}
                        limit={String(formatCost(goal.finalAmount, userDefaultCurrency))}
                        currentAmount={String(formatCost(goal.currentAmount, userDefaultCurrency))}
                        remainingAmount={String(formatCost(goal.finalAmount - goal.currentAmount, userDefaultCurrency))}
                        remaining={goal.finalAmount - goal.currentAmount >= 0}
                        onPress={function (): void {
                        } }
                        onRealiseGoalButtonPress={function (): void {
                        } }
                        reloadComponent={function (): void {
                        } } 
                        realised={!goal.isActive}/>)})
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
