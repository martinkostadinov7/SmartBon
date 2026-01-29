import { Link, router, useNavigation } from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useCategories } from "../context/CategoriesContext";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const { reloadCategories } = useCategories();
  const handleRegister = async () => {
  setError("");
  if(!email || !password || !confirmPassword){
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
      "Password": password
    }
    try{
      const response = await fetch("/Auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(registerInfo)
        });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      const token = data.value;
      SecureStore.setItem("token", token);
      interface TokenPayload {
        email: string;
        name: string;
        isPremium: string;
        currency: string;
      }

      const decoded = jwtDecode<TokenPayload>(token);
      SecureStore.setItem("currency", decoded.currency);
      SecureStore.setItem("isPremium", decoded.isPremium);
      SecureStore.setItem("name", decoded.name);
      
      await reloadCategories();
      router.replace("/home");
      
    }
    catch(ex: any){
      setError(ex.message);
    }
  }   
}

  return (
      <View style = {styles.container}>
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
      </View>
      <Pressable style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]} 
        onPress={handleRegister}>
      <Text style={styles.buttonText}>Register</Text>
    </Pressable>
      <Link style={styles.link} href="/">Have an account? Sign in</Link>
    </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center'     
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