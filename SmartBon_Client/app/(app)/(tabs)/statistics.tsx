import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { router, useFocusEffect } from "expo-router";
import { apiFetch } from "../../../services/api";
import { Currency, PaymentType } from "../../../types/expense";
import DateTimePicker from '@react-native-community/datetimepicker';
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useTranslation } from "react-i18next";

const paymentTypeFromNumber: Record<number, PaymentType> = {
  0: "Cash",
  1: "Card",
  2: "Transfer",
};


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
const { t, i18n } = useTranslation();

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
      if (!userResponse.ok) throw new Error(t("error_occured"));
      const profileData = await userResponse.json();
      const currencyStr = currencyFromNumber[profileData.defaultCurrency];
      setUserDefaultCurrency(currencyStr);
      setIsPremium(profileData.isPremium);
}

function handlePremiumFeaturePress(message: string){
  Alert.alert(
      `${t('premium_feature')}`,
      `${message} ${t('would_you_like_to_upgrade_message')}`,
      [
        { text: `${t('cancel')}`, style: "cancel" },
        {
          text: `${t('upgrade')}`,
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
        throw new Error(`${t('error_occured')}`);
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
        throw new Error(`${t('error_occured')}`);
      }
      await paymentTypePieChartResponse.json().then(setPaymentTypePieChartData);
}

  async function loadExpenseLineChartData(){
    const еxpensesLineChartDataResponse = await apiFetch(`/statistics/expensesLineChart?range=${expensesDateRange}`);
      if (!еxpensesLineChartDataResponse.ok) {
        throw new Error(`${t('error_occured')}`);
      }
      await еxpensesLineChartDataResponse.json().then(setExpensesLineChartData);
  }

  async function loadDaysBarChartData(){
    const daysBarChartDataResponse = await apiFetch(`/statistics/daysBarChart`);
      if (!daysBarChartDataResponse.ok) {
        throw new Error(`${t('error_occured')}`);
      }
      await daysBarChartDataResponse.json().then(setDaysBarChartData);
  }

  async function loadMonthlyReportData(){
    const monthlyReportResponse = await apiFetch(`/statistics/monthlyReport`);
      if (!monthlyReportResponse.ok) {
        throw new Error(`${t('error_occured')}`);
      }
      await monthlyReportResponse.json().then(setMonthlyReportData);
  }

  const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: currencyCode || "EUR",
  }).format(amount);
};
const getCurrencySymbol = (code: string) => {
  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: code || 'EUR',
  }).format(0).replace(/\d|[,.]/g, '').trim();
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

const translatedCategoryData = categoriesPieChartData?.categoryData.map(item => ({
  ...item,
  name: `${t(item.name)}: ${formatCost(item.population, userDefaultCurrency)}`, 
  color: item.color,
  legendFontColor: "#7F7F7F",
  legendFontSize: 12
}));
const translatedSubcategoryData = categoriesPieChartData?.subcategoryData.map(item => ({
  ...item,
  name: `${t(item.name)}: ${formatCost(item.population, userDefaultCurrency)}`, 
  color: item.color,
  legendFontColor: "#7F7F7F",
  legendFontSize: 12
}));
const translatedPaymentTypeData = paymentTypePieChartData?.paymentTypePieChartData.map(item => ({
  ...item,
  name: `${t(item.name)}: ${formatCost(item.population, userDefaultCurrency)}`, 
  color: item.color,
  legendFontColor: "#7F7F7F",
  legendFontSize: 12
}));



const translatedLabels = daysBarChartData?.labels.map(label => t(label));

  return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 32, color: "white"}}>{t('statistics')}</Text>
    </View>

    <ScrollView style={{padding: 10}}>

