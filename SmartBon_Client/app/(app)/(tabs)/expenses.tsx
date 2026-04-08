import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Keyboard, Pressable, Dimensions, FlatList, ActivityIndicator } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { Currency, Expense } from "../../../types/expense";
import { ExpenseCard } from "../../../components/expense";
import { AddButton } from "../../../components/addButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CategoryBox } from "../../../components/categoryBox";
import { Subcategory } from "../../../types/subcategory";
import { apiFetch } from "../../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { useIsFocused } from '@react-navigation/native';
import { Category } from "../../../types/category";
import { useTranslation } from "react-i18next";
const paymentTypeMap: Record<string, number> = {
  Cash: 0,
  Card: 1,
  Transfer: 2,
};

const sortByMap: Record<string, number> = {
  Title: 0,
  Date: 1,
  Cost: 2,
};

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

const currencyMap: Record<string, number | null> = {
  EUR: 0,
  USD: 1
};
export default function ExpensesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const isFocused = useIsFocused();
  // Данни
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true); // Първоначално зареждане
  const [isLoadingNextPage, setIsLoadingNextPage] = useState(false); // За pagination
  
  // Филтри и Сортиране
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Number[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentType] = useState<("Cash" | "Card" | "Transfer")[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [costRange, setCostRange] = useState([0, 9999.99]);
  
  // Статистически данни от DB
  const [lowestCost, setLowestCost] = useState(0);
  const [highestCost, setHighestCost] = useState(0);
  const [earliestDate, setEarliestDate] = useState(new Date());
  const [latestDate, setLatestDate] = useState(new Date());
const { t, i18n } = useTranslation();

  // UI Стейт
  const [isFilterScreenOpened, setIsFilterScreenOpened] = useState(false);
  const [isSortScreenOpened, setIsSortScreenOpened] = useState(false);
  const [selectedSortBy, setSelectedSortBy] = useState("Date");
  const [selectedOrder, setSelectedOrder] = useState("Descending");
  const [filterIconColor, setFilterIconColor] = useState("#3077ceff");
  const [sortIconColor, setSortIconColor] = useState("#3077ceff");
const [hasMore, setHasMore] = useState(true);
  let subcategories: Subcategory[] = [];

  type PaymentType = "Cash" | "Card" | "Transfer";

  const paymentOptions: { value: PaymentType; label: string }[] = [
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Transfer", label: "Transfer" },
  ];

  if (selectedCategoryIds.length === 1) {
    const selectedCategory = categories.find(c => c.id === selectedCategoryIds[0]);
    subcategories = selectedCategory?.subcategories ?? [];
  }

async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setCategories(data);
}

useEffect(() => {
    if (isFocused) {
      loadCategories();
      updateExpensesFromQuery();
    }
  }, [isFocused]);

  function handleAddExpense() {
    router.push("../../(modals)/expenses/addExpense");
  }
  function handleClearSortParams(){
    setSelectedOrder("Descending");
    setSelectedSortBy("Date");
  }

  function handleClearParams(){
    setSearch("");
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
    setSelectedPaymentType([]);
    setCostRange([lowestCost, highestCost]);
    setDateRange([earliestDate, latestDate]);
    setSelectedCurrency("");
  }

  function handleToggleFilterScreen(){
    if(isFilterScreenOpened){
      setFilterIconColor("#3077ceff");
      setIsFilterScreenOpened(false);
    }
    else{
      setFilterIconColor("black");
      setSortIconColor("#3077ceff");
  
      setIsFilterScreenOpened(true);
      setIsSortScreenOpened(false);
    }
  }

  function handleToggleSortScreen(){
    if(isSortScreenOpened){
      setSortIconColor("#3077ceff");
      setIsSortScreenOpened(false);
    }
    else{
      setSortIconColor("black");
      setFilterIconColor("#3077ceff");
  
      setIsSortScreenOpened(true);
      setIsFilterScreenOpened(false);
    }
  }

  const parseDate = (dateString: string) => {
    const fixedString = dateString.includes('.') 
        ? dateString.split('.')[0] + '.' + dateString.split('.')[1].substring(0, 3) + 'Z'
        : dateString;
    return new Date(fixedString);
  };

  const formatCost = (amount: number, currencyCode: string) => {
  const validCurrency = currencyCode || 'EUR'; 
  return new Intl.NumberFormat(i18n.language, { 
    style: 'currency', 
    currency: validCurrency 
  }).format(amount);
};

  const setRangesFromDb = async () => {
    try {
      const [costRes, dateRes] = await Promise.all([
        apiFetch("/Expenses/costRange"),
        apiFetch("/Expenses/dateRange")
      ]);

      if (costRes.ok) {
        const costData = await costRes.json();
        setLowestCost(costData.lowest);
        setHighestCost(costData.highest);
        setCostRange([costData.lowest, costData.highest]);
      }

      if (dateRes.ok) {
        const dateData = await dateRes.json();
        const start = parseDate(dateData.earliest);
        setEarliestDate(start);
        setDateRange([start, parseDate(dateData.latest)]);
      }
    } catch (e) {
      console.error("Error setting ranges:", e);
    }
  };

