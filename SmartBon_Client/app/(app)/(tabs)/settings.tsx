import {ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../../services/api";
import { Currency } from "../../types/expense";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"  
};

export default function SettingsScreen() {
  const [userName, setUserName] = useState("Unidentified");
  const [userEmail, setUserEmail] = useState("Unidentified");
  const [isPremium, setIsPremium] = useState(false);
  const [userJoined, setUserJoined] = useState("Unidentified");
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("EUR");
  const [isBudgetLimitAlertEnabled, setIsBudgetLimitAlertEnabled] = useState(true);
  const [isMonthlyAppReportsEnabled, setIsMonthlyAppReportsEnabled] = useState(true);
  const [isMonthlyEmailReportsEnabled, setIsMonthlyEmailReportsEnabled] = useState(true);

const importCsvFile = async () => {
  try {
    // 1. Отваряне на прозореца за избор на файл
    const result = await DocumentPicker.getDocumentAsync({
      type: 'text/comma-separated-values', // Ограничаваме само до CSV
      copyToCacheDirectory: true,
    });

    // Проверка дали потребителят е затворил прозореца без да избере файл
    if (result.canceled) return;

    const file = result.assets[0];

    // 2. Подготовка на данните за изпращане (FormData)
    const formData = new FormData();
    
    // ВАЖНО: Името 'csvFile' трябва да съвпада точно с името на параметъра в C# метода ти!
    formData.append('csvFile', {
      uri: file.uri,
      name: file.name,
      type: 'text/csv', // или file.mimeType
    } as any);

    // 3. Изпращане към бекенда
    const response = await apiFetch(`/expenses/import`, {
           method: "POST",
           body: formData, 
       });

    if (response.ok) {
      Alert.alert("Success", "Expenses imported successfully!");
    } else {
      const errorText = await response.text();
      Alert.alert("Import Error", errorText);
    }
  } catch (error) {
    Alert.alert("Error", "An error occurred while picking or uploading the file.");
    console.log(error);
  }
};

  useFocusEffect(
  useCallback(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch(`/Users/me`);
        if (!response.ok) throw new Error("Failed");
        const profileData = await response.json()
        setUserName(profileData.name);
        setUserEmail(profileData.email);
        setIsPremium(profileData.isPremium);
        setUserDefaultCurrency(currencyFromNumber[profileData.defaultCurrency]);
        setUserJoined(formatDate(profileData.createdAt));
      } catch (error) {
        console.error(error);
      }
    };

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

    fetchProfile();
    return () => {}; 
  }, []) 
);


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

