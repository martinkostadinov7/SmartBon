import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Currency, Expense } from "../../../types/expense";
import { ExpenseCard } from "../../../components/expense";
import { AddButton } from "../../../components/addButton";
import { apiFetch } from "../../../services/api";
import { Budget } from "../../../types/budget";
import { BudgetCard } from "../../../components/budgetCard";
import { Goal } from "../../../types/goal";
import { GoalCard } from "../../../components/goalCard";
import { ContributionGraph } from "react-native-chart-kit";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Category } from "../../../types/category";
import { useTranslation } from 'react-i18next';
import * as SecureStore from "expo-secure-store";

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

interface GraphPointCount {
  date: string;
  count: number;
}

interface GraphPointAmount {
  date: string;
  amount: number;
}

interface ContributionGraphResponse {
  pointsCount: GraphPointCount[];
  pointsAmount: GraphPointAmount[];
}

export default function HomeScreen() {
    const [categories, setCategories] = useState<Category[]>([]);
  
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("Unidentified");
  const [userName, setUserName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [reload, setReload] = useState(false);
  const [contributionGraphData, setContributionGraphData] = useState<ContributionGraphResponse | null>(null);
  const [isHeatmapAmount, setIsHeatmapAmount] = useState(false);
const [selectedDay, setSelectedDay] = useState<{ date: string; count: number } | null>(null);

const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'bg' ? 'en' : 'bg';
    i18n.changeLanguage(newLang);
  };

useEffect(() => {
    loadData();
}, [reload]);

async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setCategories(data);
}

  const loadData =  useCallback(async () => {
loadCategories();

    const userResponse = await apiFetch(`/Users/me`);
    if (!userResponse.ok) throw new Error("Failed");
    const profileData = await userResponse.json();
    const currencyStr = currencyFromNumber[profileData.defaultCurrency];
    setUserDefaultCurrency(currencyStr);
    setIsPremium(profileData.isPremium);
    setUserName(profileData.name.split(" ")[0]);
        i18n.changeLanguage(profileData.language);
    const goalResponse = await apiFetch("/Goals");
    if (!goalResponse.ok) {
      throw new Error("Failed to load goals");
    }
    await goalResponse.json().then(setGoals);

    const budgetResponse = await apiFetch("/Budgets");
    if (!budgetResponse.ok) {
      throw new Error("Failed to load budgets");
    }
    await budgetResponse.json().then(setBudgets);

    const contributionGraphResponse = await apiFetch("/statistics/contributionGraph");
    if (!contributionGraphResponse.ok) {
      throw new Error("Failed to load budgets");
    }
    await contributionGraphResponse.json().then(setContributionGraphData);
    
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
const firstName = userName.trim().split(' ')[0];
  
  function handleAddExpense() {
    router.push("../../(modals)/expenses/addExpense");
  }

  function handleBudgetView(id: number){
    router.push(`/(modals)/budgets/${id}`);
  }

  function handleBudgetCreate(){
      if(!isPremium && budgets.length >= 2){
        Alert.alert(
              "Maximum budgets reached!",
              "The free plan allows up to 2 active budgets. Would you like to upgrade to Premium for unlimited?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Upgrade",
                  style: "default",
                  onPress: async () => {
                    router.push("(modals)/users/managePlan");
                  }
                }
              ]
            );
      }
      else{
        router.push(`/(modals)/budgets/addBudget`);
      }
  }

  function handleGoalView(id: number){
    router.push(`/(modals)/goals/${id}`);
  }
  
  function handleGoalCreate(){
      if(!isPremium && goals.length >= 2){
        Alert.alert(
              "Maximum goals reached!",
              "The free plan allows up to 2 active goals. Would you like to upgrade to Premium for unlimited?",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Upgrade",
                  style: "default",
                  onPress: async () => {
                    router.push("(modals)/users/managePlan");
                  }
                }
              ]
            );
      }
      else{
        router.push(`/(modals)/goals/addGoal`);
      }
  }
const shortMonths = [
  t('Jan_short'), t('Feb_short'), t('Mar_short'), t('Apr_short'),
  t('May_short'), t('Jun_short'), t('Jul_short'), t('Aug_short'),
  t('Sep_short'), t('Oct_short'), t('Nov_short'), t('Dec_short')
];

  function handleExpenseView(id: number){
    router.push(`/(modals)/expenses/${id}`);
  }

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

