import { Link} from "expo-router";
import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable} from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { apiFetch } from "../services/api";
import { useCategories } from "../context/CategoriesContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { reloadCategories } = useCategories();
  const handleLogin = async () => {
    setError("");
    if(!email || !password){
      Alert.alert(
        "Input error",
        "Fill out email and password fields!",
        [{ text: "OK" }]
      );
    }
    else{
    const loginInfo = {
      "Email": email,
      "Password": password
    }
    try{
      const response = await apiFetch("/Auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(loginInfo)
        });
        const data = await response.json();
        console.log(data);
              
        if (!response.ok) {
          throw new Error(data.message || "Login failed");
        }
        const token = data.value;
        SecureStore.setItem("token", token);
        await reloadCategories();
        router.replace("/(app)/home");
    }
    catch(ex: any){
      console.error(ex)
      setError(ex.message || "Error")
    }
  }
}

  return (
      <View style = {styles.container}>
        <Text style= {styles.appTitle}>SmartBon</Text>  
        <Text style= {styles.title}>Sign In</Text>
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
      </View>
      <Pressable style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
      ]} 
        onPress={handleLogin}>
      <Text style={styles.buttonText}>Sign In</Text>
    </Pressable>
      <Link style={styles.link} href="/register">Don't have an account? Sign Up</Link>
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
