import { apiFetch } from "./api";
import { Category } from "../types/category";

export async function fetchCategories(): Promise<Category[]> {
  const response = await apiFetch("/Categories");
  if (!response.ok) {
    throw new Error("Failed to load categories");
  }
  return response.json();
}