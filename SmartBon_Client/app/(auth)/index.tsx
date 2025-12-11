import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';

export default function LoginScreen() {
  const { signIn, status, processing, authError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/home');
    }
  }, [status]);

  const handleLogin = async () => {
    setError(null);

    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

    try {
      await signIn({ email, password });
    } catch (err: any) {
      setError(err?.message || 'Unable to sign in');
    }
  };

  const displayedError = error || authError;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
      <Text style={styles.subtitle}>Sign in to keep tracking your expenses.</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />

      {displayedError ? <Text style={styles.error}>{displayedError}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={processing}>
        {processing ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Login</Text>}
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
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
    color: colors.text
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 28,
    color: colors.muted
  },
  input: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border
  },
  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700'
  },
  link: {
    marginTop: 20,
    textAlign: 'center',
    color: colors.primary,
    fontSize: 16
  },
  error: {
    color: colors.danger,
    textAlign: 'center',
    marginBottom: 10
  }
});
