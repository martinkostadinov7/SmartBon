import { View, Text, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Modal, TextInput, Keyboard, Alert, Platform, ScrollView} from 'react-native'
import React, { useEffect, useState } from 'react'
import { router, useLocalSearchParams } from 'expo-router';
import { Currency, Expense, PaymentType } from '../../../../types/expense';
import { CategoryBox } from '../../../../components/categoryBox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { apiFetch } from '../../../../services/api';
import { ExpenseCard } from '../../../../components/expense';
import { Category } from '../../../../types/category';
import { useExpenseStore } from '../../../../services/store';
import { Subcategory } from '../../../../types/subcategory';

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

const frequencyFromNumber: Record<number, string> = {
  0: "Daily",
  1: "Weekly",
  2: "Monthly",
  3: "Yearly"
};

const frequencyFromString: Record<string, number> = {
  "Daily": 0,
  "Weekly": 1,
  "Monthly": 2,
  "Yearly" : 3
};
export default function ExpenseViewScreen() {
const { id } = useLocalSearchParams<{ id: string}>();
    const tempCategoryId = useExpenseStore((state) => state.tempCategoryId);
    const tempSubcategoryId = useExpenseStore((state) => state.tempSubcategoryId);
    const { clearTempData } = useExpenseStore();    const [expense, setExpense] = useState<Expense | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState(new Date());
    const [nextExecutionDate, setNextExecutionDate] = useState(new Date());
    const [cost, setCost] = useState("");
    const [description, setDescription] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [categoryId, setCategoryId] = useState(-1);
    const [screenHeight, setScreenHeight] = useState(685);
    const [selectedFrequency, setFrequency] = useState("");
    const [selectedCurrency, setSelectedCurrency] = useState("EUR");
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const paymentOptions: { value: PaymentType; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "Transfer", label: "Transfer" },
    ];
 const [category, setCategory] = useState<Category>();
    const [subcategory, setSubcategory] = useState<Subcategory | null>();
    const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
    const currentPaymentLabel = paymentOptions.find(p => p.value === paymentType)?.label ?? paymentType;

    const frequencies = ["Daily", "Weekly", "Monthly", "Yearly"];

async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setCategories(data);
}

   useEffect(() => {(async () => {

    loadCategories();
      const response = await apiFetch(`/Expenses/recurring/${id}`);
      if (!response.ok) {
        throw new Error("Failed to load recurring expense");
      }
      const expense = await response.json();
      setExpense(expense);
      setTitle(expense?.title ?? "undefined");
      setFrequency(frequencyFromNumber[expense?.frequency]);
      setStartDate(new Date(expense?.startDate) ?? new Date());
      setNextExecutionDate(new Date(expense?.nextExecutionDate) ?? new Date());
      setCost(String(expense?.cost));
      setDescription(expense?.description ?? null);
      setPaymentType(paymentTypeFromNumber[expense?.paymentType]);
      setSelectedCurrency(currencyFromNumber[expense?.currency]);
      setExpenses(expense?.expenses);
    })();
   }, [id, expenses]);

    useEffect(() => {
  (async () => {
    const expResponse = await apiFetch(`/Expenses/recurring/${id}`);
      const expense = await expResponse.json();

      let allCategories = categories;
      if (categories.length === 0) {
        const catResponse = await apiFetch(`/Categories`);
        allCategories = await catResponse.json();
        setCategories(allCategories);
      }

      const currentCategoryId = tempCategoryId ? Number(tempCategoryId) : (expense?.categoryId || -1);
      const currentSubcategoryId = tempSubcategoryId ? Number(tempSubcategoryId) : (expense?.subcategoryId || -1);

      const foundCategory = allCategories.find(c => c.id === currentCategoryId);
      const foundSubcategory = foundCategory?.subcategories.find(s => s.id === currentSubcategoryId) || null;

      setExpense(expense);
      setCategory(foundCategory);
      setSubcategory(foundSubcategory);
      setTitle(expense?.title ?? "undefined");
      setFrequency(frequencyFromNumber[expense?.frequency]);
      setStartDate(new Date(expense?.startDate) ?? new Date());
      setNextExecutionDate(new Date(expense?.nextExecutionDate) ?? new Date());
      setCost(String(expense?.cost));
      setDescription(expense?.description ?? null);
      setPaymentType(paymentTypeFromNumber[expense?.paymentType]);
      setSelectedCurrency(currencyFromNumber[expense?.currency]);
      setExpenses(expense?.expenses);
  })();
}, [id]);

