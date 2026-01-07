import { Expense } from "../types/expense";
import { apiFetch } from "./api";

export async function fetchRecentExpenses(): Promise<Expense[]> {
  const response = await apiFetch("/Expenses/recent/10");
  if (!response.ok) {
    throw new Error("Failed to load categories");
  }
  return response.json();
}