import { View, Text, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Modal, TextInput, Keyboard, Alert, Platform, ScrollView} from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { Currency, Expense, PaymentType } from '../../../types/expense';
import { CategoryBox } from '../../../components/categoryBox';
import { useCategories } from '../../../context/CategoriesContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiFetch } from '../../../services/api';

const paymentTypeFromNumber: Record<number, PaymentType> = {
  0: "Cash",
  1: "Card",
  2: "Transfer",
};

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
export default function ExpenseViewScreen() {
    const { id } = useLocalSearchParams<{ id: string}>();
    const [expense, setExpense] = useState<Expense | null>(null);
    const { categories, tempCategory, setTempCategory } = useCategories();
    const [title, setTitle] = useState("");
    const [date, setDate] = useState(new Date());
    const [cost, setCost] = useState("");
    const [description, setDescription] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [categoryId, setCategoryId] = useState(-1);
    const [screenHeight, setScreenHeight] = useState(685);
    const [selectedCurrency, setSelectedCurrency] = useState("EUR");

    const paymentOptions: { value: PaymentType; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "Transfer", label: "Transfer" },
    ];

    const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
    const currentPaymentLabel = paymentOptions.find(p => p.value === paymentType)?.label ?? paymentType;

   useEffect(() => {(async () => {
      const response = await apiFetch(`/Expenses/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load expense");
      }
      const expense = await response.json();
      setExpense(expense);
      setTitle(expense?.title ?? "undefined");
      setDate(new Date(expense?.expenseDate) ?? new Date());
      setCost(String(expense?.cost));
      setDescription(expense?.description ?? null);
      setPaymentType(paymentTypeFromNumber[expense?.paymentType]);
      setSelectedCurrency(currencyFromNumber[expense?.currency])
    })();
   }, [id]);

    const currentCategoryId = tempCategory.cid !== -1 ? tempCategory.cid : expense?.categoryId;
    const currentSubcategoryId = tempCategory.sid !== -1 ? tempCategory.sid : expense?.subcategoryId;
    const category = categories.find(c => c.id === currentCategoryId);
    const subCategory = category?.subcategories.find(s => s.id === currentSubcategoryId) || null;

    function handleChangeCategory(): void {
      router.push("../categories/changeCategory");
    }

    function handleChangeSubcategory(): void {
      router.push({
          pathname: "../categories/changeSubcategory",
          params: { 
              categoryId: currentCategoryId
          }
      });
    }

    async function handleSaveExpense(){
      const normalizedCost = cost.replace(",", ".").trim();
      const costNumber = parseFloat(normalizedCost);

      if(!title || !cost){
          Alert.alert(
          "Input error",
          "Fill out title and cost fields!",
          [{ text: "OK" }]
          );
      }

      console.log(currencyMap[selectedCurrency]);

      const expenseToUpdate = {
          Title: title.trim(),
          Description: description ? description.trim() : null,
          Cost: costNumber,
          CategoryId: currentCategoryId,
          SubcategoryId: subCategory ? currentSubcategoryId : null,
          ExpenseDate: date.toISOString(),
          PaymentType: paymentTypeMap[paymentType],
          Currency: currencyMap[selectedCurrency]
      };

      try {
          const response = await apiFetch(`/Expenses/${id}`, {
          method: "PUT",
          headers: {
              "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseToUpdate),
          });
          if (!response.ok) 
            {
              console.log(await response.json())
              return;
            }
          setIsEditing(false);
          handleCloseScreen();
      } catch (e: any) {

        Alert.alert(
          "Error",
          "An error occured while trying to save the expense!",
          [{ text: "OK" }]
          );
          console.log("Network/API error:", e?.message ?? e);
      }
      setTempCategory({ cid: -1, sid: -1 });
    }

    function handleCloseScreen(){
      router.back();
    }
    
      async function handleDeleteExpense() {
  Alert.alert(
    "Delete Expense",
    "Are you sure you want to delete this record?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Изпращаме само ЕДНА заявка
            const response = await apiFetch(`/Expenses/${id}`, {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              }
            });

            if (response.ok) {
              // 2. Логика само при успех
              setIsEditing(false);
              router.back(); 
              // или handleCloseScreen(); ако тя прави същото
            } else {
              Alert.alert("Error", "Could not delete the expense.");
            }
          } catch (e) {
            // 3. Логика при мрежова грешка
            Alert.alert("Error", "An error occurred while trying to delete the expense!");
            console.log("Network/API error:", e);
          }
        }
      }
    ]
  );
} 
  return (
    <>
        <Pressable style={styles.overlay} onPress={handleCloseScreen}>
        <KeyboardAvoidingView
            style={styles.wrapper}
        >
            <Pressable style={[styles.container, {height: screenHeight}]} onPress={() => Keyboard.dismiss()}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCloseScreen}>
                <Text style={styles.headerBtn}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={isEditing ? handleSaveExpense : () => setIsEditing(true)}>
                 <Text style={styles.headerBtn}>{isEditing ? "Save" : "Edit"}</Text> 
                </TouchableOpacity>
            </View>
            <View>
              <View style={styles.row}>
                <CategoryBox 
                  name={category?.name ?? "Undefined"} 
                  icon={category?.icon ?? "Undefined"} 
                  color={category?.colorHex ?? "Undefined"} 
                  selected={false} 
                  boxSize={110}
                  iconSize={50}
                  fontSize={16}
                  pressable = {isEditing}
                  onPress={handleChangeCategory}>
                </CategoryBox>
                <View style={{flex : 1, justifyContent: "space-between", marginLeft: 12, height: 100}}>
                  {isEditing ?
                  <TextInput
                    style={styles.titleInput}
                    onChangeText={newTitle => setTitle(newTitle)}
                    value={title}
                    onBlur={Keyboard.dismiss}
                  /> :
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.titleInput] }>{title}</Text>}
                  
                  {subCategory != null && (
                    <CategoryBox 
                      name={subCategory?.name ?? "Undefined"} 
                      icon={subCategory?.icon ?? "Undefined"} 
                      color={subCategory?.colorHex ?? "Undefined"} 
                      selected={false} 
                      boxSize={55}
                      iconSize={20}
                      fontSize={10}
                      pressable = {isEditing}
                      onPress={handleChangeSubcategory}>
                    </CategoryBox>
                  )}
                </View>
              </View>
              <Text style={{fontSize: 18, marginTop: 10}}>Cost</Text>

              {isEditing ?
                  <TextInput
                    style={styles.costInput}
                    onChangeText={newCost => setCost(newCost)}
                    value= {String(cost)}
                    keyboardType="decimal-pad"
                    onBlur={Keyboard.dismiss}
                    multiline={false}
                  /> :
                  <Text style={[styles.costInput]}>{cost}</Text>
                  }

              <Text style={{fontSize: 18, borderWidth: 0, marginTop: 10}}>Description</Text>

              {isEditing ?
                  <TextInput
                    style={styles.descriptionInput}
                    onChangeText={newDescription => setDescription(newDescription)}
                    value={description}
                    multiline
                    onFocus={() => setScreenHeight(685)}
                    onBlur={() => setScreenHeight(685)}
                  /> :
                  <Text style={[styles.descriptionInput]}>{description}</Text>
                  }

              <Text style={{fontSize: 18, borderWidth: 0, marginTop: 10}}>Date</Text>
              {isEditing ? (
                <DateTimePicker
                  style={styles.dateInput}
                  value={new Date(date)} // Подсигури се, че е Date обект
                  mode="datetime"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setDate(selectedDate);
                  }}
                />
              ) : (
                <Text style={styles.date}>
                  {new Date(date).toLocaleString('bg-BG')}
                </Text>
              )}

              <Text style={{fontSize: 18, borderWidth: 0}}>Currency</Text>
              {isEditing ? (
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
              ) : (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View
                  style={[
                    styles.buttonPicker, styles.activeButton
                  ]}
                >
                  <Text style={styles.activeText}>
                    {selectedCurrency}
                  </Text>
                </View>
                <View
                  style={styles.buttonPicker}
                >
                </View>
              </View>
              )}


              <Text style={{fontSize: 18, borderWidth: 0}}>Payment Type</Text>
              {isEditing ? (
                <View style={{ marginTop: 10, flexDirection: "row", gap: 10}}>
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
                        {opt.value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              ) : (
                <View style={{ marginTop: 10, flexDirection: "row", gap: 10}}>
                  <Pressable
                    key={paymentType}
                    onPress={() => setPaymentType(paymentType)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 14,
                      borderRadius: 20,
                      borderWidth: 1.5,
                      borderColor: "white",
                      backgroundColor: "#3077ceff"
                      }}
                    >
                    <Text style={{ fontSize: 16, color: "white"}}>
                      {paymentType}
                    </Text>
                  </Pressable>
                </View>
              )}
              <TouchableOpacity style={styles.button} onPress={handleDeleteExpense}>
                <Text style={{ color: "white", fontSize: 20 }}>Delete</Text>
              </TouchableOpacity>
            </View>
            </Pressable>
        </KeyboardAvoidingView>
        </Pressable>
    </>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "rgba(228, 67, 67, 0.85)",
    height: 40,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    alignSelf: "center",
    margin: 15
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
    borderTopRightRadius: 16
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  titleInput: {
    padding: 5,
    marginBottom: 11,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    fontSize: 20    
  },
  costInput: {
    marginTop: 5,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 100,
    height: 30,  
    lineHeight: 25,  
    fontSize: 20,
    alignSelf: 'flex-start', // Shrinks the width to fit the content
    minWidth: 40,            // Ensures it's clickable even when empty
  },
  dateInput: {
    marginBottom: 10,
    marginTop: 5
  },
  descriptionInput: {
    marginTop: 5,
    padding: 5,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    width: 350,
    height: 100,
    fontSize: 20, 
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date:{
    fontSize: 18,
    padding: 5,
    marginBottom: 10,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 10, 
    width: 200
  },
  buttonPicker: {
    marginHorizontal: 0,
    marginBottom: 10,
    flex: 1, // Прави всички бутони с еднаква ширина
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginTop: 10
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
