import { create } from 'zustand';

interface ExpenseState {
  tempCategoryId: number | null;
  tempSubcategoryId: number | null;
  setTempCategoryId: (id: number) => void;
  setTempSubcategoryId: (id: number) => void;
  clearTempData: () => void;
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  tempCategoryId: null,
  tempSubcategoryId: null,
  
  setTempCategoryId: (id: number) => set({ tempCategoryId: id }),
  
  setTempSubcategoryId: (id: number) => set({ tempSubcategoryId: id }),
  
  clearTempData: () => set({ tempCategoryId: null, tempSubcategoryId: null }),
}));