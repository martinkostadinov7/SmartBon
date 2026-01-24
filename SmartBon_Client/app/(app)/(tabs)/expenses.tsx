import { View, ScrollView, StyleSheet, Text, TouchableOpacity, TextInput, Keyboard, Pressable, Dimensions } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { useCategories } from "../../context/CategoriesContext";
import { Expense } from "../../types/expense";
import { ExpenseCard } from "../../components/expense";
import { AddButton } from "../../components/addButton";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { CategoryBox } from "../../components/categoryBox";
import { Subcategory } from "../../types/subcategory";
import { apiFetch } from "../../services/api";
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSlider from '@ptomasroos/react-native-multi-slider';

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


export default function ExpensesScreen() {
  const { categories } = useCategories();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Number[]>([]);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Number[]>([]);
  const [filterIconColor, setFilterIconColor] = useState("white");
  const [sortIconColor, setSortIconColor] = useState("white");
  const [isFilterScreenOpened, setIsFilterScreenOpened] = useState(false);
  const [isSortScreenOpened, setIsSortScreenOpened] = useState(false);
  const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
  const [search, setSearch] = useState("");
  const [earliestDate, setEarliestDate] = useState(new Date());
  const [latestDate, setLatestDate] = useState(new Date());
  const [lowestCost, setLowestCost] = useState(0);
  const [highestCost, setHighestCost] = useState(0);
  const [selectedSortBy, setSelectedSortBy] = useState("Date");
  const [selectedOrder, setSelectedOrder] = useState("Descending");

  const [costRange, setCostRange] = useState([0, 9999.99]); // Начална и крайна цена
  let subcategories: Subcategory[] = [];

  type PaymentType = "Cash" | "Card" | "Transfer";

  const paymentOptions: { value: PaymentType; label: string }[] = [
  { value: "Cash", label: "Cash" },
  { value: "Card", label: "Card" },
  { value: "Transfer", label: "Transfer" },
  ];

  const [selectedPaymentTypes, setSelectedPaymentType] = useState<PaymentType[]>([]);

  if (selectedCategoryIds.length === 1) {
    const selectedCategory = categories.find(c => c.id === selectedCategoryIds[0]);
    subcategories = selectedCategory?.subcategories ?? [];
  }

  const loadExpenses = useCallback(async () => {
    fetchData();
    setRangesFromDb();
  }, []);

  async function setRangesFromDb(){
    const costResponse = await apiFetch("/Expenses/costRange");
    if (!costResponse.ok) {
      throw new Error("Failed to load cost range");
    }
    const costData = await costResponse.json();
    console.log(costData);
    setLowestCost(costData.lowest);
    setHighestCost(costData.highest);
    setCostRange([costData.lowest, costData.highest]);

    const dateResponse = await apiFetch("/Expenses/dateRange");
    if (!dateResponse.ok) {
      throw new Error("Failed to load date range");
    }
    const dataData = await dateResponse.json();
    console.log(dataData);
    const parseDate = (dateString: string) => {
    const fixedString = dateString.includes('.') 
        ? dateString.split('.')[0] + '.' + dateString.split('.')[1].substring(0, 3) + 'Z'
        : dateString;
    return new Date(fixedString);
    };
    setEarliestDate(parseDate(dataData.earliest));
    setLatestDate(new Date());
    setDateRange([parseDate(dataData.earliest), new Date()]);
  }

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  function handleAddExpense() {
    router.push("expenses/addExpense");
  }

  function handleExpenseView(id: number) {
    router.push(`(modals)/expenses/${id}`);
  }
  
  function handleClearParams(){
    setSearch("");
    setSelectedCategoryIds([]);
    setSelectedSubcategoryIds([]);
    setSelectedPaymentType([]);
    setCostRange([lowestCost, highestCost]);
    setDateRange([earliestDate, latestDate]);
    setSelectedOrder("Descending");
    setSelectedSortBy("Date");
  }

  function handleToggleFilterScreen(){
    if(isFilterScreenOpened){
      setFilterIconColor("white");
      setIsFilterScreenOpened(false);
    }
    else{
      setFilterIconColor("black");
      setSortIconColor("white");
  
      setIsFilterScreenOpened(true);
      setIsSortScreenOpened(false);
    }
  }

  function handleToggleSortScreen(){
    if(isSortScreenOpened){
      setSortIconColor("white");
      setIsSortScreenOpened(false);
    }
    else{
      setSortIconColor("black");
      setFilterIconColor("white");
  
      setIsSortScreenOpened(true);
      setIsFilterScreenOpened(false);
    }
  }
  const fetchData = async () => {
    const query = new URLSearchParams({
      "Search": search,
      "FilterParams.StartDate": dateRange[0].toISOString(),
      "FilterParams.EndDate": dateRange[1].toISOString(),
      "FilterParams.FromCost": String(costRange[0]), 
      "FilterParams.ToCost": String(costRange[1]),
      "SortParams.Descending": selectedOrder === "Descending" ? "true" : "false",  
      "SortParams.SortBy": String(sortByMap[selectedSortBy]),  
    });

    selectedCategoryIds.forEach(id => {
        query.append("FilterParams.CategoryIds", id.toString());
    });

    selectedSubcategoryIds.forEach(id => {
        query.append("FilterParams.SubcategoryIds", id.toString());
    });

    selectedPaymentTypes.forEach(paymentType => {
        query.append("FilterParams.PaymentTypes", String(paymentTypeMap[paymentType]));
    });

    const response = await apiFetch(`/Expenses?${query.toString()}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
      throw new Error("Failed to load expenses");
    }
    await response.json().then(setExpenses); 
  }
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
    fetchData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
}, [selectedCategoryIds, selectedSubcategoryIds,selectedPaymentTypes ,search, dateRange, costRange, selectedOrder, selectedSortBy]);


  return (<>
  <View style={{backgroundColor: "#e1ebffff"}}>
    <View style={[styles.row, {padding: 15, backgroundColor: "#3077ceff"}]}>
      <Text style={{fontSize: 32, color: "white"}}>Expenses</Text>
      <View style={[styles.row, {width: 65}]}>
        <TouchableOpacity onPress={handleToggleFilterScreen}>
          <FontAwesome6 name="filter" size={30} color={filterIconColor}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleToggleSortScreen}>
          <FontAwesome6 name="sort" size={30} color={sortIconColor}/>
        </TouchableOpacity>
      </View>
    </View>
    {isFilterScreenOpened && (
      <Pressable style={styles.filterScreen}
      onPress={() => Keyboard.dismiss()}>
         <View style={styles.header}>
            <TouchableOpacity onPress={handleToggleFilterScreen}>
            <Text style={styles.headerBtn}>Apply</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClearParams}>
              <Text style={[styles.headerBtn, {color: "red"}]}>Clear</Text> 
            </TouchableOpacity>
        </View>
        <View style={styles.row}>
          <Text style={{fontSize: 18}}>Search:</Text>
          <TextInput
            style={styles.searchInput}
            onChangeText={newSearch => setSearch(newSearch)}
            value={search}
            onBlur={Keyboard.dismiss}
          />

        </View>

        <Text style={{fontSize: 18, marginBottom: 5}}>Category</Text>
        <View style={{ overflow: "hidden" }}>
          <ScrollView
            horizontal
            style={{marginBottom: 10}}
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(category => (
              <CategoryBox
                key={category.id}
                name={category.name}
                icon={category.icon}
                fontSize={12}
                iconSize={30}
                boxSize={73}
                color={category.colorHex}
                selected={selectedCategoryIds.includes(category.id)}
                onPress={() => {
                  selectedCategoryIds.includes(category.id) ? 
                  setSelectedCategoryIds(prev => prev.filter(num => num !== category.id)) :
                  setSelectedCategoryIds(prevCategories => [...prevCategories, category.id]);
                }}
              />
            ))}
          </ScrollView>
        </View>
        {selectedCategoryIds.length === 1 && ( <>
          <Text style={{fontSize: 18, marginBottom: 5}}>Subcategory</Text>
          <View style={{ overflow: "hidden" }}>
            <ScrollView
            horizontal
            style={{marginBottom: 10}}
            showsHorizontalScrollIndicator={false}
            >
            {subcategories.map(subcategory => (
              <CategoryBox
              key={subcategory.id}
              name={subcategory.name}
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
      <Text style={{ fontSize: 18, marginBottom: 5 }}>Date Interval</Text>
      <View style={styles.row}>
          <DateTimePicker
            style={styles.dateInput}
            value={dateRange[0]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setDateRange([selectedDate, dateRange[1]]);
            }}
          />
          <Text style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
          <DateTimePicker
            style={styles.dateInput}
            value={dateRange[1]}
            mode="date" 
            onChange={(event, selectedDate) => {
              if (selectedDate) setDateRange([dateRange[0], selectedDate]);
            }}
          />
      </View>
      <Text style={{ fontSize: 18, marginBottom: 5 }}>Cost Range</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.costInput}
          onChangeText={newCost => setCostRange([Number(newCost), costRange[1]])}
          value={String(costRange[0])}
          keyboardType="decimal-pad"
          onBlur={Keyboard.dismiss}
        />
        <Text style={{ fontSize: 18, marginBottom: 5 }}>-</Text>
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
        markerStyle={{ backgroundColor: 'white', borderWidth: 2, marginLeft: 15, borderColor: 'rgb(16, 85, 221)' }}
      />
      <Text style={{ fontSize: 18, marginBottom: 5 }}>Payment Type</Text>
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
              <Text style={{ fontSize: 16, color: selected ? "white" : "#3077ceff" }}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Pressable>
    )}
    {isSortScreenOpened && (
      <Pressable style={styles.filterScreen}
      onPress={() => Keyboard.dismiss()}>
        <View style={styles.header}>
            <TouchableOpacity onPress={handleToggleSortScreen}>
            <Text style={styles.headerBtn}>Apply</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClearParams}>
              <Text style={[styles.headerBtn, {color: "red"}]}>Clear</Text> 
            </TouchableOpacity>
        </View>
        <Text style={{fontSize: 20}}>Sort By</Text>
        <View style={{marginVertical: 10, flexDirection: "row", gap: 22 }}>
          <Pressable
                onPress={() => {setSelectedSortBy("Title")
                }}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  borderColor: "#3077ceff",
                  backgroundColor: selectedSortBy == "Title" ? "#3077ceff" : "white",
                  width: 100
                }}
              >
                <Text style={{fontSize:18, textAlign: "center" ,color: selectedSortBy == "Title" ? "white" : "#3077ceff"}}>Title</Text>
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
                  width: 100
                }}
              >
                <Text style={{fontSize:18, textAlign: "center" ,color: selectedSortBy == "Date" ? "white" : "#3077ceff"}}>Date</Text>
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
                  width: 100
              }}
              >
                <Text style={{fontSize:18, textAlign: "center" ,color: selectedSortBy == "Cost" ? "white" : "#3077ceff"}}>Cost</Text>
            </Pressable>
        </View>
        <Text style={{fontSize: 20}}>Order</Text>
        <View style={{marginVertical: 10, flexDirection: "row", gap: 40 }}>
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
                <Text style={{fontSize:18, textAlign: "center" ,color: selectedOrder == "Ascending" ? "white" : "#3077ceff"}}>Ascending</Text>
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
                <Text style={{fontSize:18, textAlign: "center" ,color: selectedOrder == "Descending" ? "white" : "#3077ceff"}}>Descending</Text>
            </Pressable>
        </View>
      </Pressable>
    )}
    <ScrollView style={styles.expensesContainer}
    onTouchEndCapture={() => {setIsFilterScreenOpened(false); setFilterIconColor("white")}}>
      {expenses.map(expense => {
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
  </View>
    <AddButton
    onPress={handleAddExpense}/>
  </>
  );
}


const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  row:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterScreen:{
    padding: 15,
    borderWidth: 2,
    borderRadius: 10,
    margin: 5,
    backgroundColor: "white"
  },
  searchInput: {
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 10,
    width: 280,
    height: 30,
    fontSize: 18
  },
  dateInput: {
    marginBottom: 10,
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

  },
  expensesContainer: {
    padding: 16
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
  }
});
