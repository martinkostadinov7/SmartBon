import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Pressable, Keyboard, Alert } from 'react-native'
import React, { useState } from 'react'
import { useCategories } from "../../context/CategoriesContext";
import DateTimePicker from '@react-native-community/datetimepicker';
import { CategoryBox } from '../../components/categoryBox';
import { router } from 'expo-router';
import { apiFetch } from '../../services/api';

const paymentTypeMap: Record<string, number> = {
  Cash: 0,
  Card: 1,
  Bank_Transfer: 2,
};

export default function AddExpense() {
    const { categories } = useCategories();
    
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date());
    const [cost, setCost] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState(-1);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(-1);

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
        };

        try {
            const response = await apiFetch("/Expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
            });

            console.log("REQUEST BODY:", expense);
            console.log("STATUS:", response.status);
            console.log("BODY:", await response.text());

            if (!response.ok) return;

            console.log("Expense added successfully ✅");
            handleCloseScreen();
        } catch (e: any) {
            console.log("Network/API error:", e?.message ?? e);
        }
    }

    function handleCategoryAdd(){
        router.push("../categories/addCategory");
    }

    function handleSubcategoryAdd(){
        router.push({
            pathname: "../categories/addSubcategory",
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
                    selected={selectedSubcategoryId === subcategory.id}
                    onPress={() => setSelectedSubcategoryId(subcategory.id)}
                    />
                ))}
                <CategoryBox
                key={-2}
                name="Add"
                icon="+"
                selected={false}
                onPress={handleSubcategoryAdd}
                />
                </ScrollView>
            </View>
            </>
        )}

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

const styles = StyleSheet.create({
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
    fontSize: 30
  },
  text: {
    marginLeft: 20,
    marginBottom: 10,
    fontSize: 20
  },
  titleInput: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 250,
    height: 30    
  },
  costInput: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 60,
    height: 30    
  },
  dateInput: {
    marginLeft: 10,
    marginBottom: 10
  },
  descriptionInput: {
    marginLeft: 20,
    marginBottom: 10,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 250,
    height: 100    
  }
});
