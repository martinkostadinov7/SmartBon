import {ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../../../services/api";
import { Currency } from "../../../types/expense";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useTranslation } from "react-i18next";

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
  const { t, i18n } = useTranslation();

  function handleChangeLanguage(){
    router.push("../../(modals)/users/changeLanguage");
  }
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
      Alert.alert(`${t('success')}`, `${t('expenses_imported')}`);
    } else {
      const errorText = await response.text();
      Alert.alert(`${t('import_error')}`, errorText);
    }
  } catch (error) {
    Alert.alert(`${t('error')}`, `${t('error_occured')}`);
    console.log(error);
  }
};

  useFocusEffect(
  useCallback(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch(`/Users/me`);
        if (!response.ok) throw new Error(t("error_occured"));
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
      `${t("premium_feature")}`,
      `${message} ${t('would_you_like_to_upgrade_message')}`,
      [
        { text: `${t("cancel")}`, style: "cancel" },
        {
          text: `${t("upgrade")}`,
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
          throw new Error(errorData.message || `${t("error_occured")}`);
      }
  } catch (e: any) {

  Alert.alert(
      `${t("error")}`,
      `${t("error_occured")}`,
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
        `${t("delete_account")}`,
        `${t("delete_account_message")}`,
        [
            { text: `${t("cancel")}`, style: "cancel" },
            { 
                text: `${t("delete")}`, 
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

        if (!response.ok) throw new Error(`${t('could_not_delete_account')}`);

        await SecureStore.deleteItemAsync("token"); 
        handleSignOut();
        Alert.alert(`${t('account_deleted')}`, `${t('account_deleted_message')}`);
        return true;
    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : `${t('error_occured')}`;
        
        Alert.alert(`${t('error')}`, errorMessage);
    }
}

 async function handleDeleteData() {
    // 1. Always ask for confirmation before deleting everything!
    Alert.alert(
        `${t('delete_all_data_alert')}`,
        `${t('delete_all_data_message')}`,
        [
            { text: `${t('cancel')}`, style: "cancel" },
            { 
                text: `${t('delete_everything')}`, 
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
            throw new Error(errorData.message || `${t('error_occured')}`);
        }

        Alert.alert(`${t('success')}`, `${t('data_cleared')}`);

    } catch (e) {
        const errorMessage = e instanceof Error ? e.message : `${t('error_occured')}`;
        
        Alert.alert(`${t('error')}`, errorMessage);
    }
}

return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 32, color: "white"}}>{t('settings')}</Text>
    </View>
    <ScrollView style={{backgroundColor: "#e1ebffff", flex: 1}}>

    <View style={styles.profileContainer}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 26}}>{userName}</Text>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 18, marginTop: 5}}>{userEmail}</Text>
      <View style={[{marginTop: 10, borderRadius: 15, alignItems: "center"} , isPremium ? {backgroundColor: "#3077ceff", width: 110} : {backgroundColor: "gray", width: 60}]}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, color: "white", margin: 5}}>{isPremium ? <FontAwesome6 name="crown" size={21} color="yellow" /> : ""}{isPremium ? ` ${t('premium')}` : `${t('free')}`}</Text>
      </View>

      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginTop: 5}}>{t('default_currency')}: {userDefaultCurrency}</Text>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 16, marginTop: 5}}>{t('joined')}: {userJoined}</Text>
    </View>

    <View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 20}}>{t('profile')}</Text>

      <TouchableOpacity onPress={() => router.push('/(modals)/users/editProfile')} style={{borderRadius:10, backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="user-pen" size={21} color="black" />   {t('edit_profile')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/users/changePassword')} style={{borderRadius:10, backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="key" size={21} color="black" />   {t('change_password')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/users/managePlan')} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="credit-card" size={21} color="black" />   {t('manage_plan')}</Text>
      </TouchableOpacity>

<TouchableOpacity onPress={handleChangeLanguage} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="globe" size={21} color="black" />   {t('change_language')}</Text>
      </TouchableOpacity>
    </View>

<View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 20}}>{t('expenses')}</Text>

      <TouchableOpacity onPress={isPremium ? handleOpenRecurringExpensesMenu : () => handlePremiumFeaturePress(`${t('premium_feature_recurring')}`)} style={{borderRadius:10,backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "rotate-right" : "lock"}  size={21} color="black" />   {t('manage_recurring_expenses')}</Text>
      </TouchableOpacity>
    </View>

<View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 20}}>{t('archive')}</Text>
      
      <TouchableOpacity onPress={() => router.push('/(modals)/budgets/archived')} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="box-archive" size={21} color="black" />   {t('archived_budgets')}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(modals)/goals/realised')} style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="trophy" size={21} color="black" />   {t('realised_goals')}</Text>
      </TouchableOpacity>
      
    </View>

    <View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 20}}>{t('email_receiving')}</Text>
      

      <TouchableOpacity 
  onPress={isPremium ? () => {if (isPremium) {
        const nextState = !isMonthlyEmailReportsEnabled;
        setIsMonthlyEmailReportsEnabled(nextState);
        handleToggleMonthlyReport(nextState);
      } else {
        handlePremiumFeaturePress(`${t('premium_feature_reports')}`);
      }} : () => handlePremiumFeaturePress(`${t('premium_feature_reports')}`)} 
  style={[
    styles.row, 
    {
      borderRadius: 10, 
      backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", 
      marginBottom: 10
    }
  ]}
>
  <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "envelope-open-text" : "lock"} size={21} color="black" />   {t('monthly_reports')}</Text>


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
        handlePremiumFeaturePress(`${t('premium_feature_reports')}`);
      }
    }}
    // Деактивираме суича визуално, ако не е премиум
    disabled={!isPremium} 
    value={isMonthlyEmailReportsEnabled}
  />      
</TouchableOpacity>
    </View>

    <View style={{backgroundColor: "white" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 20}}>{t('data')}</Text>

    <TouchableOpacity onPress={isPremium ? importCsvFile : () => handlePremiumFeaturePress(`${t('premium_feature_importing')}`)} style={{borderRadius:10,backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "file-export" : "lock"} size={21} color="black" />   {t('import_expenses')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={isPremium ? handleOpenExportExpensesMenu : () => handlePremiumFeaturePress(`${t('premium_feature_exporting')}`)} style={{borderRadius:10,backgroundColor: isPremium ? "rgba(48, 119, 206, 0.32)" : "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17, color: isPremium ? "#000000" : "#8c8c8c"}}><FontAwesome6 name= {isPremium ? "file-export" : "lock"}  size={21} color="black" />   {t('export_expenses')}</Text>
      </TouchableOpacity>
    </View>

    <View style={{backgroundColor: "rgba(228, 67, 67, 0.33)" , borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{fontSize: 20, marginBottom: 20}}>{t('danger_zone')}</Text>

      <TouchableOpacity onPress={(handleDeleteData)} style={{borderRadius:10,backgroundColor: "rgba(228, 67, 67, 0.85)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="trash-can" size={21} color="black" />   {t('delete_data')}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={(handleDeleteAccount)} style={{borderRadius:10,backgroundColor: "rgba(228, 67, 67, 0.85)", marginBottom: 10}}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{margin: 10, fontSize: 17}}><FontAwesome6 name="user-slash" size={21} color="black" />   {t('delete_account')}</Text>
      </TouchableOpacity>
    </View>
      
     <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={{ color: "white", fontSize: 20}}>{t('sign_out')}</Text>
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