{!monthlyReportData ? (
  <View style={styles.card}><Text>{t('loading')}...</Text></View>
) : (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.title}>{t('report_for')} {t(monthlyReportData.monthName)}</Text>
      <View style={[
        styles.badge, 
        (monthlyReportData.percentageChange ?? 0) > 0 ? styles.badgeRed : styles.badgeGreen
      ]}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.badgeText}>
          {(monthlyReportData.percentageChange ?? 0) > 0 ? '↑' : '↓'} 
          {Math.abs(monthlyReportData.percentageChange ?? 0)}%
        </Text>
      </View>
    </View>

    <View style={styles.divider} />

    <View style={styles.mainStatContainer}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.label}>{t('total_spent')}</Text>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.totalAmount}>
        {formatCost(Number(monthlyReportData.totalSpent?.toFixed(2) ?? "0.00"), userDefaultCurrency)}
      </Text>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.subLabel}>
        {(monthlyReportData.totalSpentDifference ?? 0) > 0 ? '+' : ''}
        {formatCost(monthlyReportData.totalSpentDifference ?? 0, userDefaultCurrency)} {t('vs_previous_month')}
      </Text>
    </View>

    <View style={styles.grid}>
      <View style={styles.gridItem}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridLabel}>{t('transactions')}</Text>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridValue}>{monthlyReportData.totalTransactionsCount ?? 0}</Text>
      </View>
      <View style={styles.gridItem}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridLabel}>{t('no_spend_days')}</Text>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridValue}>{monthlyReportData.noSpendDaysCount ?? 0}</Text>
      </View>
      <View style={styles.gridItem}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridLabel}>{t('daily_average')}</Text>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridValue}>
          {formatCost(Number(monthlyReportData.averageSpentPerDay?.toFixed(2) ?? "0.00"), userDefaultCurrency)}
        </Text>
      </View>
      <View style={styles.gridItem}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridLabel}>{t('preferred_payment')}</Text>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.gridValue}>
          {t(paymentTypeFromNumber[monthlyReportData.preferredPaymentMethod])}
        </Text>
      </View>
    </View>

    <View style={styles.highlightBox}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.highlightTitle}>{t('most_expensive_day')}</Text>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.highlightValue}>
        {monthlyReportData.mostExpensiveDay 
          ? new Date(monthlyReportData.mostExpensiveDay).toLocaleDateString('bg-BG') 
          : 'N/A'}
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontWeight: '400' }}>
          {' — '}{formatCost(Number(monthlyReportData.mostExpensiveDayAmount?.toFixed(2) ?? "0.00"), userDefaultCurrency)}
        </Text>
      </Text>
    </View>
  </View>
)}

    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 10, fontWeight: '700'}}>{t('expenses')}</Text>
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
              <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ 
                  textAlign: "center", 
                  fontSize: 14, 
                  textTransform: 'capitalize',
                  fontWeight: expensesDateRange === range ? 'bold' : 'normal',
              }}>
              {t(range)}
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
          yAxisSuffix={` ${getCurrencySymbol(userDefaultCurrency)}`}
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
          <Text>{t('no_data_available')}</Text>
        </View>
      )}

      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>{t('categories')}</Text>
      <View style={styles.row}>
          <DateTimePicker
            locale={i18n.language}
            style={styles.dateInput}
            value={categoriesDateRange[0]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setCategoriesDateRange([selectedDate, categoriesDateRange[1]]);
            }}
          />
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
          <DateTimePicker
            locale={i18n.language}
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
          data={translatedCategoryData || categoriesPieChartData?.categoryData}
          width={Dimensions.get("window").width}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"-45"}
          center={[35, 10]}
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{t('no_data_available')}</Text>
        </View>
      )}

      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>{t('subcategories')}</Text>

      {isPremium ? 
      (categoriesPieChartData?.subcategoryData && categoriesPieChartData.subcategoryData.length > 0 ? (
              <PieChart
                data={translatedSubcategoryData|| categoriesPieChartData.subcategoryData}
                width={Dimensions.get("window").width}
                height={220}
                chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"-45"}
          center={[35, 10]}
              />
            ) : (
              <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{t('no_data_available')}</Text>
              </View>
            )
      ) : 
      (<TouchableOpacity onPress={() => handlePremiumFeaturePress(`${t('premium_feature_subcategories_statistics')}`)} style={{backgroundColor:"rgba(48, 119, 206, 0.37)", height: 220, alignItems:"center", justifyContent:"center", borderRadius: 30}}>
        <FontAwesome6 name="lock" size={40} color="#3077ceff"/>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, fontWeight: "700", marginTop: 10}}>{t('premium_feature')}</Text>
      </TouchableOpacity>) 
      }
            

    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>{t('payment_types')}</Text>
      <View style={styles.row}>
          <DateTimePicker
            locale={i18n.language}
            style={styles.dateInput}
            value={paymentTypeDateRange[0]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setPaymentTypeDateRange([selectedDate, paymentTypeDateRange[1]]);
            }}
          />
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
          <DateTimePicker
            locale={i18n.language}
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
          data={translatedPaymentTypeData || paymentTypePieChartData?.paymentTypePieChartData}
          width={Dimensions.get("window").width}
          height={220}
          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"-45"}
          center={[35, 10]}
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{t('no_data_available')}</Text>
        </View>
      )}

    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginTop: 20, marginBottom: 10, fontWeight: '700'}}>{t('average_daily_spending')}</Text>


 {isPremium ? 
      (daysBarChartData && daysBarChartData.datasets[0].data.length > 0 ? (
        <BarChart
          data={{
            labels: translatedLabels || daysBarChartData.labels,
            datasets: daysBarChartData.datasets
          }}
          yAxisSuffix={` ${getCurrencySymbol(userDefaultCurrency)}`}
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
          fromZero={true}
        />
      ) : (
        <View style={{ height: 220, justifyContent: 'center', alignItems: 'center' }}>
          <Text>{t('no_data_available')}</Text>
        </View>
      )
      ) : 
      (<TouchableOpacity onPress={() => handlePremiumFeaturePress(`${t('premium_feature_daily_spending')}`)} style={{backgroundColor:"rgba(48, 119, 206, 0.37)", height: 220, alignItems:"center", justifyContent:"center", borderRadius: 30}}>
        <FontAwesome6 name="lock" size={40} color="#3077ceff"/>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, fontWeight: "700", marginTop: 10}}>`${t('premium_feature')}`</Text>
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
