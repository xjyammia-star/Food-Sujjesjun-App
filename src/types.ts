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
  ingredients: string[]
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

// Equipment feature — added for cooking equipment toggle
export type Equipment =
  | 'oven'
  | 'stovetop'
  | 'microwave'
  | 'airFryer'
  | 'slowCooker'
  | 'riceCooker'
  | 'blender'
  | 'grill'
  | 'instantPot'
  | 'toasterOven'
