import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { apiFetch } from '../../services/api';

export default function ChangeLanguage() {
const { t, i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'bg');
const languages = [
  { code: 'bg', label: 'Български', flag: '🇧🇬' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
];

    function handleCloseScreen(){
           router.back();
       }

       async function handleSave(){
            try { 
              const response = await apiFetch(`/Users/changeLanguage?language=${selectedLanguage}`, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
              }
              });
              if (!response.ok) 
              {
                  const errorData = await response.json(); 
                  throw new Error(errorData.message || `${t('error_occured')}`);
              }
          } catch (e: any) {

          Alert.alert(
              `${t('error')}`,
              e?.message,
              [{ text: "OK" }]
              );
              console.log("Network/API error:", e?.message.message ?? e);
          }
            i18n.changeLanguage(selectedLanguage);
            handleCloseScreen();
       }

       
  return (
  <>
    <Pressable style={styles.overlay} onPress={handleCloseScreen}>
    <KeyboardAvoidingView
        style={styles.wrapper}
    >
        <Pressable style={[styles.container]} onPress={() => {}}>
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
    
    <ScrollView style={styles.languageContainer}>
      {languages.map((lang) => (
        <TouchableOpacity 
          key={lang.code} 
          style={[
            styles.button, 
            selectedLanguage === lang.code && styles.activeLanguage
          ]}
          onPress={() => setSelectedLanguage(lang.code)}
        >
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.flag}>{lang.flag}</Text>
          <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.labelLanguage}>{lang.label}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
  languageContainer: {
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  activeLanguage: {
    borderColor: '#4CAF50', // Зелено, за да съвпада с фискалната тема
    backgroundColor: '#e8f5e9',
  },
  flag: {
    fontSize: 20,
    marginRight: 8,
  },
  labelLanguage: {
    fontSize: 16,
    fontWeight: '500',
  },
});
