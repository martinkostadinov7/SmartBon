import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../../services/api';
import { Currency } from '../../../types/expense';
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
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatedNewPassword, setRepeatedNewPassword] = useState("");
    const [screenHeight, setScreenHeight] = useState(345);
const { t, i18n } = useTranslation();
    function handleCloseScreen(){
           router.back();
       }
       async function handleSave(){
            try {
                if(newPassword != repeatedNewPassword){
                    throw new Error(`${t('passwords_dont_match')}`);
                }

                const passwordChange = {
                    "oldPassword": oldPassword,
                    "newPassword": newPassword
                }

                const response = await apiFetch(`/Users/changePassword`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(passwordChange),
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
  adjustsFontSizeToFit style={styles.text}>{t('old_password')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={oldPassword => setOldPassword(oldPassword)}
                    value={oldPassword}
                    onFocus={() => setScreenHeight(470)}
                    onBlur={() => setScreenHeight(345)}
                />

                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.text}>{t('new_password')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={newPassword => setNewPassword(newPassword)}
                    value={newPassword}
                    onFocus={() => setScreenHeight(580)}
                    onBlur={() => setScreenHeight(345)}
                />

                
                <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.text}>{t('repeat_password')}</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={repeatedNewPassword => setRepeatedNewPassword(repeatedNewPassword)}
                    value={repeatedNewPassword}
                    onFocus={() => setScreenHeight(660)}
                    onBlur={() => setScreenHeight(345)}
                />
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
