import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { router, useFocusEffect } from "expo-router";
import { apiFetch } from "../../services/api";
import { Currency } from "../../types/expense";
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

interface LineChartDataset {
  data: number[]; 
}

interface LineChartData {
  labels: string[]; 
  datasets: LineChartDataset[]; 
}

interface MonthlyReportData {
  monthName: string;
  totalTransactionsCount: number;
  totalCountDifference: number;
  totalSpent: number;
  totalSpentDifference: number;
  percentageChange: number;
  noSpendDaysCount: number;
  averageSpentPerDay: number;
  topCategoryId: number;
  topAmount: number;
  mostExpensiveDay: Date;
  mostExpensiveDayAmount: number;
  preferredPaymentMethod: number;
}

interface ChartData {
  name: string,
  population: number,
  color: string,
  legendFontColor: string,
  legendFontSize: number
}

interface CategoriesPieChartResponse {
  categoryData: ChartData[];
  subcategoryData: ChartData[];
}

interface PaymentTypePieChartResponse {
  paymentTypePieChartData: ChartData[];
}

export default function StatisticsScreen() {
  const ranges = ["Daily", "Weekly", "Monthly"];
  const [categoriesPieChartData, setCategoriesPieChartData] = useState<CategoriesPieChartResponse | null>(null);
  const [paymentTypePieChartData, setPaymentTypePieChartData] = useState<PaymentTypePieChartResponse | null>(null);
  const [еxpensesLineChartData, setExpensesLineChartData] = useState<LineChartData | null>(null);
  const [daysBarChartData, setDaysBarChartData] = useState<LineChartData | null>(null);
  const [monthlyReportData, setMonthlyReportData] = useState<MonthlyReportData | null>(null);
  const [isMonthlyReportCardOpen, setIsMonthlyReportCardOpen] = useState(false);
const [categoriesDateRange, setCategoriesDateRange] = useState<[Date, Date]>(() => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30); // Вадим точно 30 дни
  
  return [start, end];
});  

const [paymentTypeDateRange, setPaymentTypeDateRange] = useState<[Date, Date]>(() => {
 const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 30); // Вадим точно 30 дни
  
  return [start, end];
});  
const [expensesDateRange, setExpensesDateRange] = useState("Daily");

  const [userDefaultCurrency, setUserDefaultCurrency] = useState("Unidentified");
  const [isPremium, setIsPremium] = useState(false);
  
  useEffect(() => {
      loadCategoriesGraphData();
  }, [categoriesDateRange]);

   useEffect(() => {
      loadPaymentTypePieChartData();
  }, [paymentTypeDateRange]);


  useEffect(() => {
      loadExpenseLineChartData();
  }, [expensesDateRange]);

async function loadUserData(){
      const userResponse = await apiFetch(`/Users/me`);
      if (!userResponse.ok) throw new Error("Failed");
      const profileData = await userResponse.json();
      const currencyStr = currencyFromNumber[profileData.defaultCurrency];
      setUserDefaultCurrency(currencyStr);
      setIsPremium(profileData.isPremium);
}

