export type Lang = 'en' | 'zh'

export interface Substitution {
  missing: string
  alternative: string
  reason: string
}

export interface Recipe {
  name: string
  calories: number
  cookTime: string
  difficulty: string
  servings: number
  steps: string[]
  substitutions: Substitution[]
  shopping: string[]
  featuresMain: boolean
}

export interface HistoryEntry {
  label: string
  ingredients: string[]
  starred: string | null
  filters: FilterState
}

export interface FilterState {
  cuisine: string | null
  goal: string | null
  time: string | null
  meal: string | null
  skill: string | null
  diet: string | null
}

export type FilterKey = keyof FilterState
