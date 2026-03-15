export interface RecipeIngredient {
  name: string;
  nameIs: string; // Icelandic name
  amount: number;
  unit: "g" | "ml" | "stk"; // grams, milliliters, pieces
  category: "meat" | "dairy" | "produce" | "pantry" | "sauce" | "other";
  providedByKit: boolean; // true = comes in the Eldum Rétt box
}

export type DietaryWarningType = "seed_oil" | "pork" | "chicken";

export interface DietaryWarning {
  type: DietaryWarningType;
  label: string;
  detail: string; // what triggered it (e.g. "maíssíróp", "svínakjöt")
}

export interface Recipe {
  id: string;
  name: string;
  nameIs: string;
  portions: number;
  priceIsk?: number; // Eldum Rétt price in ISK
  ingredients: RecipeIngredient[];
  innihaldslysing: string; // full Icelandic ingredient description from Eldum Rétt
  needAtHome: string[]; // things you need to have (oil, salt, etc.)
  nutrition?: {
    per100g: {
      energy: string;
      fat: string;
      saturatedFat: string;
      carbs: string;
      sugar: string;
      fiber: string;
      protein: string;
      salt: string;
    };
  };
}

export interface StoreProduct {
  id: string;
  name: string;
  nameIs: string;
  amount: number;
  unit: "g" | "ml" | "stk";
  priceIsk: number;
  store: string;
  category: RecipeIngredient["category"];
}

export interface ShoppingListItem {
  ingredient: RecipeIngredient;
  storeProduct: StoreProduct | null;
  quantityNeeded: number; // how much the recipe needs
  packagesToBuy: number; // how many store packages
  leftover: number; // leftover in grams/ml
  costIsk: number;
}

export interface ShoppingList {
  recipes: Recipe[];
  items: ShoppingListItem[];
  totalCostIsk: number;
  eldumRettCostIsk: number;
  savingsIsk: number;
}
