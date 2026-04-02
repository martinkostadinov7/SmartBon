import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../services/api';
import { Currency } from '../../types/expense';
import { useTranslation } from 'react-i18next';

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

const currencyFromString: Record<string, number> = {
  "EUR": 0,
  "USD": 1
};

export default function ChangeCategory() {
    const [userName, setUserName] = useState("Unidentified");
    const [userEmail, setUserEmail] = useState("Unidentified");
    const [userDefaultCurrency, setUserDefaultCurrency] = useState("Unidentified");
    const [selectedCurrency, setSelectedCurrency] = useState(userDefaultCurrency);
    const [screenHeight, setScreenHeight] = useState(345);
const { t, i18n } = useTranslation();
    function handleCloseScreen(){
           router.back();
       }
       async function handleSave(){
            try {
                const userToUpdate = {
                    Email: userEmail,
                    Name: userName,
                    DefaultCurrency: currencyFromString[selectedCurrency]
                }
                console.log(userToUpdate);
                const response = await apiFetch(`/Users/editProfile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userToUpdate),
                });
                if (!response.ok) 
                {
                   const errorData = await response.json(); 
                    throw new Error(errorData.message || `${t('error_occured')}`);
                }
                handleCloseScreen();
            } catch (e: any) {

            Alert.alert(
                `${t('error')}`,
                e?.message,
                [{ text: "OK" }]
                );
                console.log("Network/API error:", e?.message.message ?? e);
            }
       }

       useFocusEffect(
         useCallback(() => {
           const fetchProfile = async () => {
             try {
               const response = await apiFetch(`/Users/me`);
               if (!response.ok) throw new Error(`${t('error_occured')}`);
               const profileData = await response.json();
               setUserName(profileData.name);
               setUserEmail(profileData.email);
               const currencyStr = currencyFromNumber[profileData.defaultCurrency];
                setUserDefaultCurrency(currencyStr);
                setSelectedCurrency(currencyStr);
                console.log(userDefaultCurrency);

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
  return (
  <>
        <Pressable style={styles.overlay} onPress={handleCloseScreen}>
        <KeyboardAvoidingView
            style={styles.wrapper}
        >
            <Pressable style={[styles.container, {height: screenHeight}]} onPress={() => {}}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleCloseScreen}>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{t('cancel')}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleSave}>
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.headerBtn}>{t('save')}</Text> 
                    </TouchableOpacity>
                </View>

                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.text}>{t('name')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={newName => setUserName(newName)}
                    value={userName}
                    onFocus={() => setScreenHeight(470)}
                    onBlur={() => setScreenHeight(345)}
                />

                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.text}>{t('email')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={newEmail => setUserEmail(newEmail)}
                    value={userEmail}
                    onFocus={() => setScreenHeight(580)}
                    onBlur={() => setScreenHeight(345)}
                />

                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.text}>{t('default_currency')}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <TouchableOpacity
                    style={[
                        styles.buttonPicker, 
                        selectedCurrency === "EUR" && styles.activeButton
                    ]}
                    onPress={() => setSelectedCurrency("EUR")}
                    >
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={selectedCurrency === "EUR" ? styles.activeText : styles.textPicker}>
                        {t('eur')}
                    </Text>
                    </TouchableOpacity>
        
                    <TouchableOpacity
                    style={[
                        styles.buttonPicker, 
                        selectedCurrency === "USD" && styles.activeButton
                    ]}
                    onPress={() => setSelectedCurrency("USD")}
                    >
                    <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={selectedCurrency === "USD" ? styles.activeText : styles.textPicker}>
                        {t('usd')}
                    </Text>
                    </TouchableOpacity>
                </View>
            </Pressable>
        </KeyboardAvoidingView>
        </Pressable>
    </>
  )
}


const styles = StyleSheet.create({
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
    backgroundColor: '#f5f5f5', // Бял фон за активния елемент
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
    text: {
    marginBottom: 10,
    fontSize: 17
  },
   row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  colorBox:{
    height: 50,
    width: 50,
    margin: 5,
    borderRadius: 25
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
    height: 350,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: "600" },
  headerBtn: { fontSize: 16, color: "#3077ceff" },
  label: { marginTop: 12, marginBottom: 6, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15
  },
  iconButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    width: 52,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
    maxHeight: "75%",
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "600" },
});
