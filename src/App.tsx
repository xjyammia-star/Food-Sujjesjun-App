import { useState, useCallback } from 'react'
import type { FilterKey, FilterState, HistoryEntry, Recipe } from './types'
import type { Lang } from './types'
import { translations } from './translations'
import { generateRecipes } from './api'
import IngredientInput from './components/IngredientInput'
import FilterPanel from './components/FilterPanel'
import RecipeCard from './components/RecipeCard'
import styles from './App.module.css'

const DEFAULT_FILTERS: FilterState = {
  cuisine: null,
  goal: null,
  time: null,
  meal: null,
  skill: null,
  diet: null,
}

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [starred, setStarred] = useState<string | null>(null)
  const [staples, setStaples] = useState(true)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [toast, setToast] = useState<string | null>(null)

  const t = translations[lang]

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2200)
  }

  function addIngredient(val: string) {
    setIngredients((prev) => [...prev, val])
  }

  function removeIngredient(val: string) {
    setIngredients((prev) => prev.filter((i) => i !== val))
    if (starred === val) setStarred(null)
  }

  function toggleStar(val: string) {
    setStarred((prev) => (prev === val ? null : val))
  }

  function updateFilter(key: FilterKey, value: string | null) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  function addToHistory() {
    const label =
      ingredients.slice(0, 3).join(', ') + (ingredients.length > 3 ? '…' : '')
    const entry: HistoryEntry = {
      label,
      ingredients: [...ingredients],
      starred,
      filters: { ...filters },
    }
    setHistory((prev) => [entry, ...prev].slice(0, 5))
  }

  function restoreHistory(entry: HistoryEntry) {
    setIngredients(entry.ingredients)
    setStarred(entry.starred)
    setFilters(entry.filters)
    handleGenerate(entry.ingredients, entry.starred, entry.filters)
  }

  async function handleGenerate(
    ingrs = ingredients,
    star = starred,
    fil = filters,
  ) {
    if (!ingrs.length) {
      setError(t.noIngr)
      return
    }
    setLoading(true)
    setError(null)
    setRecipes([])
    addToHistory()

    try {
      const result = await generateRecipes(lang, ingrs, star, staples, fil)
      setRecipes(result)
    } catch {
      setError(t.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.app}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.sub}>{t.sub}</p>
        </div>
        <div className={styles.langToggle}>
          <button
            className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            className={`${styles.langBtn} ${lang === 'zh' ? styles.langActive : ''}`}
            onClick={() => setLang('zh')}
          >
            中文
          </button>
        </div>
      </div>

      {/* Ingredient input */}
      <IngredientInput
        ingredients={ingredients}
        starred={starred}
        t={t}
        onAdd={addIngredient}
        onRemove={removeIngredient}
        onToggleStar={toggleStar}
        staplesChecked={staples}
        onStaplesChange={setStaples}
      />

      {/* Filter panel */}
      <FilterPanel t={t} filters={filters} onChange={updateFilter} />

      {/* Generate button */}
      <button
        className={styles.genBtn}
        onClick={() => handleGenerate()}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className={styles.spinner} aria-hidden="true" />
            {t.generating}
          </>
        ) : (
          t.genBtn
        )}
      </button>

      {/* Generation history */}
      {history.length > 0 && (
        <div className={styles.historySection}>
          <div className={styles.historyLabel}>{t.history}</div>
          <div className={styles.historyBar}>
            {history.map((entry, i) => (
              <button
                key={i}
                className={styles.histChip}
                onClick={() => restoreHistory(entry)}
              >
                {entry.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && <div className={styles.errorMsg}>{error}</div>}

      {/* Recipes */}
      {recipes.length > 0 && (
        <div className={styles.recipesWrap}>
          {recipes.map((recipe, i) => (
            <RecipeCard
              key={i}
              recipe={recipe}
              starred={starred}
              t={t}
              onCopy={showToast}
            />
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  )
}
