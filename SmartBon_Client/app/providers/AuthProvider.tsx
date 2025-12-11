import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';
import { AuthContextValue, AuthResponse, AuthStatus, LoginRequest, RegisterRequest } from '../types';
import { STORAGE_KEYS } from '../constants/config';
import { login as loginRequest, logout as logoutRequest, register as registerRequest } from '../services/authService';
import { setAuthToken } from '../services/apiClient';

const AuthContext = createContext<AuthContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>('checking');
  const [processing, setProcessing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const loadToken = async () => {
      const stored = await SecureStore.getItemAsync(STORAGE_KEYS.token);

      if (stored) {
        setToken(stored);
        setAuthToken(stored);
        setStatus('authenticated');
        return;
      }

      setStatus('unauthenticated');
    };

    loadToken();
  }, []);

  const persistToken = async (value: string) => {
    setToken(value);
    setAuthToken(value);
    await SecureStore.setItemAsync(STORAGE_KEYS.token, value);
  };

  const handleAuthSuccess = async (data: AuthResponse) => {
    const nextToken = data.value ?? data.token;

    if (!nextToken) {
      throw new Error('Token missing in auth response');
    }

    await persistToken(nextToken);
    setStatus('authenticated');
    router.replace('/home');
  };

  const signIn = async (payload: LoginRequest) => {
    setProcessing(true);
    setAuthError(null);

    try {
      const data = await loginRequest(payload);
      await handleAuthSuccess(data);
    } catch (error: any) {
      setStatus('unauthenticated');
      setAuthError(error?.message || 'Login failed');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const signUp = async (payload: RegisterRequest) => {
    setProcessing(true);
    setAuthError(null);

    try {
      await registerRequest(payload);
      setStatus('unauthenticated');
      router.replace('/');
    } catch (error: any) {
      setAuthError(error?.message || 'Registration failed');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  const signOut = async () => {
    setProcessing(true);

    try {
      await logoutRequest();
      setToken(null);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.token);
      setStatus('unauthenticated');
      router.replace('/');
    } finally {
      setProcessing(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      status,
      processing,
      authError,
      signIn,
      signUp,
      signOut
    }),
    [token, status, processing, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}
