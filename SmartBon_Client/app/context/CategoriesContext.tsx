import { createContext, useContext, useState } from "react";
import { Category } from "../types/category";
import { fetchCategories } from "../services/categoriesService";

interface CategoriesContextType {
  categories: Category[];
  reloadCategories: () => Promise<void>;
  // Добавяме тези двете:
  tempCategory: { cid: number; sid: number };
  setTempCategory: (selection: { cid: number; sid: number }) => void;
}
const CategoriesContext = createContext<CategoriesContextType | null>(null);

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  // Стейтът за временния избор:
  const [tempCategory, setTempCategory] = useState({ cid: -1, sid: -1 });

  async function load() {
    const data = await fetchCategories();
    setCategories(data);
  }

  return (
    <CategoriesContext.Provider
      value={{ 
        categories, 
        reloadCategories: load, 
        tempCategory, 
        setTempCategory // Даваме достъп на екраните до тази функция
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) {
    throw new Error("useCategories must be used inside CategoriesProvider");
  }
  return ctx;
}
