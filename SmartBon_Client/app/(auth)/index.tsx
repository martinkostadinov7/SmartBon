import { Link} from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Pressable} from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { apiFetch } from "../../services/api";
import { jwtDecode } from "jwt-decode";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
  async function checkToken() {
    // Преди беше "", трябва да е името на ключа, например "token"
    const token = await SecureStore.getItemAsync("token");
    
    if (token) {
      // Тук е добре да добавиш проверка дали токенът не е изтекъл 
      // с jwtDecode, но за начало и това работи
      router.replace("/(app)/home");
    }
  }
  checkToken();
}, []);
  const handleLogin = async () => {
  setError("");
  if (!email || !password) {
    Alert.alert("Input error", "Fill out email and password fields!");
    return; // Спираме изпълнението тук
  }

  const loginInfo = { "Email": email, "Password": password };

  try {
    const response = await apiFetch("/Auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginInfo)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }
  
    const accessToken = data.jsonWebToken.value;
    const refreshToken = data.refreshToken;

    // ЗАПИСВАМЕ И ДВАТА ТОКЕНА
    await SecureStore.setItemAsync("token", accessToken);
    await SecureStore.setItemAsync("refreshToken", refreshToken);

    router.replace("/(app)/home");
  } catch (ex : any) {
    console.error(ex);
    setError(ex.message || "Error");
  }
};

  return (

      <View style = {styles.container}>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style= {styles.appTitle}>SmartBon</Text>  
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style= {styles.title}>Sign In</Text>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style = {error ? styles.error : {display: "none"}}>{error}</Text>
      <View>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style = {styles.label}>Email</Text>
            <TextInput
              style = {styles.input}
              onChangeText={newEmail => setEmail(newEmail)}
              placeholder="Email"
              value={email}>
            </TextInput>
        <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style = {styles.label}>Password</Text>
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
      <Text 
  numberOfLines={1} 
  adjustsFontSizeToFit style={styles.buttonText}>Sign In</Text>
    </Pressable>
      <Link style={styles.link} href="/register">Don't have an account? Sign Up</Link>
    </View>);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center'  ,
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
