import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CategoriesContextValue, CategoriesState, Category } from '../types';
import { STORAGE_KEYS } from '../constants/config';
import { fetchCategories } from '../services/categoryService';
import { useAuth } from '../hooks/useAuth';

const CategoriesContext = createContext<CategoriesContextValue | null>(null);

type Props = {
  children: React.ReactNode;
};

export function CategoriesProvider({ children }: Props) {
  const { status, signOut } = useAuth();
  const [state, setState] = useState<CategoriesState>({
    items: [],
    loading: false,
    error: null
  });

  const normalizeIconType = (iconType: any): 'Url' | 'Emoji' | 'FontAwesome' => {
    if (iconType === 'Emoji' || iconType === 1) return 'Emoji';
    if (iconType === 'FontAwesome' || iconType === 2) return 'FontAwesome';
    return 'Url';
  };

  const normalizeCategories = (items: any[]): Category[] =>
    (items || []).map((cat) => ({
      ...cat,
      iconType: normalizeIconType(cat?.iconType),
      subcategories: (cat?.subcategories || []).map((sub: any) => ({
        ...sub,
        iconType: normalizeIconType(sub?.iconType)
      }))
    }));

  const loadFromStorage = useCallback(async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.categories);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Category[];
      const normalized = normalizeCategories(parsed);
      setState((prev) => ({ ...prev, items: normalized }));
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEYS.categories);
    }
  }, []);

  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const items = await fetchCategories();
      const normalized = normalizeCategories(items);
      setState({ items: normalized, loading: false, error: null });
      await AsyncStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(normalized));
    } catch (error: any) {
      const statusCode = error?.response?.status;

      if (statusCode === 401) {
        await signOut();
        return;
      }

      setState((prev) => ({
        ...prev,
        loading: false,
        error: error?.message || 'Failed to load categories'
      }));
    }
  }, [signOut]);

  useEffect(() => {
    if (status !== 'authenticated') {
      setState({ items: [], loading: false, error: null });
      AsyncStorage.removeItem(STORAGE_KEYS.categories);
      return;
    }

    loadFromStorage().finally(() => {
      refresh();
    });
  }, [status, loadFromStorage, refresh]);

  const value = useMemo<CategoriesContextValue>(
    () => ({
      ...state,
      refresh
    }),
    [state, refresh]
  );

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
}

export function useCategoriesContext() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error('useCategoriesContext must be used within a CategoriesProvider');
  }
  return ctx;
}
