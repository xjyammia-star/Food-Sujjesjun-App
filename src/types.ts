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
  imagePrompt?: string
  image?: string
  cuisine?: number | null
  goal?: number | null
  meal?: number | null
  diet?: number | null
  ingredients: string[]
  steps: string[]
  substitutions: Substitution[]
  shopping: string[]
  tips: string[]
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

// Pantry staples
export type Staple =
  | 'salt' | 'oil' | 'sugar' | 'water' | 'sowSauce'
  | 'blackPepper' | 'garlic' | 'ginger' | 'onion' | 'flour' | 'cornstarch' | 'vinegar' | 'honey'
  | 'oysterSauce' | 'darkSoySauce' | 'sesameOil' | 'shaoxingWine' | 'doubanjiang' | 'chickenPowder' | 'starAnise' | 'sichuanPepper'
  | 'misoSoup' | 'mirin' | 'sake' | 'riceVinegar' | 'dashi' | 'togarashi'
  | 'fishSauce' | 'coconutMilk' | 'thaiBeanPaste' | 'lemongrass' | 'limejuice'
  | 'oliveoil' | 'driedOregano' | 'paprika' | 'cumin' | 'butter' | 'cream' | 'bay'
  | 'garam' | 'turmeric' | 'coriander' | 'cardamom' | 'chiliPowder'
