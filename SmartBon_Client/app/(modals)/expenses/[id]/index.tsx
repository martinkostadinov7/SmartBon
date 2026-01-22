import { View, Text, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Modal, TextInput, Keyboard, Alert} from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { Expense, PaymentType } from '../../../types/expense';
import { getExpenseById } from "../../../services/expenseService";
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

    const paymentOptions: { value: PaymentType; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "Transfer", label: "Transfer" },
    ];

    const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
    const currentPaymentLabel = paymentOptions.find(p => p.value === paymentType)?.label ?? paymentType;

   useEffect(() => {(async () => {
      const expense = await getExpenseById(Number(id));
      setExpense(expense);
      setTitle(expense?.title ?? "undefined");
      setDate(new Date(expense?.expenseDate) ?? new Date());
      setCost(String(expense?.cost));
      setDescription(expense?.description ?? null);
      setPaymentType(paymentTypeFromNumber[expense?.paymentType]);
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
      
              const expenseToAdd = {
                  Title: title.trim(),
                  Description: description.trim(),
                  Cost: costNumber,
                  CategoryId: currentCategoryId,
                  SubcategoryId: subCategory ? currentSubcategoryId : null,
                  ExpenseDate: date.toISOString(),
                  PaymentType: paymentTypeMap[paymentType],
              };
      
              try {
                  const response = await apiFetch(`/Expenses/${id}`, {
                  method: "PUT",
                  headers: {
                      "Content-Type": "application/json",
                  },
                  body: JSON.stringify(expenseToAdd),
                  });
      
                  console.log("REQUEST BODY:", expenseToAdd);
                  console.log("STATUS:", response.status);
                  console.log("BODY:", await response.text());
      
                  if (!response.ok) return;
      
                  console.log("Expense edited successfully ✅");
                  
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

  return (
    <>
        <Pressable style={styles.overlay} onPress={handleCloseScreen}>
        <KeyboardAvoidingView
            style={styles.wrapper}
        >
            <Pressable style={styles.container} onPress={() => Keyboard.dismiss()}>
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
            </View>
            </Pressable>
        </KeyboardAvoidingView>
        </Pressable>
    </>
  )
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
    height: 560,
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
    width: 195
  }
});
