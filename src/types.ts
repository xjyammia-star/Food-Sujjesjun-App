export type Lang = 'en' | 'zh'

export interface Substitution {
  missing: string
  use: string
  reason: string
}

export interface Nutrition {
  calories: number
  protein: string
  carbs: string
  fat: string
  fiber: string
  highlights: string[]
}

export interface Recipe {
  name: string
  mainIngredient: string
  calories: number
  cookTime: string
  difficulty: string
  servings: number
  steps: string[]
  substitutions: Substitution[]
  shopping: string[]
  nutrition: Nutrition
}

export interface ShoppingAnalysis {
  mustBuy: string[]
  niceToHave: string[]
  tip: string
}

export interface Selections {
  cuisine: number | null
  goal: number | null
  time: number | null
  meal: number | null
  skill: number | null
  diet: number | null
}
