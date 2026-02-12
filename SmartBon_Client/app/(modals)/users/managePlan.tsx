import { View, Text, ScrollView, Pressable, KeyboardAvoidingView, StyleSheet, TouchableOpacity, Alert, TextInput, Keyboard } from 'react-native'
import React, { useCallback, useState } from 'react'
import { router, useFocusEffect } from 'expo-router';
import { apiFetch } from '../../services/api';
import { Currency } from '../../types/expense';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

const currencyFromString: Record<string, number> = {
  "EUR": 0,
  "USD": 1
};

export default function ChangeCategory() {
    const [screenHeight, setScreenHeight] = useState(765);
    const [isUserPremium, setIsUserPremium] = useState(false);
    
    async function handleUpgradePlan(){
        setIsUserPremium(true);
        try { 
                const response = await apiFetch(`/Users/managePlan?isPremium=true`, {
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

    async function handleSwitchToFree(){
        setIsUserPremium(false);
        try { 
                const response = await apiFetch(`/Users/managePlan?isPremium=false`, {
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

    useFocusEffect(
             useCallback(() => {
               const fetchProfile = async () => {
                 try {
                   const response = await apiFetch(`/Users/me`);
                   if (!response.ok) throw new Error("Failed");
                   const profileData = await response.json();
                   setIsUserPremium(profileData.isPremium);
                 } catch (error) {
                   console.error(error);
                 }
               };
               fetchProfile();
               return () => {}; 
             }, []) 
           );
    function handleCloseScreen(){
           router.back();
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
                    <Text style={styles.headerBtn}>Cancel</Text>
                    </TouchableOpacity>
                </View>
                <View style={{borderWidth: isUserPremium ? 1 : 3, borderRadius: 15, padding: 10, backgroundColor: "#ececec"}}>
                    <Text style={{fontSize: 24, textAlign: "center", fontWeight: "bold", marginBottom: 15}}>Free</Text>
                    <View style={styles.row}>
                        <FontAwesome6 name="chart-simple" size={21} color="black" /><Text style={{fontSize: 16, }}>  Basic Stats: Essential insights.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="calendar-days" size={21} color="black" /><Text style={{fontSize: 16}}>  Flexible Budgets: Weekly to yearly.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="camera" size={21} color="black" /><Text style={{fontSize: 16}}>  Scan Receipts: Up to 5 uses.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="bullseye" size={21} color="black" /><Text style={{fontSize: 16}}>   Savings Goals: Up to 2 targets.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="filter" size={21} color="black" /><Text style={{fontSize: 16}}>  Smart Filters: By date or amount.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="bell" size={21} color="black" /><Text style={{fontSize: 16}}>  Budget Limit Alerts: Stay on track.</Text>
                    </View>
                    
                    {isUserPremium ? 
                    (<TouchableOpacity  onPress={handleSwitchToFree} style={{backgroundColor: "#909090", borderRadius: 10, marginTop: 1, borderWidth: 1}}>
                        <Text style={{fontSize: 20, textAlign: "center", margin: 10}}>Switch to free</Text>
                    </TouchableOpacity>) : 
                    (<View style={{backgroundColor: "#b8b8b8", borderRadius: 10, marginTop: 1, borderWidth: 1}}>
                        <Text style={{fontSize: 20, textAlign: "center", margin: 10}}>Current plan</Text>
                    </View>)}
                </View>

                <View style={{borderWidth: isUserPremium ? 3 : 1, borderRadius: 15, padding: 10, backgroundColor: "rgba(48, 119, 206, 0.62)", marginTop: 15}}>
                    <View style={[styles.row, {justifyContent: "center", marginBottom: 15}]}>
                        <FontAwesome6 name="crown" size={25} color="yellow" /><Text style={{fontSize: 24, textAlign: "center", fontWeight: "bold"}}>   Premium</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="star" size={21} color="black" /><Text style={{fontSize: 16, }}>  All Free Features: Plus more.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="infinity" size={21} color="black" /><Text style={{fontSize: 16}}>  Unlimited Scans: No usage limits.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="chart-line" size={21} color="black" /><Text style={{fontSize: 16}}>  Full Analytics: Advanced reports.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="tags" size={21} color="black" /><Text style={{fontSize: 16}}>  Custom Categories: Total control.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="arrows-rotate" size={21} color="black" /><Text style={{fontSize: 16}}>  Recurring Bills: Auto-track subs.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="file-export" size={21} color="black" /><Text style={{fontSize: 16}}>  CSV Export/Import: Manage data.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="envelope" size={21} color="black" /><Text style={{fontSize: 16}}>  Email Reports: Monthly to inbox.</Text>
                    </View>
                    <View style={styles.row}>
                        <FontAwesome6 name="gem" size={21} color="black" /><Text style={{fontSize: 16}}>  Unlimited Goals: No target limits.</Text>
                    </View>

                    {isUserPremium ? 
                    (<View style={{backgroundColor: "rgba(48, 119, 206, 0.69)", borderRadius: 10, marginTop: 10, borderWidth: 2}}>
                        <Text style={{fontSize: 20, textAlign: "center", margin: 10}}>Current plan</Text>
                    </View>) : 
                    (<TouchableOpacity onPress={handleUpgradePlan} style={{backgroundColor: "yellow", borderRadius: 10, marginTop: 10, borderWidth: 2}}>
                        <Text style={{fontSize: 20, textAlign: "center", margin: 10}}>Upgrade</Text>
                    </TouchableOpacity>)}
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
    alignItems: 'center',
    marginBottom: 8
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
