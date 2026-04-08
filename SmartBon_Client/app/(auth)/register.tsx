import { Link, router } from "expo-router";
import React, { useState } from "react";
import { 
  View, Text, TextInput, StyleSheet, Alert, 
  Pressable, TouchableOpacity, ScrollView, 
  KeyboardAvoidingView, Platform 
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { apiFetch } from "../../services/api";
import { MaterialCommunityIcons } from '@expo/vector-icons';

const currencyMap: Record<string, number> = { EUR: 0, USD: 1 };

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState("EUR");
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    if (!email || !password || !confirmPassword || !name) {
      Alert.alert("Грешка", "Моля, попълнете всички полета!");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Грешка", "Паролите не съвпадат!");
      return;
    }

    setLoading(true);
    try {
      const registerInfo = {
        "Email": email,
        "Password": password,
        "IsPremium": selectedPlan === "Premium",
        "Name": name,
        "DefaultCurrency": currencyMap[selectedCurrency]
      };

      const response = await apiFetch("/Auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registerInfo)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Грешка при регистрация");

      await SecureStore.setItemAsync("token", data.value);
      router.replace("/(app)/home");
    } catch (ex: any) {
      setError(ex.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <Text style={styles.appTitle}>SmartBon</Text>
          <Text style={styles.subtitle}>Създай своя акаунт</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Input Fields */}
          <InputField label="Име" icon="account-outline" value={name} onChangeText={setName} placeholder="Иван Иванов" />
          <InputField label="Имейл" icon="email-outline" value={email} onChangeText={setEmail} placeholder="email@example.com" keyboardType="email-address" />
          <InputField label="Парола" icon="lock-outline" value={password} onChangeText={setPassword} placeholder="********" secureTextEntry />
          <InputField label="Потвърди парола" icon="lock-check-outline" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="********" secureTextEntry />

          {/* Currency Selector */}
          <Text style={styles.sectionLabel}>Основна валута</Text>
          <View style={styles.segmentedControl}>
            {["EUR", "USD"].map((curr) => (
              <TouchableOpacity 
                key={curr}
                style={[styles.segment, selectedCurrency === curr && styles.activeSegment]}
                onPress={() => setSelectedCurrency(curr)}
              >
                <Text style={[styles.segmentText, selectedCurrency === curr && styles.activeSegmentText]}>{curr}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Plan Selector */}
          <Text style={styles.sectionLabel}>Избери план</Text>
          <View style={styles.segmentedControl}>
            {["Free", "Premium"].map((plan) => (
              <TouchableOpacity 
                key={plan}
                style={[styles.segment, selectedPlan === plan && styles.activeSegment]}
                onPress={() => setSelectedPlan(plan)}
              >
                <Text style={[styles.segmentText, selectedPlan === plan && styles.activeSegmentText]}>{plan}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Pressable 
            style={({ pressed }) => [styles.button, (pressed || loading) && styles.buttonPressed]} 
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.buttonText}>{loading ? "Обработка..." : "Регистрирай се"}</Text>
          </Pressable>
        </View>

        <Link style={styles.link} href="/">
          <Text>Вече имаш акаунт? </Text>
          <Text style={styles.linkBold}>Влез тук</Text>
        </Link>
        
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Помощен компонент за полетата
function InputField({ label, icon, ...props }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name={icon} size={20} color="#666" style={styles.inputIcon} />
        <TextInput style={styles.input} placeholderTextColor="#999" {...props} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4ff" },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', padding: 20, paddingVertical: 50 },
  header: { alignItems: 'center', marginBottom: 30 },
  appTitle: { fontSize: 38, color: "#3077ce", fontWeight: "900" },
  subtitle: { fontSize: 16, color: "#666" },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 13, color: "#555", marginBottom: 4, fontWeight: "600", marginLeft: 4 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#f9f9f9",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 10, fontSize: 15, color: "#333" },
  sectionLabel: { fontSize: 13, color: "#555", marginTop: 10, marginBottom: 8, fontWeight: "600", textAlign: 'center' },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
  },
  segment: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeSegment: { backgroundColor: 'white', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 2, elevation: 2 },
  segmentText: { fontSize: 14, color: '#888', fontWeight: '500' },
  activeSegmentText: { color: '#3077ce', fontWeight: '700' },
  button: {
    backgroundColor: "#3077ce",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: "bold" },
  buttonPressed: { opacity: 0.8 },
  errorBanner: { backgroundColor: "#fff2f2", padding: 10, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: "#ffcccc" },
  errorText: { color: "#ff4d4d", textAlign: 'center', fontSize: 13 },
  link: { marginTop: 20, textAlign: "center", color: "#666" },
  linkBold: { color: "#3077ce", fontWeight: "bold" }
});