useEffect(() => {
  // 1. Първо намираме правилната категория
  let currentCat = category; // по подразбиране текущата

  if (tempCategoryId) {
    const foundCat = categories.find(c => c.id === Number(tempCategoryId));
    if (foundCat) {
      setCategory(foundCat);
      currentCat = foundCat; // Актуализираме локалната променлива за следващата стъпка
    }
  }

  // 2. Сега намираме подкатегорията, използвайки currentCat (която вече е обновена)
  if (tempSubcategoryId) {
    const newSub = currentCat?.subcategories.find(s => s.id === Number(tempSubcategoryId));
    if (newSub) {
      setSubcategory(newSub);
    } else {
       // Ако не я намерим в текущата категория, може би е избрана "None" или е грешка
       setSubcategory(null);
    }
  }
}, [tempCategoryId, tempSubcategoryId, categories]);
    function handleChangeCategory(): void {
      router.push("../../categories/changeCategory");
    }

    function handleChangeSubcategory(): void {
      router.push({
          pathname: "../../categories/changeSubcategory",
          params: { 
              categoryId: category?.id
          }
      });
    }


     function handleExpenseView(id: number){
        router.push(`/(modals)/expenses/${id}`);
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

const offset = nextExecutionDate.getTimezoneOffset() * 60000; 

// 2. Създаваме "фалшива" UTC дата, която съвпада с нашия локален час
const localISOTime = new Date(nextExecutionDate.getTime() - offset).toISOString().slice(0, -1); 
// Резултат: "2026-03-31T13:00:00.000" (без "Z" накрая)
      const expenseToUpdate = {
          Title: title.trim(),
          Description: description ? description.trim() : null,
          Cost: costNumber,
          CategoryId: category?.id,
          SubcategoryId: subcategory?.id ? subcategory.id : null,
          PaymentType: paymentTypeMap[paymentType],
          Currency: currencyMap[selectedCurrency],
          Frequency: frequencyFromString[selectedFrequency],
          NextExecutionDate: localISOTime
      };

      try {
          const response = await apiFetch(`/Expenses/recurring/${id}`, {
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
    }

const formatCost = (amount: number, currencyCode: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode, // Тук подаваш директно "EUR", "BGN" или "USD"
  }).format(amount);
};

    function handleCloseScreen(){
        clearTempData();
      router.back();
    }
    
      async function handleDeleteExpense() {
  Alert.alert(
    "Delete recurring Expense",
    "Are you sure you want to delete this recurring expense?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 1. Изпращаме само ЕДНА заявка
            const response = await apiFetch(`/Expenses/recurring/${id}`, {
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
       <View style={styles.overlay}>       
                <Pressable 
               style={StyleSheet.absoluteFill} 
               onPress={handleCloseScreen} 
               />   
               
                 <View 
                   style={[styles.container]} 
                   // Това спира клика да стигне до overlay-а, без да пречи на ScrollView
                   onStartShouldSetResponder={() => true} 
                   onResponderTerminationRequest={() => false}
                   >
            <View style={styles.header}>
                <TouchableOpacity onPress={handleCloseScreen}>
                <Text style={styles.headerBtn}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleDeleteExpense}>
                  <Text style={[styles.headerBtn, {color: "red"}]}>Delete</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={isEditing ? handleSaveExpense : () => setIsEditing(true)}>
                 <Text style={styles.headerBtn}>{isEditing ? "Save" : "Edit"}</Text> 
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
                      <TouchableOpacity activeOpacity={1.0}>
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
                    style={[styles.input,{marginBottom: 7}]}
                    onChangeText={newTitle => setTitle(newTitle)}
                    value={title}
                    onBlur={Keyboard.dismiss}
                  /> :
                  
                  <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.input,{marginBottom: 7}] }>{title}</Text>}

                  {subcategory != null && (
                    <CategoryBox 
                      name={subcategory?.name ?? "Undefined"} 
                      icon={subcategory?.icon ?? "Undefined"} 
                      color={subcategory?.colorHex ?? "Undefined"} 
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
              <Text style={styles.label}>Cost</Text>

              {isEditing ?
                  <TextInput
                    style={styles.input}
                    onChangeText={newCost => setCost(newCost)}
                    value= {String(cost)}
                    keyboardType="decimal-pad"
                    onBlur={Keyboard.dismiss}
                    multiline={false}
                  /> :
                  <Text style={[styles.input]}>{cost}</Text>
                  }

              <Text style={styles.label}>Description</Text>

              {isEditing ?
                  <TextInput
                    style={styles.input}
                    onChangeText={newDescription => setDescription(newDescription)}
                    value={description}
                    multiline
                    onFocus={() => setScreenHeight(685)}
                    onBlur={() => setScreenHeight(685)}
                  /> :
                  <Text style={[styles.input]}>{description}</Text>
                  }

                <Text style={[styles.label, {marginBottom: 10}]}>Frequency</Text>
                {isEditing ? 
                (<>
<ScrollView horizontal showsHorizontalScrollIndicator={false}>

      {frequencies.map((frequency) => {
          return (
          <TouchableOpacity
              key={frequency}
              style={{
              flexDirection: 'row', // За да подредим текста и иконата в линия
              alignItems: 'center',
              borderWidth: selectedFrequency === frequency ? 2 : 1,
              borderRadius: 10,
              marginRight: 7,
              paddingVertical: 9,
              paddingHorizontal: 12,
              borderColor: selectedFrequency === frequency ? "black" : "gray",
              }}
              onPress={() => setFrequency(frequency)}
          >
              <Text style={{ 
                  textAlign: "center", 
                  fontSize: 14, 
                  textTransform: 'capitalize',
                  fontWeight: selectedFrequency === frequency ? 'bold' : 'normal'
              }}>
              {frequency}
              </Text>
              
          </TouchableOpacity>
          );
      })}
  </ScrollView>
                </>) : 
                (<>
                <View style={[styles.row, {justifyContent: "flex-start"}]}>
                    {frequencies.map((frequency) => (
                    <View
                        key={frequency}
                        style={{
                        flexDirection: 'row', // За да подредим текста и иконата в линия
                        alignItems: 'center',
                        borderWidth: selectedFrequency === frequency ? 2 : 1,
                        borderRadius: 10,
                        marginRight: 7,
                        paddingVertical: 9,
                        paddingHorizontal: 12,
                        borderColor: selectedFrequency === frequency ? "black" : "gray",
                        }}
                    >
                        <Text style={{ textAlign: "center", fontSize: 14, textTransform: 'capitalize', color: selectedFrequency === frequency ? "black" : "#8c8c8c", fontWeight: selectedFrequency === frequency ? 700 : 400}}>
                        {frequency}
                        </Text>
                    </View>
                    ))}
                </View>
                </>)}

              <Text style={styles.label}>Start date</Text>
              <View style={{opacity: 0.7}}>
                <View pointerEvents="none">
                    <DateTimePicker
                    themeVariant="light"
                        value={startDate}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                        if (selectedDate) setStartDate(selectedDate);
                    }}
                    />
                </View>
              </View>
              <Text style={styles.label}>Next execution date</Text>

              {isEditing ? (
                <DateTimePicker
                themeVariant="light" // Това ще форсира светъл режим на самия пикър
  textColor="black"
                  value={new Date(nextExecutionDate)} // Подсигури се, че е Date обект
                  mode="datetime"
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (selectedDate) setNextExecutionDate(selectedDate);
                  }}
                />
              ) : (
            <View style={{opacity: 0.7}}>
                <View pointerEvents="none">
                    <DateTimePicker
                    themeVariant="light"
                        style={styles.dateInput}
                        value={nextExecutionDate}
                        mode="datetime"
                        display="default"
                        onChange={(event, selectedDate) => {
                        if (selectedDate) setNextExecutionDate(selectedDate);
                    }}
                    />
                </View>
            </View>
              )}

              <Text style={styles.label}>Currency</Text>
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


              <Text style={styles.label}>Payment Type</Text>
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
            {isEditing ? 
            (<></>) : 
            (<>
            <Text style={{fontSize: 20, marginVertical: 10, fontWeight: '700'}}>Expenses</Text>
                  {expenses.length > 0 ? 
                  (expenses.map(expense => {
                    const category = categories.find(c => c.id === expense.categoryId);
                    const subcategory = categories
                      .find(c => c.id === expense.categoryId)
                      ?.subcategories.find(sc => sc.id === expense.subcategoryId);
                    return (
                      <ExpenseCard
                        key={expense.id}
                        title={expense.title}
                        amount={formatCost(expense.cost, currencyFromNumber[expense.currency])}
                        date={String(expense.expenseDate)}
                        categoryName= {category?.name ?? "Unknown"}
                        categoryEmoji={category?.icon ?? "❌"}
                        categoryColor={category?.colorHex ?? "x"}
                        subcategoryEmoji={subcategory?.icon}
                        subcategoryText={subcategory?.name}
                        subcategoryColor={subcategory?.colorHex ?? "#ff7575"}
                        onPress={() => handleExpenseView(expense.id)}
                      />
                    );
                  })) : 
                  (<View style={{ height: 100, justifyContent: 'center', alignItems: 'center' }}>
                <Text>No expenses added yet.</Text>
            </View>
            )}
        </>
        )}
            </TouchableOpacity>
            
          </ScrollView>     
        </View>
        </View>
    </>
  )
}

const styles = StyleSheet.create({
  label: { marginTop: 10, marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
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
    borderTopRightRadius: 16,
    height: 700
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
