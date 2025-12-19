import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await SecureStore.getItemAsync("token");

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}