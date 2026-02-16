import { Link, router, useNavigation } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable, TouchableOpacity} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useCategories } from "../context/CategoriesContext";
import { jwtDecode } from "jwt-decode";
import { apiFetch } from "../services/api";

const currencyMap: Record<string, number> = {
  EUR: 0,
  USD: 1
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("Free");
  
  const { reloadCategories } = useCategories();
  const handleRegister = async () => {
  setError("");
  if(!email || !password || !confirmPassword || !name || !selectedCurrency || !selectedPlan){
    Alert.alert(
      "Input error",
      "Fill out all fields!",
      [{ text: "OK" }]
    );
  }
  else if(password != confirmPassword){
    Alert.alert(
      "Input error",
      "Passwords must match!",
      [{ text: "OK" }]
    );
  }
  else{
    const registerInfo = {
      "Email": email,
      "Password": password,
      "IsPremium": selectedPlan == "Premium",
      "Name": name,
      "DefaultCurrency": currencyMap[selectedCurrency]
    }
    try{
      console.log(registerInfo);
      const response = await apiFetch("/Auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerInfo)
        });
      const data = await response.json();
      console.log(data);
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      const token = data.value;
      SecureStore.setItem("token", token);
      await reloadCategories();
      router.replace("/home");
    }
    catch(ex: any){
      setError(ex.message);
    }
  }   
}

  return (
      <View style = {[styles.container]}>
        <Text style= {styles.appTitle}>SmartBon</Text>  
        <Text style= {styles.title}>Sign Up</Text>
        <Text style = {error ? styles.error : {display: "none"}}>{error}</Text>
      <View>

            <Text style = {styles.label}>Email</Text>
                <TextInput
                  style = {styles.input}
                  onChangeText={newEmail => setEmail(newEmail)}
                  placeholder="Email"
                  value={email}>
                </TextInput>
            <Text style = {styles.label}>Password</Text>
                <TextInput
                  style = {styles.input}
                  onChangeText={newPassword => setPassword(newPassword)}
                  placeholder="Password"
                  secureTextEntry
                  value={password}>
                </TextInput> 
            <Text style = {styles.label}>Confirm Password</Text>
            <TextInput
              style = {styles.input}
              onChangeText={newConfirmPassword => setConfirmPassword(newConfirmPassword)}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}>
            </TextInput>

            <Text style = {styles.label}>Name</Text>
                <TextInput
                  style = {styles.input}
                  onChangeText={newName => setName(newName)}
                  placeholder="Name"
                  value={name}>
              </TextInput>
            <Text style={styles.label}>Default currency</Text>
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
            
            <Text style={styles.label}>Select plan</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[
                  styles.buttonPicker, 
                  selectedPlan === "Free" && styles.activeButton
                ]}
                onPress={() => setSelectedPlan("Free")}
              >
                <Text style={selectedPlan === "Free" ? styles.activeText : styles.textPicker}>
                  Free
                </Text>
              </TouchableOpacity>

                <TouchableOpacity
                style={[
                  styles.buttonPicker, 
                  selectedPlan === "Premium" && styles.activeButton
                ]}
                onPress={() => setSelectedPlan("Premium")}
              >
                <Text style={selectedPlan === "Premium" ? styles.activeText : styles.textPicker}>
                  Premium
                </Text>
              </TouchableOpacity>
            </View> 
          </View>
          <Pressable style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]} 
            onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </Pressable>
          <Link style={styles.link} href="/">Have an account? Sign in</Link>
        </View>
        );
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
    backgroundColor: '#edf9ff', // Бял фон за активния елемент
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
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center' ,
    backgroundColor: "#e1ebffff"    
  },
  title:{
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 20
  },
  label:{
    marginBottom: 10,
    marginTop: 10
  },
  input:{
    borderBlockColor: "black",
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: 250
  },
  error:{
    color: "red",
    display: "flex"
  },
  button:{
    borderRadius: 10,
    marginTop: 10,
    width: 150,
    backgroundColor: "#3077ceff"
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: "bold",
    padding: 10,
    textAlign: "center"
  },
  buttonPressed: {
  backgroundColor: '#2a64acff', // slightly darker
},
appTitle:{
  marginBottom: 50,
  fontSize: 50,
  color: "#3077ceff",
  fontWeight: "bold"
},
link:{
  textDecorationLine: "underline",
  color: "blue", 
  margin: 10
}
});