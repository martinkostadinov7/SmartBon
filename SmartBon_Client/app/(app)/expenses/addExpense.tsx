import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Pressable, Keyboard, Alert } from 'react-native'
import React, { useCallback, useState } from 'react'
import { useCategories } from "../../context/CategoriesContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CategoryBox } from '../../components/categoryBox';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../services/api';
import * as SecureStore from "expo-secure-store";
import { Currency } from '../../types/expense';

const paymentTypeMap: Record<string, number> = {
  Cash: 0,
  Card: 1,
  Transfer: 2,
};

const currencyMap: Record<string, number> = {
  EUR: 0,
  USD: 1
};

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

export default function AddExpense() {
  const { categories } = useCategories();
  const { title: prefilledTitle, amount: prefilledAmount, description: prefilledDescription, goalId: goalId } = useLocalSearchParams();
    const [title, setTitle] = useState(String(prefilledTitle) || "");
    const [date, setDate] = useState(new Date());
    const [cost, setCost] = useState(String(prefilledAmount) || "");
    const [description, setDescription] = useState(String(prefilledDescription) || "");
    const [selectedCategoryId, setSelectedCategoryId] = useState(-1);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(-1);
    const [userDefaultCurrency, setUserDefaultCurrency] = useState("Unidentified");
    const [selectedCurrency, setSelectedCurrency] = useState(userDefaultCurrency ? userDefaultCurrency : "EUR");
    type PaymentType = "Cash" | "Card" | "Transfer";

    const paymentOptions: { value: PaymentType; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "Transfer", label: "Transfer" },
    ];

    const [paymentType, setPaymentType] = useState<PaymentType>("Cash");

    function handleCloseScreen(){
        setTitle("");
        setDate(new Date());
        setDescription("");
        setCost("");
        setPaymentType("Cash");
        setSelectedCategoryId(-1);
        setSelectedCategoryId(-1);
        router.back();
    }

 async function handleRealiseGoal(){  
     try {
        const response = await apiFetch(`/Goals/${goalId}/realise`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            }
        });
        if (!response.ok) 
        {
            const errorData = await response.json(); 
            throw new Error(errorData.message || "An unknown error occurred");
        }
    } catch (e: any) {
  
    Alert.alert(
        "Error",
        e?.message,
        [{ text: "OK" }]
        );
        console.log("Network/API error:", e?.message.message ?? e);
    }
   }

    async function handleAddExpense() {
        const normalizedCost = cost.replace(",", ".").trim();
        const costNumber = parseFloat(normalizedCost);

        if(!title || !cost || selectedCategoryId == -1){
            Alert.alert(
            "Input error",
            "Fill out title, cost category fields!",
            [{ text: "OK" }]
            );
        }

        const expense = {
            Title: title.trim(),
            Description: description.trim(),
            Cost: costNumber,
            CategoryId: selectedCategoryId,
            SubcategoryId: selectedSubcategoryId > 0 ? selectedSubcategoryId : null,
            ExpenseDate: date.toISOString(),
            PaymentType: paymentTypeMap[paymentType],
            Currency: currencyMap[selectedCurrency || "EUR"]
        };

        try {
            const response = await apiFetch("/Expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
            });

            if (!response.ok) return;

            if(goalId) {
              handleRealiseGoal();
            }

            handleCloseScreen();
        } catch (e: any) {
            console.log("Network/API error:", e?.message ?? e);
        }
    }

    useFocusEffect(
         useCallback(() => {
           const fetchProfile = async () => {
             try {
               const response = await apiFetch(`/Users/me`);
               if (!response.ok) throw new Error("Failed");
               const profileData = await response.json();
               const currencyStr = currencyFromNumber[profileData.defaultCurrency];
                setUserDefaultCurrency(currencyStr);
                setSelectedCurrency(currencyStr);

             } catch (error) {
               console.error(error);
             }
           };
       
       
           fetchProfile();
           return () => {}; 
         }, []) 
       );

    function handleCategoryAdd(){
        router.push("(modals)/categories/addCategory");
    }

    function handleSubcategoryAdd(){
        router.push({
            pathname: "(modals)/categories/addSubcategory",
            params: { categoryId: String(selectedCategoryId) },
            }); 
    }

    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    const subcategories = selectedCategory?.subcategories ?? [];
    return (
  <>
    <View style={{ flex: 1 }}>
      <TouchableOpacity onPress={handleCloseScreen}>
        <Text style={styles.arrow}>←</Text>
      </TouchableOpacity>

      <Text style={styles.heading}>Add expense</Text>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text style={styles.text}>Title</Text>
        <TextInput
          style={styles.titleInput}
          onChangeText={newTitle => setTitle(newTitle)}
          value={title}
          onBlur={Keyboard.dismiss}
        />

        <Text style={styles.text}>Cost</Text>
        <TextInput
          style={styles.costInput}
          onChangeText={newCost => setCost(newCost)}
          value={cost}
          keyboardType="decimal-pad"
          onBlur={Keyboard.dismiss}
        />

        <Text style={styles.text}>Description</Text>
        <TextInput
          style={styles.descriptionInput}
          onChangeText={newDescription => setDescription(newDescription)}
          value={description}
          multiline
        />

        <Text style={styles.text}>Date</Text>
        <DateTimePicker
          style={styles.dateInput}
          value={date}
          mode="datetime"
          onChange={(event, selectedDate) => {
            if (selectedDate) setDate(selectedDate);
          }}
        />

        <Text style={styles.text}>Category</Text>
        <View style={{ overflow: "hidden" }}>
          <ScrollView
            horizontal
            style={{ marginLeft: 20, marginBottom: 10, marginRight: 20 }}
            showsHorizontalScrollIndicator={false}
          >
            {categories.map(category => (
              <CategoryBox
                key={category.id}
                name={category.name}
                icon={category.icon}
                fontSize={16}
                color={category.colorHex}
                selected={selectedCategoryId === category.id}
                onPress={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedSubcategoryId(-1);
                }}
              />
            ))}
            <CategoryBox
                key={-2}
                name="Add"
                icon="+"
                color={"#FFFFFF"}
                fontSize={16}
                selected={false}
                onPress={handleCategoryAdd}
              />
          </ScrollView>
        </View>
        {selectedCategoryId != -1 && (
            <>
            <Text style={styles.text}>Subcategory</Text>

            <View style={{ overflow: "hidden" }}>
                <ScrollView
                horizontal
                style={{ marginLeft: 20, marginBottom: 10, marginRight: 20 }}
                showsHorizontalScrollIndicator={false}
                >
                {subcategories.map(subcategory => (
                    <CategoryBox
                        key={subcategory.id}
                        name={subcategory.name}
                        icon={subcategory.icon}
                        fontSize={16}
                        color={subcategory.colorHex}
                        selected={selectedSubcategoryId === subcategory.id}
                        onPress={() => setSelectedSubcategoryId(subcategory.id)}
                    />
                ))}
                <CategoryBox
                    key={-2}
                    name="Add"
                    icon="+"
                    color={"#FFFFFF"}
                    fontSize={16}
                    selected={false}
                    onPress={handleSubcategoryAdd}
                />
                </ScrollView>
            </View>
            </>
        )}
        <Text style={styles.text}>Currency</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity
            style={[
              styles.buttonPicker, 
              selectedCurrency === "EUR" && styles.activeButton
            ]}
            onPress={() => setSelectedCurrency("EUR")}
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
            onPress={() => setSelectedCurrency("USD")}
          >
            <Text style={selectedCurrency === "USD" ? styles.activeText : styles.textPicker}>
              USD
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.text}>Payment Type</Text>
        <View style={{ marginLeft: 20, marginBottom: 10, flexDirection: "row", gap: 10 }}>
          {paymentOptions.map(opt => {
            const selected = paymentType === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setPaymentType(opt.value)}
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
        
      </ScrollView>
    </View>

    <TouchableOpacity style={styles.button} onPress={handleAddExpense}>
      <Text style={{ color: "white", fontSize: 25 }}>Add expense</Text>
    </TouchableOpacity>
  </>
);

}

export const styles = StyleSheet.create({
  currencyPicker:{
    width:70,
    marginLeft: 15,
    marginTop: 0,
  },
    button: {
    position: "absolute",
    bottom: 25,
    backgroundColor: "#3077ceff",
    height: 40,
    width: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    alignSelf: "center",
    margin: 10
  },
    arrow:{
     color: 'gray', 
     fontSize: 30,
     marginLeft: 10,
     marginTop: 10,
     marginBottom: 10
  },
    heading: {
    marginBottom: 10,
    marginLeft: 20,
    fontSize: 36
  },
  text: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 24
  },
  titleInput: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 250,
    height: 30,
    fontSize: 18

  },
  costInput: {
    marginLeft: 20,
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
  dateInput: {
    marginLeft: 10,
    marginBottom: 10,
  },
  descriptionInput: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 350,
    height: 100,  
    fontSize: 18

  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7', // Светло сиво за фон (iOS системно сиво)
    borderRadius: 12,
    padding: 4,
    marginVertical: 10,
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