const getEndDate = () => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 за Неделя, 1 за Понеделник...
  const daysToAdd = 6 - dayOfWeek; // Колко дни остават до края на седмицата
  const end = new Date();
  end.setDate(now.getDate() + daysToAdd);
  return end;
};

  function getProgressBarColorGoal(percentage: number): string {
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    
    const opacity = 0.3 + (clampedPercentage / 100) * 0.9;

    return `rgba(42, 209, 0, ${opacity.toFixed(2)})`;
}
  function handleRealiseGoal(name: string, amount: number, goalId: number, description: string){
    router.push({
    pathname: "/(modals)/expenses/addExpense", 
    params: { 
      title: name,      
      amount: amount,   
      description: description,
      goalId: goalId
    }
  });
  }

  const formatDate = (dateString: string | Date): string => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) return "";

  const currentYear = new Date().getFullYear();
  const dateYear = date.getFullYear();

  return date.toLocaleDateString(i18n.language, {
    month: 'short',
    day: 'numeric',
    year: dateYear !== currentYear ? 'numeric' : undefined 
  });
};
  return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 32, color: "white", fontWeight: '600'}}>SmartBon</Text>
    </View>
    <ScrollView style={{padding: 12}}>
      <View style={styles.headerContainer}>
    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.greeting}>{t('greeting')},</Text>
    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.userName}>{firstName} 👋</Text>
    
  </View>
      <View>
        <View style={styles.row}>
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginVertical: 10, fontWeight: '700'}}>{t('budgets')}</Text>
          <TouchableOpacity style={{marginLeft: 10}} onPress={handleBudgetCreate}>
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{color: "#3077ce", fontWeight: "600", fontSize: 16}}>+ {t('add_new')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {budgets.length > 0 ?  
          (budgets.map(budget => {
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
                percentage={Number(Math.floor((budget.currentAmount / budget.limit) * 100).toFixed(0))}
                from={formatDate(budget.from)}
                to={formatDate(budget.to)}
                limit={String(formatCost(budget.limit, userDefaultCurrency))}
                currentAmount={String(formatCost(budget.currentAmount, userDefaultCurrency))}
                remainingAmount={String(formatCost(budget.limit - budget.currentAmount, userDefaultCurrency))}
                categories={budgetCategories}
                archived={false}
                limitReached={budget.limit <= budget.currentAmount || new Date(budget.to) <= new Date()}
                subCategories={budgetSubcategories}
                onPress={function (): void {
                  handleBudgetView(budget.id);
                } } 
                reloadComponent={function (): void {
                  setReload(prev => !prev);
                } } />)})) : 
          (<TouchableOpacity onPress={handleBudgetCreate} style={{marginBottom: 10,
            borderColor: "gray",
            borderRadius: 16,
            borderStyle: "dashed",
            borderWidth: 2,
            width: 300,
            height: 100,
            justifyContent: "center",
            alignItems: "center"}}>
            <FontAwesome6 name="plus" size={26} color="black" />
            </TouchableOpacity>)}
        </ScrollView>
      </View>
      <View>
        <View style={styles.row}>
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginVertical: 10, fontWeight: '700'}}>{t('goals')}</Text>
          <TouchableOpacity style={{marginLeft: 10}} onPress={handleGoalCreate}>
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{color: "#3077ce", fontWeight: "600", fontSize: 16}}>+ {t('add_new')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal>
          {goals.length > 0 ? 
          (goals.map(goal => (
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
                  handleGoalView(goal.id);
                } }
                onRealiseGoalButtonPress={function (): void {
                  handleRealiseGoal(goal.name, goal.currentAmount, goal.id, goal.description);
                } }
                reloadComponent={function (): void {
                  setReload(prev => !prev);
                } } 
                realised={!goal.isActive}/>))) : 
          (<TouchableOpacity onPress={handleGoalCreate} style={{marginBottom: 10,
            borderColor: "gray",
            borderRadius: 16,
            borderStyle: "dashed",
            borderWidth: 2,
            width: 300,
            height: 100,
            justifyContent: "center",
            alignItems: "center"}}>
            <FontAwesome6 name="plus" size={26} color="black" />
            </TouchableOpacity>)}
        </ScrollView>
      </View>

