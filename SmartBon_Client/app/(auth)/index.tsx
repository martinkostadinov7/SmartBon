// app/index.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';


export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://172.20.10.2:5107/api/Auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Login failed");
      }

      const token = await response.json();
      console.log(token);
      // data.token → твоят JWT токен
      await SecureStore.setItemAsync("token", token.value);

      setLoading(false);

      router.replace("/landing");

    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Error");
      console.log(err.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
      </TouchableOpacity>

<TouchableOpacity onPress={() => router.replace('/register')}>
  <Text style={styles.link}>Don't have an account? Register</Text>
</TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 40,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  link: {
    marginTop: 20,
    textAlign: "center",
    color: "#007AFF",
    fontSize: 16,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 10,
  }
});