function handlePremiumFeaturePress(message: string){
  Alert.alert(
      "Premium feature",
      `${message} Would you like to upgrade to Premium for unlimited?`,
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

async function loadCategoriesGraphData(){
const query = new URLSearchParams({
        "FilterParams.StartDate": categoriesDateRange[0].toISOString(),
        "FilterParams.EndDate": categoriesDateRange[1].toISOString(),
        "SortParams.Descending": "true",  
        "SortParams.SortBy": "0",  
      });

      const categoriesPieChartResponse = await apiFetch(`/statistics/categoriesPieChart?${query.toString()}`);
      if (!categoriesPieChartResponse.ok) {
        throw new Error("Failed to load categories pie charts");
      }
      await categoriesPieChartResponse.json().then(setCategoriesPieChartData);
}

async function loadPaymentTypePieChartData(){
const query = new URLSearchParams({
        "FilterParams.StartDate": paymentTypeDateRange[0].toISOString(),
        "FilterParams.EndDate": paymentTypeDateRange[1].toISOString(),
        "SortParams.Descending": "true",  
        "SortParams.SortBy": "0",  
      });

      const paymentTypePieChartResponse = await apiFetch(`/statistics/paymentTypePieChart?${query.toString()}`);
      if (!paymentTypePieChartResponse.ok) {
        throw new Error("Failed to load paymentType pie charts");
      }
      await paymentTypePieChartResponse.json().then(setPaymentTypePieChartData);
}

  async function loadExpenseLineChartData(){
    const еxpensesLineChartDataResponse = await apiFetch(`/statistics/expensesLineChart?range=${expensesDateRange}`);
      if (!еxpensesLineChartDataResponse.ok) {
        throw new Error("Failed to load expenses line charts");
      }
      await еxpensesLineChartDataResponse.json().then(setExpensesLineChartData);
  }

  async function loadDaysBarChartData(){
    const daysBarChartDataResponse = await apiFetch(`/statistics/daysBarChart`);
      if (!daysBarChartDataResponse.ok) {
        throw new Error("Failed to load days bar charts");
      }
      await daysBarChartDataResponse.json().then(setDaysBarChartData);
  }

  async function loadMonthlyReportData(){
    const monthlyReportResponse = await apiFetch(`/statistics/monthlyReport`);
      if (!monthlyReportResponse.ok) {
        throw new Error("Failed to load monthly report");
      }
      await monthlyReportResponse.json().then(setMonthlyReportData);
  }

  const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

    const loadData = useCallback(async () => {
  await Promise.all([
    loadUserData(),
    loadExpenseLineChartData(),
    loadCategoriesGraphData(),
    loadPaymentTypePieChartData(),
  ]);
}, [expensesDateRange, categoriesDateRange, paymentTypeDateRange]);

    useFocusEffect(
      useCallback(() => {
        loadData();
        
    loadDaysBarChartData(),
    loadMonthlyReportData()
      }, [loadData])
    );

  return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
        <Text style={{fontSize: 32, color: "white"}}>Statistics</Text>
    </View>

    <ScrollView style={{padding: 10}}>

{!monthlyReportData ? (
  <View style={styles.card}><Text>Loading report...</Text></View>
) : (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>Report for {monthlyReportData.monthName}</Text>
      <View style={[
        styles.badge, 
        (monthlyReportData.percentageChange ?? 0) > 0 ? styles.badgeRed : styles.badgeGreen
      ]}>
        <Text style={styles.badgeText}>
          {(monthlyReportData.percentageChange ?? 0) > 0 ? '↑' : '↓'} 
          {Math.abs(monthlyReportData.percentageChange ?? 0)}%
        </Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.mainStatContainer}>
      <Text style={styles.label}>Total Spent</Text>
      <Text style={styles.totalAmount}>
        {formatCost(Number(monthlyReportData.totalSpent?.toFixed(2) ?? "0.00"), userDefaultCurrency)}
      </Text>
      <Text style={styles.subLabel}>
        {(monthlyReportData.totalSpentDifference ?? 0) > 0 ? '+' : ''}
        {formatCost(monthlyReportData.totalSpentDifference ?? 0, userDefaultCurrency)} vs previous month
      </Text>
    </View>

    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <Text style={styles.gridLabel}>Transactions</Text>
        <Text style={styles.gridValue}>{monthlyReportData.totalTransactionsCount ?? 0}</Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.gridLabel}>No-Spend Days</Text>
        <Text style={styles.gridValue}>{monthlyReportData.noSpendDaysCount ?? 0}</Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.gridLabel}>Daily Average</Text>
        <Text style={styles.gridValue}>
          {formatCost(Number(monthlyReportData.averageSpentPerDay?.toFixed(2) ?? "0.00"), userDefaultCurrency)}
        </Text>
      </View>
      <View style={styles.gridItem}>
        <Text style={styles.gridLabel}>Preferred Payment</Text>
        <Text style={styles.gridValue}>
          {monthlyReportData.preferredPaymentMethod === 1 ? 'Card' : 'Cash'}
        </Text>
      </View>
    </View>

    <View style={styles.highlightBox}>
      <Text style={styles.highlightTitle}>Most Expensive Day</Text>
      <Text style={styles.highlightValue}>
        {monthlyReportData.mostExpensiveDay 
          ? new Date(monthlyReportData.mostExpensiveDay).toLocaleDateString('en-US') 
          : 'N/A'}
        <Text style={{ fontWeight: '400' }}>
          {' — '}{formatCost(Number(monthlyReportData.mostExpensiveDayAmount?.toFixed(2) ?? "0.00"), userDefaultCurrency)}
        </Text>
      </Text>
    </View>
  </View>
)}

    <Text style={{fontSize: 20, marginBottom: 10, fontWeight: '700'}}>Expenses</Text>
    <View style={styles.row}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>

      {ranges.map((range) => {
          return (
          <TouchableOpacity
              key={range}
              style={{
              flexDirection: 'row', 
              alignItems: 'center',
              borderWidth: expensesDateRange === range ? 2 : 1,
              borderRadius: 10,
              marginRight: 7,
              paddingVertical: 9,
              paddingHorizontal: 12, 
              backgroundColor: '#f0f0f0',
              borderColor: (expensesDateRange === range ? "black" : "gray")
              }}
              onPress={() => setExpensesDateRange(range)}
          >
              <Text style={{ 
                  textAlign: "center", 
                  fontSize: 14, 
                  textTransform: 'capitalize',
                  fontWeight: expensesDateRange === range ? 'bold' : 'normal',
              }}>
              {range}
              </Text>
          </TouchableOpacity>
          );
      })}
      </ScrollView>
        </View>
      {еxpensesLineChartData && еxpensesLineChartData.datasets[0].data.length > 0 ? (
        <LineChart
          data={{
            labels: еxpensesLineChartData.labels,
            datasets: еxpensesLineChartData.datasets
          }}
          width={Dimensions.get("window").width - 30}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(48, 119, 206, ${opacity})`,
            style: { borderRadius: 16 }
          }}
          bezier 
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No data available for this period</Text>
        </View>
      )}

      <Text style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>Categories</Text>
      <View style={styles.row}>
          <DateTimePicker
            style={styles.dateInput}
            value={categoriesDateRange[0]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setCategoriesDateRange([selectedDate, categoriesDateRange[1]]);
            }}
          />
          <Text style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
          <DateTimePicker
            style={styles.dateInput}
            value={categoriesDateRange[1]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setCategoriesDateRange([categoriesDateRange[0], selectedDate]);
            }}
          />
      </View>
      
      {categoriesPieChartData?.categoryData && categoriesPieChartData.categoryData.length > 0 ? (
        <PieChart
          data={categoriesPieChartData.categoryData}
          width={Dimensions.get("window").width - 25}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 10]}
          absolute
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No category data found</Text>
        </View>
      )}

      <Text style={{fontSize: 16, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>Subcategories</Text>

      {isPremium ? 
      (categoriesPieChartData?.subcategoryData && categoriesPieChartData.subcategoryData.length > 0 ? (
              <PieChart
                data={categoriesPieChartData.subcategoryData}
                width={Dimensions.get("window").width - 25}
                height={220}
                chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 10]}
                absolute
              />
            ) : (
              <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No category data found</Text>
              </View>
            )
      ) : 
      (<TouchableOpacity onPress={() => handlePremiumFeaturePress("Subcategories statistics is a premium feature!")} style={{backgroundColor:"rgba(48, 119, 206, 0.37)", height: 220, alignItems:"center", justifyContent:"center", borderRadius: 30}}>
        <FontAwesome6 name="lock" size={40} color="#3077ceff"/>
        <Text style={{fontSize: 20, fontWeight: "700", marginTop: 10}}>Premium Feature</Text>
      </TouchableOpacity>) 
      }
            

    <Text style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>Payment Types</Text>
      <View style={styles.row}>
          <DateTimePicker
            style={styles.dateInput}
            value={paymentTypeDateRange[0]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setPaymentTypeDateRange([selectedDate, paymentTypeDateRange[1]]);
            }}
          />
          <Text style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
          <DateTimePicker
            style={styles.dateInput}
            value={paymentTypeDateRange[1]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setPaymentTypeDateRange([paymentTypeDateRange[0], selectedDate]);
            }}
          />
      </View>

      {paymentTypePieChartData?.paymentTypePieChartData && paymentTypePieChartData?.paymentTypePieChartData.length > 0 ? (
        <PieChart
          data={paymentTypePieChartData?.paymentTypePieChartData}
          width={Dimensions.get("window").width - 25}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          center={[10, 10]}
          absolute
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No subcategory data found</Text>
        </View>
      )}

    <Text style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>Average daily spending</Text>


 {isPremium ? 
      (daysBarChartData && daysBarChartData.datasets[0].data.length > 0 ? (
        <BarChart
          data={{
            labels: daysBarChartData.labels,
            datasets: daysBarChartData.datasets
          }}
          width={Dimensions.get("window").width - 30}
          height={220}
          chartConfig={{
            barPercentage: 0.7,
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(48, 119, 206, ${opacity})`,
            style: { borderRadius: 16 }
          }} 
          style={{ marginVertical: 8, borderRadius: 16 }}
          verticalLabelRotation={0}
          yAxisLabel=""
          yAxisSuffix=""
          fromZero={true}
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No data available for this period</Text>
        </View>
      )
      ) : 
      (<TouchableOpacity onPress={() => handlePremiumFeaturePress("Average daily spending statistics is a premium feature!")} style={{backgroundColor:"rgba(48, 119, 206, 0.37)", height: 220, alignItems:"center", justifyContent:"center", borderRadius: 30}}>
        <FontAwesome6 name="lock" size={40} color="#3077ceff"/>
        <Text style={{fontSize: 20, fontWeight: "700", marginTop: 10}}>Premium Feature</Text>
      </TouchableOpacity>) 
      }

    </ScrollView>
  </>
  );
}


const styles = StyleSheet.create({
  dateInput: {
    marginBottom: 10,
  },
  row:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeRed: { backgroundColor: '#FFE5E5' },
  badgeGreen: { backgroundColor: '#E5FFEA' },
  badgeText: { fontWeight: '600', fontSize: 12 },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 5,
  },
  mainStatContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    color: '#666',
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2D3436',
    marginVertical: 4,
  },
  subLabel: {
    fontSize: 12,
    color: '#999',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  gridLabel: {
    fontSize: 11,
    color: '#888',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  highlightBox: {
    marginTop: 10,
    padding: 15,
    backgroundColor: '#F0F3FF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4834DF',
  },
  highlightTitle: {
    fontSize: 12,
    color: '#4834DF',
    fontWeight: '600',
    marginBottom: 2,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3436',
  },
});
