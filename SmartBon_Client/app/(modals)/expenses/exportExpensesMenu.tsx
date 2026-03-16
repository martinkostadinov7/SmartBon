import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TextInput,
  Keyboard,
  Dimensions
} from "react-native";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { CategoryBox } from "../../components/categoryBox";
import { useCategories } from "../../context/CategoriesContext";
import { Currency, Expense } from "../../types/expense";
import { Subcategory } from "../../types/subcategory";
import { apiFetch } from "../../services/api";
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

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

export default function ExportExpensesMenu() {
 const { categories } = useCategories();
   const [selectedCategoryIds, setSelectedCategoryIds] = useState<Number[]>([]);
   const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<Number[]>([]);
   const [filterIconColor, setFilterIconColor] = useState("#3077ceff");
   const [sortIconColor, setSortIconColor] = useState("#3077ceff");
   const [isFilterScreenOpened, setIsFilterScreenOpened] = useState(false);
   const [isSortScreenOpened, setIsSortScreenOpened] = useState(false);
   const [dateRange, setDateRange] = useState<[Date, Date]>([new Date(), new Date()]);
   const [search, setSearch] = useState("");
   const [earliestDate, setEarliestDate] = useState(new Date());
   const [latestDate, setLatestDate] = useState(new Date());
   const [lowestCost, setLowestCost] = useState(0);
   const [highestCost, setHighestCost] = useState(0);
   const [selectedCurrency, setSelectedCurrency] = useState("");
 
   let afterValue = "";
   let afterDate = "";
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

  async function handleExportExpenses(){
    if (selectedCategoryIds.length > 1) {
          setSelectedSubcategoryIds([]);
        }
        const query = new URLSearchParams({
          "Search": search,
          "AfterValue": "",
          "AfterDate": "",
          "PageSize": "10",
          "FilterParams.StartDate": dateRange[0].toISOString(),
          "FilterParams.EndDate": dateRange[1].toISOString(),
          "FilterParams.FromCost": String(costRange[0]), 
          "FilterParams.ToCost": String(costRange[1]),
          "SortParams.Descending": "true",  
          "SortParams.SortBy": "1",  
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
    
        
        if(selectedCurrency != ""){
          query.append("FilterParams.Currency", String(currencyMap[selectedCurrency]));
        }
    
        console.log()
        try {
        const response = await apiFetch(`/expenses/export?${query.toString()}`);

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const contentDisposition = response.headers.get("Content-Disposition");
    let filename = `report-${Date.now()}.csv`; 

    if (contentDisposition) {
    const parts = contentDisposition.split(';');
    
    for (let part of parts) {
        part = part.trim();
        if (part.startsWith('filename=')) {
            filename = part.split('=')[1].replace(/["']/g, '');
            break;
        }
    }
}
    console.log(filename);
    const csvString = await response.text();
    
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, csvString, {
            encoding: FileSystem.EncodingType.UTF8,
        });

        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri);
        } else {
            Alert.alert("Error", "Sharing is not available");
        }

    } catch (error) {
        console.error("Export Error:", error);
        Alert.alert("Грешка", "Неуспешен експорт на данни.");
    }
  }

  return (
    <>
      <Pressable style={styles.overlay} onPress={() => router.back()}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.wrapper}
        >
          <Pressable style={styles.container} onPress={() => {}}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.headerBtn}>Cancel</Text>
              </TouchableOpacity>

              <Text style={styles.title}>Export expenses</Text>

              <TouchableOpacity onPress={handleExportExpenses}>
                <Text style={styles.headerBtn}>Export</Text>
              </TouchableOpacity>
            </View>
<ScrollView showsVerticalScrollIndicator={false}>

<Pressable style={styles.filterScreen}
      onPress={() => Keyboard.dismiss()}>
         <View style={styles.header}>

            <TouchableOpacity onPress={handleClearParams}>
              <Text style={[styles.headerBtn, {color: "red"}]}>Clear</Text> 
            </TouchableOpacity>

              <Text style={[styles.title,{fontSize: 16}]}>Filters</Text>

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
      
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={[
              styles.buttonPicker, 
              selectedCurrency === "EUR" && styles.activeButton
            ]}
            onPress={() => selectedCurrency == "EUR" ? setSelectedCurrency("") : setSelectedCurrency("EUR")}
          >
            <Text style={selectedCurrency === "EUR" ? styles.activeText : styles.textPicker}>
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
            <Text style={selectedCurrency === "USD" ? styles.activeText : styles.textPicker}>
              USD
            </Text>
          </TouchableOpacity>
        </View>

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
</ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </>
  );
}


const styles = StyleSheet.create({ 
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
    height: 530,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 20, fontWeight: "600" },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  label: { marginTop: 12, marginBottom: 6, fontSize: 16 },
  row:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterScreen:{
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#efefef"
  },
  searchInput: {
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 2,
    borderRadius: 10,
    width: 280,
    height: 30,
    fontSize: 18,
    backgroundColor: "white"
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
    backgroundColor: "white"

  },
  expensesContainer: {
    margin: 10
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
