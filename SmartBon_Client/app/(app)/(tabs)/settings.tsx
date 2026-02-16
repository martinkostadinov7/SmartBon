import {ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../../services/api";
import { Currency } from "../../types/expense";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const currencyFromNumber: Record<number, Currency> = {
  0: "EUR",
  1: "USD"
};

export default function SettingsScreen() {
  const [userName, setUserName] = useState("Unidentified");
  const [userEmail, setUserEmail] = useState("Unidentified");
  const [isUserPremium, setIsUserPremium] = useState(true);
  const [userJoined, setUserJoined] = useState("Unidentified");
  const [userDefaultCurrency, setUserDefaultCurrency] = useState("EUR");
  const [isBudgetLimitAlertEnabled, setIsBudgetLimitAlertEnabled] = useState(true);
  const [isMonthlyAppReportsEnabled, setIsMonthlyAppReportsEnabled] = useState(true);
  const [isMonthlyEmailReportsEnabled, setIsMonthlyEmailReportsEnabled] = useState(true);
  useFocusEffect(
  useCallback(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiFetch(`/Users/me`);
        if (!response.ok) throw new Error("Failed");
        const profileData = await response.json()
        setUserName(profileData.name);
        setUserEmail(profileData.email);
        setIsUserPremium(profileData.isPremium);
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


  function handleSignOut(){
   SecureStore.setItem("token", "");
   router.navigate("../../(auth)");
  }
return (<>
    <View style={[{padding: 15, backgroundColor: "#3077ceff"}]}>
      <Text style={{fontSize: 32, color: "white"}}>Settings</Text>
    </View>
    <ScrollView style={{backgroundColor: "#e1ebffff", flex: 1}}>

    <View style={styles.profileContainer}>
      <Text style={{fontSize: 26}}>{userName}</Text>
      <Text style={{fontSize: 18, marginTop: 5}}>{userEmail}</Text>
      <View style={[{marginTop: 10, borderRadius: 15, alignItems: "center"} , isUserPremium ? {backgroundColor: "#3077ceff", width: 110} : {backgroundColor: "gray", width: 60}]}>
        <Text style={{fontSize: 16, color: "white", margin: 5}}>{isUserPremium ? <FontAwesome6 name="crown" size={21} color="yellow" /> : ""}{isUserPremium ? " Premium" : "Free"}</Text>
      </View>

      <Text style={{fontSize: 16, marginTop: 5}}>Default Currency: {userDefaultCurrency}</Text>
      <Text style={{fontSize: 16, marginTop: 5}}>Joined: {userJoined}</Text>
    </View>

    <View style={{backgroundColor: "white" ,borderWidth: 2, borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
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

    <View style={{backgroundColor: "white" ,borderWidth: 2, borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Alerts and Reports</Text>

      <View style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <TouchableOpacity activeOpacity={0.9} style={styles.row} onPress={() => setIsBudgetLimitAlertEnabled(previousState => !previousState)}>
          <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="triangle-exclamation" size={21} color="black" />   Budget limit alert</Text>
          <Switch
            style={{margin:7}}
            trackColor={{ false: "#b1b1b1", true: "#00ae34" }}
            thumbColor={"#ffffff"}
            onValueChange={() => setIsBudgetLimitAlertEnabled(previousState => !previousState)}
            value={isBudgetLimitAlertEnabled}
          />
        </TouchableOpacity>
      </View>
      <View style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <TouchableOpacity activeOpacity={0.9} style={styles.row} onPress={() => setIsMonthlyAppReportsEnabled(previousState => !previousState)}>

          <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="calendar-check" size={21} color="black" />   Monthly in-app reports</Text>
          <Switch
              style={{margin:7}}
              trackColor={{ false: "#b1b1b1", true: "#00ae34" }}
              thumbColor={"#ffffff"}
              onValueChange={() => setIsMonthlyAppReportsEnabled(previousState => !previousState)}
              value={isMonthlyAppReportsEnabled}
            />
        </TouchableOpacity>
      </View>
      
      <View style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.13)", marginBottom: 10}}>
        <TouchableOpacity activeOpacity={0.9} style={styles.row} onPress={() => setIsMonthlyEmailReportsEnabled(previousState => !previousState)}>
          <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="envelope-open-text" size={21} color="black" />   Monthly email reports</Text>
          <Switch
              style={{margin:7}}
              trackColor={{ false: "#b1b1b1", true: "#00ae34" }}
              thumbColor={"#ffffff"}
              onValueChange={() => setIsMonthlyEmailReportsEnabled(previousState => !previousState)}
              value={isMonthlyEmailReportsEnabled}
            />
        </TouchableOpacity>
      </View>
    </View>

    <View style={{backgroundColor: "white" ,borderWidth: 2, borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Data</Text>

      <TouchableOpacity style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="file-import" size={21} color="black" />   Import data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{borderRadius:10,backgroundColor: "rgba(48, 119, 206, 0.32)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="file-export" size={21} color="black" />   Export data</Text>
      </TouchableOpacity>
    </View>

    <View style={{backgroundColor: "rgba(228, 67, 67, 0.33)" ,borderWidth: 2, borderRadius: 20, marginHorizontal: 15, marginBottom: 15, padding: 15}}>
      <Text style={{fontSize: 20, marginBottom: 20}}>Danger Zone</Text>

      <TouchableOpacity style={{borderRadius:10,backgroundColor: "rgba(228, 67, 67, 0.85)", marginBottom: 10}}>
        <Text style={{margin: 10, fontSize: 17}}><FontAwesome6 name="trash-can" size={21} color="black" />   Delete data</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={{borderRadius:10,backgroundColor: "rgba(228, 67, 67, 0.85)", marginBottom: 10}}>
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
    borderWidth: 2,
    alignSelf: "center",
    margin: 15,
    padding: 15
  }
});
