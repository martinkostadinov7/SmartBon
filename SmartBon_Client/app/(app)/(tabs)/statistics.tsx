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
        throw new Error("Failed to load expenses line charts");
      }
      await daysBarChartDataResponse.json().then(setDaysBarChartData);
  }

    const loadData = useCallback(async () => {
  await Promise.all([
    loadUserData(),
    loadExpenseLineChartData(),
    loadCategoriesGraphData(),
    loadPaymentTypePieChartData(),
    loadDaysBarChartData()
  ]);
}, [expensesDateRange, categoriesDateRange, paymentTypeDateRange]);

    useFocusEffect(
      useCallback(() => {
        loadData();
      }, [loadData])
    );

  return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
        <Text style={{fontSize: 32, color: "white"}}>Statistics</Text>
    </View>

    <ScrollView style={{padding: 10}}>

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
});
