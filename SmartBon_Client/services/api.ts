import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/api";
import { router } from "expo-router";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  let token = await SecureStore.getItemAsync("token");
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData)) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });

  // АКО ТОКЕНЪТ Е ИЗТЕКЪЛ
  if (response.status === 401) {
  const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");

  if (storedRefreshToken) {
    try {
      const refreshResponse = await fetch(`${API_URL}/Auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storedRefreshToken),
      });

      if (refreshResponse.ok) {
        const newData = await refreshResponse.json();
        const newAccessToken = newData.jsonWebToken.value;
        const newRefreshToken = newData.refreshToken;

        await SecureStore.setItemAsync("token", newAccessToken);
        await SecureStore.setItemAsync("refreshToken", newRefreshToken);

        headers.set("Authorization", `Bearer ${newAccessToken}`);

        // КРИТИЧНО: Трябва да върнеш (return) резултата от новата заявка тук!
        return await fetch(`${API_URL}${endpoint}`, {
          ...options,
          headers: headers,
        });
      }
    } catch (error) {
      console.error("Refresh flow failed:", error);
    }
  }

  // АКО СТИГНЕМ ДОТУК, значи или нямаме refreshToken, 
  // или заявката за нов токен е върнала грешка (напр. 400 Bad Request)
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("refreshToken");
  router.replace("/(auth)"); 
  
  // Връщаме оригиналния отговор, за да не "зависне" функцията
  return response;
}

  return response;
}