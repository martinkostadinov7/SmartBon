import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Pressable, Keyboard, Alert, ActivityIndicator, Switch } from 'react-native'
import React, { useCallback, useState} from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { CategoryBox } from '../../components/categoryBox';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { apiFetch } from '../../services/api';
import * as SecureStore from "expo-secure-store";
import { Currency } from '../../types/expense';
import * as ImagePicker from 'expo-image-picker';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { Category } from '../../types/category';
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

const frequencyFromString: Record<string, number> = {
  "Daily": 0, 
  "Weekly": 1,
  "Monthly": 2,
  "Yearly": 3
};

export default function AddExpense() {
  const [categories, setCategories] = useState<Category[]>([]);

  const { title: prefilledTitle, amount: prefilledAmount, description: prefilledDescription, goalId: goalId } = useLocalSearchParams();
    const [title, setTitle] = useState(String(prefilledTitle) == "undefined" ? "" : String(prefilledTitle));
    const [date, setDate] = useState(new Date());
    const [cost, setCost] = useState(String(prefilledAmount) == "undefined" ? "": String(prefilledAmount));
    const [description, setDescription] = useState(String(prefilledDescription) == "undefined" ? "" : String(prefilledDescription));
    const [selectedCategoryId, setSelectedCategoryId] = useState(-1);
    const [selectedSubcategoryId, setSelectedSubcategoryId] = useState(-1);
    const [isReceiptDataLoading, setReceiptDataLoading] = useState(false);
    const [userDefaultCurrency, setUserDefaultCurrency] = useState("Unidentified");
    const [selectedCurrency, setSelectedCurrency] = useState(userDefaultCurrency ? userDefaultCurrency : "EUR");
    const [isRecurring, setIsRecurring] = useState(false);
    const [selectedFrequency, setSelectedFrequency] = useState<string | null>();
    const frequencies = ["Daily", "Weekly", "Monthly", "Yearly"];
    const [isPremium, setIsPremium] = useState(false);

    type PaymentType = "Cash" | "Card" | "Transfer";

    const paymentOptions: { value: PaymentType; label: string }[] = [
    { value: "Cash", label: "Cash" },
    { value: "Card", label: "Card" },
    { value: "Transfer", label: "Transfer" },
    ];

    const [paymentType, setPaymentType] = useState<PaymentType>("Cash");
const [receiptPhoto, setReceiptPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) return;

  const result = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    quality: 1,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    const capturedPhoto = result.assets[0];
    setReceiptPhoto(capturedPhoto); // За визуализация в интерфейса
    
    // ПРЕДАЙ ГИ ДИРЕКТНО ТУК:
    await sendPhotoToApi(capturedPhoto); 
  }
};

// Обнови дефиницията на функцията:
async function sendPhotoToApi(photoToUpload: ImagePicker.ImagePickerAsset) {
  try {
    const formData = new FormData();

    formData.append('image', {
        uri: photoToUpload.uri,
        type: photoToUpload.mimeType || 'image/jpeg',
        name: photoToUpload.fileName || 'receipt.jpg',
    } as any);

    setReceiptDataLoading(true);
    const response = await apiFetch(`/expenses/upload-receipt`, {
        method: "POST",
        body: formData, 
    });

    const result = await response.json(); 
    setTitle(result.title || "");
    setDescription(result.description || "");
    setCost(String(result.cost) || "");
    setDate(new Date(result.expenseDate) || new Date());
    setReceiptDataLoading(false);
  } catch (e) {
    console.error(e);
  }
}
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
          
        if(isRecurring && !selectedFrequency){
            Alert.alert(
            "Input error",
            "Select frequency for recurring expense!",
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
            Currency: currencyMap[selectedCurrency || "EUR"],
            Frequency: frequencyFromString[selectedFrequency || "-1"]
        };

        try {
          if(!isRecurring){
            const response = await apiFetch("/Expenses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
            });

            if(response.status == 400){
              let message = await response.json();
              Alert.alert(
                "Budget limit",
                `${message?.message}`,
                [{ text: "OK" }]
                );
                if(goalId) {
              handleRealiseGoal();
            }
            handleCloseScreen();

            }
            if (!response.ok) return;

            if(goalId) {
              handleRealiseGoal();
            }

            handleCloseScreen();
          }
          else{
            const response = await apiFetch("/Expenses/recurring", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(expense),
            });

            if(response.status == 400){
              let message = await response.json();
              Alert.alert(
                "Budget limit",
                `${message?.message}`,
                [{ text: "OK" }]
                );
                handleCloseScreen();
            }

            if (!response.ok) return;
            handleCloseScreen();
            }
          }
        catch (e: any) {
            console.log("Network/API error:", e?.message ?? e);
        }
    }

