import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/api";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const token = await SecureStore.getItemAsync("token");

  // 1. Използваме вградения Headers клас, който се справя с всички формати
  const headers = new Headers(options.headers);

  // 2. Добавяме Content-Type САМО ако НЕ изпращаме FormData
  // Важно: Проверяваме дали body съществува и дали е FormData
  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else {
    // Ако е FormData, ТРЯБВА да премахнем Content-Type, 
    // за да може fetch да генерира правилния multipart хедър с boundary
    headers.delete("Content-Type");
  }

  // 3. Добавяме токена
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });
}