const formatToLocalISO = (date: Date): string => {
  // Взимаме отместването в милисекунди
  const offset = date.getTimezoneOffset() * 60000;
  
  // Създаваме нова дата, адаптирана спрямо локалното време
  const localDate = new Date(date.getTime() - offset);
  
  // Връщаме ISO стринг, но премахваме "Z" накрая
  // Така ASP.NET няма да го конвертира обратно към UTC
  return localDate.toISOString().slice(0, -1);
};
  
  const updateExpensesFromQuery = async (isInitial = false) => {
    if (isInitial) setIsExpensesLoading(true);
    setHasMore(true); // Нулираме флага при всяка нова филтрация
    const query = new URLSearchParams({
      "Search": search,
      "PageSize": "10",
      "FilterParams.StartDate": formatToLocalISO(dateRange[0]),
      "FilterParams.EndDate": formatToLocalISO(dateRange[1]),
      "FilterParams.FromCost": String(costRange[0]), 
      "FilterParams.ToCost": String(costRange[1]),
      "SortParams.Descending": selectedOrder === "Descending" ? "true" : "false",  
      "SortParams.SortBy": String(sortByMap[selectedSortBy]),  
    });

    selectedCategoryIds.forEach(id => query.append("FilterParams.CategoryIds", id.toString()));
    selectedSubcategoryIds.forEach(id => query.append("FilterParams.SubcategoryIds", id.toString()));
    selectedPaymentTypes.forEach(pt => query.append("FilterParams.PaymentTypes", String(paymentTypeMap[pt])));
    if(selectedCurrency) query.append("FilterParams.Currency", String(currencyMap[selectedCurrency]));

    try {
      const response = await apiFetch(`/Expenses?${query.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
        if (data.length < 10) setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsExpensesLoading(false);
    }
  };

  const loadNextPage = async () => {
if (isLoadingNextPage || !hasMore || expenses.length === 0) return;    
setIsLoadingNextPage(true);

    const lastExpense = expenses[expenses.length - 1];
    let afterValue = "";
    if (selectedSortBy === "Title") afterValue = lastExpense.title;
    else if (selectedSortBy === "Cost") afterValue = String(lastExpense.cost.toLocaleString("bg-BG"));
    else afterValue = new Date(lastExpense.expenseDate + "Z").toISOString();

    const query = new URLSearchParams({
      "Search": search,
      "AfterValue": afterValue,
      "AfterDate": new Date(lastExpense.expenseDate + "Z").toISOString(),
      "PageSize": "10",
      "FilterParams.StartDate": formatToLocalISO(dateRange[0]),
      "FilterParams.EndDate": formatToLocalISO(dateRange[1]),
      "SortParams.Descending": selectedOrder === "Descending" ? "true" : "false",
      "SortParams.SortBy": String(sortByMap[selectedSortBy]),
    });

    // Добавяне на масивите към куерито (същата логика като горе)
    selectedCategoryIds.forEach(id => query.append("FilterParams.CategoryIds", id.toString()));
    selectedSubcategoryIds.forEach(id => query.append("FilterParams.SubcategoryIds", id.toString()));
    selectedPaymentTypes.forEach(pt => query.append("FilterParams.PaymentTypes", String(paymentTypeMap[pt])));
    console.log(query.toString());
    try {
      const response = await apiFetch(`/Expenses?${query.toString()}`);
      if (response.ok) {
        const newExpenses = await response.json();
        if (newExpenses.length === 0) {
        setHasMore(false); // Край на данните
      } else {
        setExpenses(prev => [...prev, ...newExpenses]);
        // Ако новата порция е по-малка от 10, също спираме следващи заявки
        if (newExpenses.length < 10) setHasMore(false);
      }}
    } finally {
      setIsLoadingNextPage(false);
    }
  };

  useEffect(() => {
  setRangesFromDb();
}, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      updateExpensesFromQuery();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [selectedCategoryIds, selectedSubcategoryIds, selectedPaymentTypes, search, dateRange, costRange, selectedOrder, selectedSortBy, selectedCurrency]);

  return (<>
  <View >
    <View style={[styles.row, {padding: 15, backgroundColor: "#3077ceff"}]}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 32, color: "white"}}>{t('expenses')}</Text>
    </View>
    <View style={[styles.row, {marginLeft: 15, marginVertical: 15, width: 65}]}>
        <TouchableOpacity onPress={handleToggleFilterScreen}>
          <FontAwesome6 name="filter" size={30} color={filterIconColor}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleSortScreen}>
          <FontAwesome6 name="sort" size={30} color={sortIconColor}/>
        </TouchableOpacity>
      </View>
    {isFilterScreenOpened && (
      <ScrollView style={styles.filterScreen}>
        <Pressable 
        onPress={() => Keyboard.dismiss()}>
          <View style={styles.header}>
              <TouchableOpacity onPress={handleToggleFilterScreen}>
              <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.headerBtn, {}]}>{`${t('hide')} ▲`}</Text>
              </TouchableOpacity>

<Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[{fontSize: 20, fontWeight: "600"}]}>{t('filters')}</Text>

              <TouchableOpacity onPress={handleClearParams}>
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.headerBtn, {color: "red"}]}>{t('clear')}</Text> 
              </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 18}}>{t('search')}:</Text>
            <TextInput
              style={styles.searchInput}
              onChangeText={newSearch => setSearch(newSearch)}
              value={search}
              onBlur={Keyboard.dismiss}
            />

          </View>

          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 18, marginBottom: 5}}>{t('category')}</Text>
          <View style={{ overflow: "hidden" }}>
            <ScrollView
              horizontal
              style={{marginBottom: 10}}
              showsHorizontalScrollIndicator={false}
            >
              {categories.map(category => (
                <CategoryBox
                  key={category.id}
                  name={t(category.name)}
                  icon={category.icon}
                  fontSize={12}
                  iconSize={30}
                  boxSize={73}
                  color={category.colorHex}
                  selected={selectedCategoryIds.includes(category.id)}
                  onPress={() => {
                    if (selectedCategoryIds.includes(category.id)) {
                      setSelectedCategoryIds(prev => prev.filter(num => num !== category.id));
                    } else {
                      setSelectedCategoryIds(prevCategories => [...prevCategories, category.id]);
                    }
                    
                    // КРИТИЧНО: Винаги нулирай подкатегориите, когато пипаш главните категории
                    setSelectedSubcategoryIds([]); 
                  }}
                />
              ))}
            </ScrollView>
          </View>
          {selectedCategoryIds.length === 1 && ( <>
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 18, marginBottom: 5}}>{t('subcategory')}</Text>
            <View style={{ overflow: "hidden" }}>
              <ScrollView
              horizontal
              style={{marginBottom: 10}}
              showsHorizontalScrollIndicator={false}
              >
              {subcategories.map(subcategory => (
                <CategoryBox
                key={subcategory.id}
                name={t(subcategory.name)}
                icon={subcategory.icon}
                fontSize={12}
                iconSize={30}
                boxSize={73}
                color={subcategory.colorHex}
                selected={selectedSubcategoryIds.includes(subcategory.id)}
                onPress={() => {selectedSubcategoryIds.includes(subcategory.id) ?
                  setSelectedSubcategoryIds(prev => prev.filter(num => num !== subcategory.id)) :
                  setSelectedSubcategoryIds(prevSubcategories => [...prevSubcategories, subcategory.id])
                }}
                />
              ))}
            </ScrollView>
          </View>
        </> )}
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>{t('date_interval')}</Text>
        <View style={styles.row}>
            <DateTimePicker
              locale={i18n.language}
              style={styles.dateInput}
              value={dateRange[0]}
              mode="date" 
              onChange={(event, selectedDate) => {
                if (selectedDate) setDateRange([selectedDate, dateRange[1]]);
              }}
            />
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
            <DateTimePicker
              locale={i18n.language}
              style={styles.dateInput}
              value={dateRange[1]}
              mode="date" 
              onChange={(event, selectedDate) => {
                if (selectedDate) setDateRange([dateRange[0], selectedDate]);
              }}
            />
        </View>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>{t('cost_range')}</Text>
        <View style={styles.row}>
          <TextInput
            style={styles.costInput}
            onChangeText={newCost => setCostRange([Number(newCost), costRange[1]])}
            value={String(costRange[0])}
            keyboardType="decimal-pad"
            onBlur={Keyboard.dismiss}
          />
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
          <TextInput
            style={styles.costInput}
            onChangeText={newCost => setCostRange([costRange[0], Number(newCost)])}
            value={String(costRange[1])}
            keyboardType="decimal-pad"
            onBlur={Keyboard.dismiss}
          />
        </View>
        <MultiSlider
          values={[costRange[0], costRange[1]]}
          sliderLength={Dimensions.get('window').width - 60} // Динамична ширина
          onValuesChange={(values) => setCostRange(values)}
          min={lowestCost}
          max={highestCost}
          step={5}
          allowOverlap={false}
          snapped
          selectedStyle={{ backgroundColor: 'rgb(16, 85, 221)' }} // Твоят син цвят
          markerStyle={{ backgroundColor: 'white', borderWidth: 2, marginLeft: 30, borderColor: 'rgb(16, 85, 221)' }}
        />
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>{t('currency')}</Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <TouchableOpacity
              style={[
                styles.buttonPicker, 
                selectedCurrency === "EUR" && styles.activeButton
              ]}
              onPress={() => selectedCurrency == "EUR" ? setSelectedCurrency("") : setSelectedCurrency("EUR")}
            >
              <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={selectedCurrency === "EUR" ? styles.activeText : styles.textPicker}>
                EUR
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.buttonPicker, 
                selectedCurrency === "USD" && styles.activeButton
              ]}
              onPress={() => selectedCurrency == "USD" ? setSelectedCurrency("") :  setSelectedCurrency("USD")}
            >
              <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={selectedCurrency === "USD" ? styles.activeText : styles.textPicker}>
                USD
              </Text>
            </TouchableOpacity>
          </View>

        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 18, marginBottom: 5 }}>{t('payment_type')}</Text>
        <View style={{marginBottom: 10, flexDirection: "row", gap: 10 }}>
          {paymentOptions.map(opt => {
            const selected = selectedPaymentTypes.includes(opt.value);
            return (
              <Pressable
                key={opt.value}
                onPress={() => {selectedPaymentTypes.includes(opt.value) ?
                  setSelectedPaymentType(prev => prev.filter(num => num !== opt.value)) :
                  setSelectedPaymentType(prevPaymentTypes => [...prevPaymentTypes, opt.value])
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selected ? "#3077ceff" : "white",
                }}
              >
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ fontSize: 16, color: selected ? "white" : "#3077ceff" }}>
                  {t(opt.label)}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </ScrollView>
    )}
    {isSortScreenOpened && (
      <Pressable style={[styles.filterScreen, {height: 230}]}
      onPress={() => Keyboard.dismiss()}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleToggleSortScreen}>
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{`${t('hide')} ▲`}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClearSortParams}>
              <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={[styles.headerBtn, {color: "red"}]}>{t('clear')}</Text> 
            </TouchableOpacity>
        </View>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20}}>{t('sort_by')}</Text>
        <View style={{marginVertical: 10, flexDirection: "row", gap: 15}}>
          <Pressable
                onPress={() => {setSelectedSortBy("Title")
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 15,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selectedSortBy == "Title" ? "#3077ceff" : "white",
                  width: 110
                }}
              >
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize:18, textAlign: "center" ,color: selectedSortBy == "Title" ? "white" : "#3077ceff"}}>{t("Title")}</Text>
            </Pressable>

            <Pressable
                onPress={() => {setSelectedSortBy("Date")
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selectedSortBy == "Date" ? "#3077ceff" : "white",
                  width: 110
                }}
              >
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize:18, textAlign: "center" ,color: selectedSortBy == "Date" ? "white" : "#3077ceff"}}>{t("Date")}</Text>
            </Pressable>

            <Pressable
                onPress={() => {setSelectedSortBy("Cost")
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selectedSortBy == "Cost" ? "#3077ceff" : "white",
                  width: 110
              }}
              >
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize:18, textAlign: "center" ,color: selectedSortBy == "Cost" ? "white" : "#3077ceff"}}>{t("Cost")}</Text>
            </Pressable>
        </View>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20}}>{t('order')}</Text>
        <View style={{marginVertical: 10, flexDirection: "row", gap: 40}}>
          <Pressable
                onPress={() => {setSelectedOrder("Ascending")
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selectedOrder == "Ascending" ? "#3077ceff" : "white",
                  width: 150
                }}
              >
              <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize:18, textAlign: "center" ,color: selectedOrder == "Ascending" ? "white" : "#3077ceff"}}>{t("ascending")}</Text>
            </Pressable>

            <Pressable
                onPress={() => {setSelectedOrder("Descending")
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selectedOrder == "Descending" ? "#3077ceff" : "white",
                  width: 150
                }}
              >
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize:18, textAlign: "center" ,color: selectedOrder == "Descending" ? "white" : "#3077ceff"}}>{t("descending")}</Text>
            </Pressable>
        </View>
      </Pressable>
    )}

{/* Списък с разходи */}
        {isExpensesLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3077ceff" />
            <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ marginTop: 10 }}>{t('loading_expenses')}...</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id.toString()}
            style={styles.expensesContainer}
            onEndReached={loadNextPage}
            onEndReachedThreshold={0.3}
            onTouchStart={() => { if(isFilterScreenOpened) { handleToggleFilterScreen()} if(isSortScreenOpened) { handleToggleSortScreen()}}}
            renderItem={({ item: expense }) => {
              const category = categories.find(c => c.id === expense.categoryId);
              const subcategory = category?.subcategories.find(sc => sc.id === expense.subcategoryId);
              return (
                <ExpenseCard
                  key={expense.id}
                  title={expense.title}
                  amount={formatCost(expense.cost, currencyFromNumber[expense.currency])}
                  date={new Date(expense.expenseDate).toISOString()}
                  categoryName={t(category?.name ?? "Unknown")}
                  categoryEmoji={category?.icon ?? "💰"}
                  categoryColor={category?.colorHex ?? "#eee"}
                  subcategoryEmoji={subcategory?.icon}
                  subcategoryText={subcategory?.name}
                  subcategoryColor={subcategory?.colorHex}
                  onPress={() => router.push(`(modals)/expenses/${expense.id}`)}
                />
              );
            }}
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <FontAwesome6 name="ghost" size={50} color="#ccc" />
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.emptyText}>{t('no_expenses_found')}</Text>
              </View>
            }
            ListFooterComponent={isLoadingNextPage ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}
  </View>
    <AddButton
    onPress={handleAddExpense}/>
  </>
  );
}


const styles = StyleSheet.create({
   row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  filterScreen: { padding: 15, backgroundColor: "white", borderBottomWidth: 1, borderColor: '#ddd', height: 600},
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15 },
  headerBtn: { fontSize: 16, fontWeight: '600', color: "#3077ceff" },
  filterLabel: { fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 5 },
  expensesContainer: { paddingHorizontal: 10, marginTop: 5 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, color: '#555', marginTop: 10, fontWeight: 'bold' },
  emptySubText: { color: '#888', textAlign: 'center' },
  dateInput: {
    marginBottom: 10,
  },
   searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    width: 290,
    marginBottom: 10
  },
  costInput: {
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 100,
    height: 30,
    fontSize: 18,
    alignSelf: 'flex-start', // Shrinks the width to fit the content
    minWidth: 40, 
    backgroundColor: "white"

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
  button: {
    position: 'absolute',
    bottom: 16, 
    right: 16,
    backgroundColor: "#3077ceff",
    height: 60,
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30
  },
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
    backgroundColor: '#FFFFFF', // Бял фон за активния елемент
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
 
});