async function loadCategories(){
   const response = await apiFetch(`/Categories`);
    if (!response.ok) throw new Error("Failed");
    const data = await response.json();
    setCategories(data);
}
    
    useFocusEffect(
         useCallback(() => {
           const fetchProfile = async () => {
             try {

              loadCategories();
              
               const response = await apiFetch(`/Users/me`);
               if (!response.ok) throw new Error("Failed");
               const profileData = await response.json();
               const currencyStr = currencyFromNumber[profileData.defaultCurrency];
                setUserDefaultCurrency(currencyStr);
                setSelectedCurrency(currencyStr);
        setIsPremium(profileData.isPremium);

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
  <View style={styles.overlay}>       
           <Pressable 
          style={StyleSheet.absoluteFill} 
          onPress={() => router.back()} 
          />   
          
            <View 
              style={[styles.container]} 
              // Това спира клика да стигне до overlay-а, без да пречи на ScrollView
              onStartShouldSetResponder={() => true} 
              onResponderTerminationRequest={() => false}
              >
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                  <Text style={styles.headerBtn}>Cancel</Text>
                </TouchableOpacity>

              <Text style={styles.title}>Add Expense</Text>
                
  
              <TouchableOpacity onPress={handleAddExpense}>
                  <Text style={styles.headerBtn}>Add</Text> 
              </TouchableOpacity>
              </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          <TouchableOpacity activeOpacity={1.0}>
        
    <View style={[styles.row, {justifyContent:"space-between"}]}>
      <View style={{width: 100}}>
        <Text style={styles.label}>Cost</Text>
        <TextInput
          style={[styles.input, {maxWidth: 100}]}
          onChangeText={newCost => setCost(newCost)}
          value={cost}
          keyboardType="decimal-pad"
          onBlur={Keyboard.dismiss}
        />
      </View>

<View style={styles.row}>
  {isReceiptDataLoading && (<ActivityIndicator size="large" color="#3077ceff" />)}
      <TouchableOpacity style={[styles.photoButton, {marginLeft: 10}]} onPress={takePhoto}>
        <Text style={styles.buttonText}><FontAwesome6 name="camera" size={18}/>  Scan Receipt</Text>
      </TouchableOpacity>
</View>
    </View>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          onChangeText={newTitle => setTitle(newTitle)}
          value={title}
          onBlur={Keyboard.dismiss}
        />


        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          onChangeText={newDescription => setDescription(newDescription)}
          value={description}
          multiline
        />

        <View style={[styles.row, {marginTop: 15}]}>
          <Text style={[styles.label, {marginRight: 10}]}>Date</Text>
          <DateTimePicker
            value={date}
            mode="datetime"
            onChange={(event, selectedDate) => {
              if (selectedDate) setDate(selectedDate);
            }}
          />
        </View>
        {!goalId && (
<>
{isPremium ? 
(
<View style={[styles.row, {marginTop: 5}]}>
  <FontAwesome6 name= "rotate-right"  size={21} color="black"/>
  <Text style={[styles.label, {marginRight: 10, marginLeft: 10}]}>Recurring</Text>
  <Switch
    style={{margin:7}}
    trackColor={{ false: "#b1b1b1", true: "#00ae34" }}
    thumbColor={"#ffffff"}
    onValueChange={() => setIsRecurring(previousState => !previousState)}
    value={isRecurring}
  />
</View>
) : 
(
    <Pressable 
  onPress={() => handlePremiumFeaturePress("Recurring expenses is a premium feature!")} 
  style={({ pressed }) => [
    { opacity: pressed ? 0.5 : 0.7 }, 
  ]}
>
  <View style={[styles.row, { marginTop: 5 }]}>
    <FontAwesome6 name="lock" size={21} color="black" />
    <Text style={[styles.label, { marginRight: 10, marginLeft: 10 }]}>
      Recurring
    </Text>
    
    <View pointerEvents="none">
      <Switch
        style={{ margin: 7 }}
        trackColor={{ false: "#b1b1b1", true: "#00ae34" }}
        thumbColor={"#ffffff"}
        value={isRecurring}
      />
    </View>
  </View>
</Pressable>
)}


{(isRecurring) && 
(
<>
  <Text style={[styles.label, {marginRight: 10}]}>Frequency</Text>
  <View style={styles.row}>
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
                paddingHorizontal: 12, // Малко повече място отстрани
                borderColor: selectedFrequency === frequency ? "black" : "gray",
                }}
                onPress={() => setSelectedFrequency(frequency)}
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
</View>
</>
)}
</>
        )}

        <Text style={styles.label}>Category</Text>
        <View style={{ overflow: "hidden" }}>
          <ScrollView
            horizontal
            style={{ marginBottom: 10}}
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
                fontSize={12}
                iconSize={30}
                boxSize={73}
                color={"#FFFFFF"}
                selected={false}
                onPress={handleCategoryAdd}
              />
          </ScrollView>
        </View>
        {selectedCategoryId != -1 && (
            <>
            <Text style={styles.label}>Subcategory</Text>

            <View style={{ overflow: "hidden" }}>
                <ScrollView
                horizontal
                style={{ marginBottom: 10}}
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
                        selected={selectedSubcategoryId === subcategory.id}
                        onPress={() => setSelectedSubcategoryId(subcategory.id)}
                    />
                ))}
                <CategoryBox
                    key={-2}
                    name="Add"
                    icon="+"
                    color={"#FFFFFF"}
                    fontSize={12}
                    iconSize={30}
                    boxSize={73}
                    selected={false}
                    onPress={handleSubcategoryAdd}
                />
                </ScrollView>
            </View>
            </>
        )}
        <Text style={styles.label}>Currency</Text>
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

        <Text style={styles.label}>Payment Type</Text>
        <View style={{ marginBottom: 10, flexDirection: "row", gap: 10 }}>
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
    </TouchableOpacity>
  </ScrollView>     
</View>
</View>
  </>
);

}

export const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  title: { fontSize: 20, fontWeight: "600" },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  label: { marginTop: 10, marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
  height: 650
},
  currencyPicker:{
    width:70,
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
     marginTop: 10,
     marginBottom: 10
  },
    heading: {
    marginBottom: 10,
    marginLeft: 20,
    fontSize: 36
  },
  text: {
    marginBottom: 10,
    fontSize: 24
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
  },photoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  photoButton: { backgroundColor: "#3077ceff", padding: 15, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  preview: { width: 200, height: 300, marginTop: 20, borderRadius: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});