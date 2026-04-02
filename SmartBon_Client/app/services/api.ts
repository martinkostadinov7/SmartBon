import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/api";
import { router } from "expo-router";

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  // 1. Взимаме текущия Access Token
  let token = await SecureStore.getItemAsync("token");

  const headers = new Headers(options.headers);

  // 2. Обработка на Content-Type (твоята логика)
  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  } else {
    headers.delete("Content-Type");
  }

  // 3. Добавяме токена в хедърите
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Първи опит за заявка
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });

  // 4. АКО ТОКЕНЪТ Е ИЗТЕКЪЛ (401 Unauthorized)
  if (response.status === 401) {
    const refreshToken = await SecureStore.getItemAsync("refreshToken");

    if (refreshToken) {
      try {
        // Опитваме да вземем нов Access Token от бекенда
        const refreshResponse = await fetch(`${API_URL}/Auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refreshToken }),
        });

        if (refreshResponse.ok) {
          // Бекендът ти трябва да върне { token: "...", refreshToken: "..." }
          const newData = await refreshResponse.json();
            const accessToken = newData.jsonWebToken.value;
            const refreshToken = newData.refreshToken;
         console.log(newData);
             // ЗАПИСВАМЕ И ДВАТА ТОКЕНА
             await SecureStore.setItemAsync("token", accessToken);
             await SecureStore.setItemAsync("refreshToken", refreshToken);

          // Обновяваме хедъра на оригиналната заявка
          headers.set("Authorization", `Bearer ${newData.token}`);

          // 5. ПОВТАРЯМЕ ОРИГИНАЛНАТА ЗАЯВКА
          return fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: headers,
          });
        }
      } catch (error) {
        console.error("Failed to refresh token", error);
      }
    }

    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("refreshToken");
    router.replace("../(auth)");
  }

  return response;
}