async function handleToggleMonthlyReport(newValue:boolean){
  try { 
      const response = await apiFetch(`/Users/monthlyReport?receiveMonthlyReportEmail=${newValue}`, {
      method: "POST",
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

  function handleSignOut(){
   SecureStore.setItem("token", "");
   router.navigate("../../(auth)");
  }
 function handleOpenExportExpensesMenu() {
   router.push("../../(modals)/expenses/exportExpensesMenu");
}

function handleOpenRecurringExpensesMenu(){
   router.push("../../(modals)/expenses/recurringExpensesMenu");
}

async function handleDeleteAccount() {
    Alert.alert(
        "Delete Account",
        "This action is permanent. All your data and your profile will be gone forever.",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete My Account", 
                style: "destructive", 
                onPress: async () => {
                    const success = await executeAccountDeletion();
                    if (success) {
                        // Reset your navigation stack to the Login screen
                        // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    }
                } 
            }
        ]
    );
}

async function executeAccountDeletion() {
    try {
        const response = await apiFetch(`/Users/deleteAccount`, {
            method: "DELETE"
        });

        if (!response.ok) throw new Error("Could not delete account.");

        await SecureStore.deleteItemAsync("token"); 
        handleSignOut();
        Alert.alert("Account Deleted", "We're sorry to see you go.");
        return true;
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        
        Alert.alert("Error", errorMessage);
        console.error("Delete All Data Error:", e);
    }
}

 async function handleDeleteData() {
    // 1. Always ask for confirmation before deleting everything!
    Alert.alert(
        "Reset All Data",
        "This will permanently delete all your expenses, budgets, and goals. Are you sure?",
        [
            { text: "Cancel", style: "cancel" },
            { 
                text: "Delete Everything", 
                style: "destructive", 
                onPress: async () => await executeDelete() 
            }
        ]
    );
}

// Separate the logic to keep the UI interaction clean
async function executeDelete() {
    try {
        const response = await apiFetch(`/Users/deleteAllData`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            // Check if the body is empty before calling .json() to avoid crashes
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Failed to delete data.");
        }

        Alert.alert("Success", "All your data has been cleared.");

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred";
        
        Alert.alert("Error", errorMessage);
        console.error("Delete All Data Error:", e);
    }
}

return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
      <Text style={{fontSize: 32, color: "white"}}>Settings</Text>
    </View>
    <ScrollView style={{backgroundColor: "#e1ebffff", flex: 1}}>

    <View style={styles.profileContainer}>
      <Text style={{fontSize: 26}}>{userName}</Text>
      <Text style={{fontSize: 18, marginTop: 5}}>{userEmail}</Text>
      <View style={[{marginTop: 10, borderRadius: 15, alignItems: "center"} , isPremium ? {backgroundColor: "#3077ceff", width: 110} : {backgroundColor: "gray", width: 60}]}>
        <Text style={{fontSize: 16, color: "white", margin: 5}}>{isPremium ? <FontAwesome6 name="crown" size={21} color="yellow" /> : ""}{isPremium ? " Premium" : "Free"}</Text>
      </View>

      <Text style={{fontSize: 16, marginTop: 5}}>Default Currency: {userDefaultCurrency}</Text>
      <Text style={{fontSize: 16, marginTop: 5}}>Joined: {userJoined}</Text>
    </View>

    <View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Profile</Text>

      <TouchableOpacity onPress={() => router.push('/(modals)/users/editProfile')} style={{borderRadius:10, backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="user-pen" size={21} color="black" />   Edit profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/users/changePassword')} style={{borderRadius:10, backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="key" size={21} color="black" />   Change password</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/users/managePlan')} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="credit-card" size={21} color="black" />   Manage plan</Text>
      </TouchableOpacity>
    </View>

<View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Expenses</Text>

      <TouchableOpacity onPress={isPremium ? handleOpenRecurringExpensesMenu : () => handlePremiumFeaturePress("Recurring expenses is a premium feature!")} style={{borderRadius:10,backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "rotate-right" : "lock"}  size={21} color="black" />   Manage recurring expenses</Text>
      </TouchableOpacity>
    </View>

<View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Archive</Text>
      
      <TouchableOpacity onPress={() => router.push('/(modals)/budgets/archived')} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="box-archive" size={21} color="black" />   Archived budgets</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/goals/realised')} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="trophy" size={21} color="black" />   Realised goals</Text>
      </TouchableOpacity>
      
    </View>

    <View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Email receiving</Text>
      

      <TouchableOpacity 
  onPress={isPremium ? handleOpenExportExpensesMenu : () => handlePremiumFeaturePress("Receiving monthly reports by email is a premium feature!")} 
  style={[
    styles.row, 
    {
      borderRadius: 10, 
      backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", 
      marginBottom: 10
    }
  ]}
>
  <Text style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "envelope-open-text" : "lock"} size={21} color="black" />   Monthly reports</Text>


  <Switch
    style={{ margin: 7 }}
    trackColor={{ false: "#b1b1b1", true: "#00ae34" }}
    thumbColor={"#ffffff"}
    // Важно: Тук е поправката на логиката
    onValueChange={() => {
      if (isPremium) {
        const nextState = !isMonthlyEmailReportsEnabled;
        setIsMonthlyEmailReportsEnabled(nextState);
        handleToggleMonthlyReport(nextState);
      } else {
        handlePremiumFeaturePress("Receiving monthly reports by email is a premium feature!");
      }
    }}
    // Деактивираме суича визуално, ако не е премиум
    disabled={!isPremium} 
    value={isMonthlyEmailReportsEnabled}
  />      
</TouchableOpacity>
    </View>

    <View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Data</Text>

    <TouchableOpacity onPress={isPremium ? importCsvFile : () => handlePremiumFeaturePress("Importing expenses is a premium feature!")} style={{borderRadius:10,backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "file-export" : "lock"} size={21} color="black" />   Import expenses</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={isPremium ? handleOpenExportExpensesMenu : () => handlePremiumFeaturePress("Exporting expenses is a premium feature!")} style={{borderRadius:10,backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "file-export" : "lock"}  size={21} color="black" />   Export expenses</Text>
      </TouchableOpacity>
    </View>

    <View style={{backgroundColor: "rgba(228, 67, 67, 0.33)" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Danger Zone</Text>

      <TouchableOpacity onPress={(handleDeleteData)} style={{borderRadius:10,backgroundColor: "rgba(228, 67, 67, 0.85)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="trash-can" size={21} color="black" />   Delete data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={(handleDeleteAccount)} style={{borderRadius:10,backgroundColor: "rgba(228, 67, 67, 0.85)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="user-slash" size={21} color="black" />   Delete account</Text>
      </TouchableOpacity>
    </View>
      
     <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={{ color: "white", fontSize: 20}}>Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  </>
  );
}


const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    backgroundColor: "rgba(228, 67, 67, 0.85)",
    height: 40,
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    alignSelf: "center",
    marginBottom: 10
  },
  profileContainer: {
    backgroundColor: "rgba(48, 119, 206, 0.22)",
    justifyContent: 'center',
    width: 360,
    borderRadius: 20,
    alignSelf: "center",
    margin: 15,
    padding: 15
  }
});
