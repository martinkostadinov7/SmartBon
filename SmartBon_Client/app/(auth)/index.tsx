import { Link } from "expo-router";
import React, { useEffect, useState } from "react";
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  Pressable, KeyboardAvoidingView, Platform, ScrollView 
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { apiFetch } from "../../services/api";
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Икони

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkToken() {
      const token = await SecureStore.getItemAsync("token");
      if (token) {
        router.replace("/(app)/home");
      }
    }
    checkToken();
  }, []);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      Alert.alert("Грешка", "Моля, попълнете всички полета!");
      return;
    }

    setLoading(true);
    try {
      const loginInfo = { "Email": email, "Password": password };
      const response = await apiFetch("/Auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginInfo)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Неуспешен вход");
      }

      await SecureStore.setItemAsync("token", data.jsonWebToken.value);
      await SecureStore.setItemAsync("refreshToken", data.refreshToken);

      router.replace("/(app)/home");
    } catch (ex: any) {
      setError(ex.message || "Възникна грешка при свързване");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.header}>
          <Text style={styles.appTitle}>SmartBon</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Вход</Text>
          
          {error ? (
            <View style={styles.errorBanner}>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#ff4d4d" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Имейл</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={setEmail}
                placeholder="example@mail.com"
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Парола</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                onChangeText={setPassword}
                placeholder="********"
                secureTextEntry
                value={password}
              />
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed || loading ? styles.buttonPressed : null
            ]} 
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Влизане..." : "Влез"}</Text>
          </Pressable>
        </View>

        <Link style={styles.link} href="/register">
          <Text>Нямате акаунт? </Text>
          <Text style={styles.linkBold}>Регистрирайте се</Text>
        </Link>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff", // По-меко синьо
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  appTitle: {
    fontSize: 42,
    color: "#3077ce",
    fontWeight: "900",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: -5,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5, // За Android
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff2f2",
    padding: 10,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#ffcccc",
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  button: {
    borderRadius: 12,
    marginTop: 10,
    backgroundColor: "#3077ce",
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#3077ce",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonPressed: {
    backgroundColor: '#255da3',
    transform: [{ scale: 0.98 }], // Леко свиване при натискане
  },
  link: {
    marginTop: 25,
    textAlign: "center",
    color: "#666",
    fontSize: 15,
  },
  linkBold: {
    color: "#3077ce",
    fontWeight: "bold",
    textDecorationLine: "underline",
  }
});