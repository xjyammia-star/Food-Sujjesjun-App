// types.ts

import type { Equipment } from './components/EquipmentPanel';

export interface Nutrition {
  calories: number;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
}

export interface Recipe {
  name: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  difficulty: string;
  nutrition: Nutrition;
  substitutions: string[];
  shoppingList: string[];
}

export interface ShoppingAnalysis {
  mustBuy: string[];
  niceToHave: string[];
  dietTip: string;
}

export interface Selections {
  cuisine: string;
  nutritionGoal: string;
  cookTime: string;
  mealType: string;
  skillLevel: string;
  dietary: string[];
  pantryStaples: string[];
  /** Equipment the user has available — recipes must not require anything absent from this set */
  availableEquipment: Equipment[];
}
