import * as SecureStore from "expo-secure-store";
import { API_URL } from "../config/api";
import { router } from "expo-router";

// --- Глобални променливи за управление на опашката (извън функцията) ---
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Функция, която добавя провалила се заявка към списъка с чакащи
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Функция, която "събужда" всички чакащи заявки и им предава новия токен
const onRefreshed = (newToken: string) => {
  console.log(`[Queue] Изпълняваме опашката за ${refreshSubscribers.length} чакащи заявки.`);
  refreshSubscribers.map((callback) => callback(newToken));
  refreshSubscribers = [];
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  console.log(`[apiFetch] Начало: ${endpoint}`);

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

  // Първи опит за заявка
  let response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: headers,
  });

  console.log(`[apiFetch] Статус (${endpoint}): ${response.status}`);

  // ПРОВЕРКА ЗА 401 (Изтекъл токен)
  if (response.status === 401) {
    console.log(`[apiFetch] Засечен 401 при ${endpoint}. Проверка на Refresh състояние...`);

    // 1. Ако ВЕЧЕ тече опресняване в друга заявка
    if (isRefreshing) {
  console.log(`[Queue] ${endpoint} влиза в опашката...`);
  
  // Добавяме <Response> тук:
  return new Promise<Response>((resolve) => {
    subscribeTokenRefresh(async (newToken: string) => {
      console.log(`[Queue] ${endpoint} събудена!`);
      headers.set("Authorization", `Bearer ${newToken}`);
      
      const retryRes = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
      
      // Сега TypeScript знае, че resolve връща Response
      resolve(retryRes); 
    });
  });
}

    // 2. Ако това е ПЪРВАТА заявка, която засича 401
    isRefreshing = true;
    console.log(`[apiFetch] Първичен Refresh стартиран от: ${endpoint}`);

    const storedRefreshToken = await SecureStore.getItemAsync("refreshToken");

    if (storedRefreshToken) {
      try {
        console.log("[apiFetch] Изпращане на Refresh Token към бекенда...");
        const refreshResponse = await fetch(`${API_URL}/Auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storedRefreshToken),
        });

        if (refreshResponse.ok) {
          const newData = await refreshResponse.json();
          const newAccessToken = newData.jsonWebToken.value;
          const newRefreshToken = newData.refreshToken;

          console.log("[apiFetch] РЕФРЕШ УСПЕШЕН. Записване на нови токени...");
          await SecureStore.setItemAsync("token", newAccessToken);
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);

          // КРАЙ НА РЕФРЕША - Освобождаваме пътя
          isRefreshing = false;
          
          // Казваме на всички останали "Чакането свърши!"
          onRefreshed(newAccessToken);

          // Повтаряме ТАЗИ (първата) заявка
          headers.set("Authorization", `Bearer ${newAccessToken}`);
          console.log(`[apiFetch] Повтаряме първоначалната заявка: ${endpoint}`);
          return await fetch(`${API_URL}${endpoint}`, { ...options, headers });
        } else {
          console.log(`[apiFetch] Грешка при Refresh заявката: ${refreshResponse.status}`);
        }
      } catch (error) {
        console.error("[apiFetch] Фатална грешка в Refresh Flow:", error);
      }
    }

    // 3. Ако всичко се провали (няма Refresh Token или бекендът върна 400/401 за него)
    console.log("[apiFetch] Провал на целия процес. Logout...");
    isRefreshing = false;
    refreshSubscribers = []; // Изчистваме опашката
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("refreshToken");
    router.replace("/(auth)");
    return response;
  }

  return response;
}