<View style={{}}>
  <View style={[styles.row, {marginVertical: 10,}]}>
    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit  style={{fontSize: 20, fontWeight: '700'}}>{t('heatmap')}</Text>

    {selectedDay ? (
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{marginLeft: 10, textAlign: "center", fontSize: 16, fontWeight: '600', color: '#3077ce'}}>
        
        {new Date(selectedDay.date).toLocaleDateString('bg-BG', { 
  day: '2-digit', 
  month: '2-digit' 
})} - {' '}

        {isHeatmapAmount ? (
          formatCost(selectedDay.count, userDefaultCurrency)
        ) : (
          `${selectedDay.count} ${selectedDay.count === 1 ? `${t('expense')}` : `${t('expenses')}`}`
        )}
      </Text>
    ) : (
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 14, color: '#8E8E93' }}></Text>
    )}
  </View>

    <TouchableOpacity onPress={() => {setIsHeatmapAmount(prev => !prev); setSelectedDay(null)}} style={{justifyContent:"space-between", backgroundColor: "#3077ce3f", borderRadius: 10, marginHorizontal: 10, paddingHorizontal: 10, paddingVertical: 5, maxWidth: 100, marginBottom: 10}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 15, textAlign: "center"}}><FontAwesome6 name="repeat" size={16} color="black" /> {isHeatmapAmount ? `${t('amount')}` : `${t('count')}`}</Text>
    </TouchableOpacity>
  <ContributionGraph
    values={(!isHeatmapAmount ? contributionGraphData?.pointsCount : contributionGraphData?.pointsAmount.map(p => ({
    date: p.date,
    count: p.amount // Подаваме сумата като count за визуализация
  }))) || []}
    endDate={getEndDate()} // Използваме края на седмицата
    numDays={105}
    width={Dimensions.get("window").width - 25}
    height={220}
    onDayPress={(value) => {
      // value съдържа { date, count } на кликнатото квадратче
      if (value && value.count > 0) {
        setSelectedDay(value as { date: string; count: number });
      } else {
        setSelectedDay(null);
      }
    }}
    getMonthLabel={(monthIndex) => t(shortMonths[monthIndex])}
    style={{borderRadius: 20, marginTop: 0, marginBottom: 10, shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 1,}}
    chartConfig={{
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      color: (opacity = 1) => {
    // Ако opacity е ниско (0 или много малко разходи), връщаме много светъл цвят
    if (opacity <= 0.15) {
      return `rgb(247, 247, 247)`; // Светло сиво (GitHub стил) за 0 разходи
    }
    // За реалните разходи използваме твоето синьо
    return `rgba(48, 119, 206, ${opacity})`; 
  },
    }}
    tooltipDataAttrs={() => ({})} // Изчистваме грешката, за която говорихме
  />
  
</View>

      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginVertical: 10, fontWeight: '700'}}>{t('recent_expenses')}</Text>
      {recentExpenses.length > 0 ? 
      (recentExpenses.map(expense => {
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
            categoryName= {t(category?.name ?? "Unknown")}
            categoryEmoji={category?.icon ?? "❌"}
            categoryColor={category?.colorHex ?? "x"}
            subcategoryEmoji={subcategory?.icon}
            subcategoryText={subcategory?.name}
            subcategoryColor={subcategory?.colorHex ?? "#ff7575"}
            onPress={() => handleExpenseView(expense.id)}
          />
        );
      })) : 
      (<View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{t('no_expenses_added')}</Text>
        <Text>{t('use_plus_button')}</Text>
      </View>)}
      
    </ScrollView>
    <AddButton
      onPress={handleAddExpense}
    />
  </>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 5,
    marginBottom: 10,
  },
  greeting: {
    fontSize: 20,
    color: '#595959', // По-светло сиво
    fontWeight: '400',
  },
  userName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000000', // Почти черно
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
  row:{
    flexDirection: 'row',
    alignItems: 'center',
  },
});
