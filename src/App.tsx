import { useState } from 'react'
import type { Lang, Selections, Recipe, ShoppingAnalysis, Equipment } from './types'
import { T } from './translations'
import { fetchRecipes, fetchShoppingAnalysis } from './api'
import IngredientInput from './components/IngredientInput'
import FilterPanel from './components/FilterPanel'
import EquipmentPanel, { ALL_EQUIPMENT } from './components/EquipmentPanel'
import RecipeCard from './components/RecipeCard'
import ShoppingPanel from './components/ShoppingPanel'
import styles from './App.module.css'

export default function App() {
  const [lang, setLang] = useState<Lang>('en')
  const [ingredients, setIngredients] = useState<string[]>([])
  const [mainIndex, setMainIndex] = useState<number | null>(null)
  const [staples, setStaples] = useState(true)
  const [selections, setSelections] = useState<Selections>({
    cuisine: null, goal: null, time: null, meal: null, skill: null, diet: null,
  })
  const [availableEquipment, setAvailableEquipment] = useState<Set<Equipment>>(
    new Set(ALL_EQUIPMENT)
  )
  const [strictIngredients, setStrictIngredients] = useState(false)
  const [tasteNotes, setTasteNotes] = useState('')

  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [shopping, setShopping] = useState<ShoppingAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingShop, setLoadingShop] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = T[lang]
  const isZh = lang === 'zh'

  const addIngredient = (val: string) => setIngredients(prev => [...prev, val])

  const removeIngredient = (i: number) => {
    setIngredients(prev => prev.filter((_, idx) => idx !== i))
    setMainIndex(prev => {
      if (prev === null) return null
      if (prev === i) return null
      if (prev > i) return prev - 1
      return prev
    })
  }

  const toggleMain = (i: number) => setMainIndex(prev => prev === i ? null : i)

  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError(t.errNoIngredients)
      return
    }
    setError(null)
    setLoading(true)
    setRecipes([])
    setShopping(null)

    try {
      const mainIng = mainIndex !== null ? ingredients[mainIndex] : null
      const result = await fetchRecipes(
        ingredients, mainIng, selections, staples, lang,
        availableEquipment, strictIngredients, tasteNotes.trim()
      )
      setRecipes(result)

      setLoadingShop(true)
      fetchShoppingAnalysis(ingredients, result, lang)
        .then(s => setShopping(s))
        .catch(() => setShopping(null))
        .finally(() => setLoadingShop(false))

    } catch {
      setError('Something went wrong. Check your API key in Vercel and redeploy.')
    } finally {
      setLoading(false)
    }
  }

  const cuisineLabel = selections.cuisine !== null
    ? t.cuisine[selections.cuisine]
    : 'international'

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
              onClick={() => setLang('en')}
            >EN</button>
            <button
              className={`${styles.langBtn} ${lang === 'zh' ? styles.langActive : ''}`}
              onClick={() => setLang('zh')}
            >中文</button>
          </div>
          <div className={styles.titleEyebrow}>{isZh ? '智能食谱生成器' : 'AI Recipe Generator'}</div>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.sub}</p>
        </div>
      </div>

      <div className={styles.container}>
        <IngredientInput
          lang={lang}
          ingredients={ingredients}
          mainIndex={mainIndex}
          staples={staples}
          onAdd={addIngredient}
          onRemove={removeIngredient}
          onToggleMain={toggleMain}
          onStaplesChange={setStaples}
        />

        {/* Strict ingredients toggle */}
        <div className={styles.strictRow}>
          <div className={styles.strictText}>
            <span className={styles.strictLabel}>
              {isZh ? '🛒 仅用现有食材' : '🛒 Use only what I have'}
            </span>
            <span className={styles.strictSub}>
              {strictIngredients
                ? (isZh ? '食谱只会用你列出的食材，不需要额外购买' : 'Recipes will only use ingredients you listed — no shopping needed')
                : (isZh ? '食谱可能需要少量额外食材，并提供替代方案' : 'Recipes may need a few extras, with substitution alternatives provided')}
            </span>
          </div>
          <button
            className={`${styles.strictToggle} ${strictIngredients ? styles.strictOn : styles.strictOff}`}
            onClick={() => setStrictIngredients(prev => !prev)}
            aria-pressed={strictIngredients}
          >
            <span className={styles.strictThumb} />
          </button>
        </div>

        <FilterPanel
          lang={lang}
          selections={selections}
          onSelect={(cat, idx) =>
            setSelections(prev => ({ ...prev, [cat]: prev[cat] === idx ? null : idx }))
          }
        />

        <EquipmentPanel
          available={availableEquipment}
          onChange={setAvailableEquipment}
          lang={lang}
        />

        {/* Taste preferences */}
        <div className={styles.tasteBox}>
          <label className={styles.tasteLabel} htmlFor="tasteNotes">
            {isZh ? '🧂 口味偏好（选填）' : '🧂 Taste preferences (optional)'}
          </label>
          <p className={styles.tasteSub}>
            {isZh
              ? '告诉我你的口味，例如：少盐、不辣、少油、不加糖…'
              : 'e.g. less salt, not spicy, low oil, no sugar, extra garlic…'}
          </p>
          <textarea
            id="tasteNotes"
            className={styles.tasteInput}
            value={tasteNotes}
            onChange={e => setTasteNotes(e.target.value)}
            placeholder={isZh ? '在这里输入你的口味要求…' : 'Type your taste preferences here…'}
            rows={2}
            maxLength={200}
          />
          {tasteNotes.length > 0 && (
            <div className={styles.tasteCount}>{tasteNotes.length}/200</div>
          )}
        </div>

        <button
          className={styles.generateBtn}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? `⏳ ${t.loading}` : `✨ ${t.btnGenerate}`}
        </button>

        {error && <div className={styles.errorBox}>{error}</div>}

        {recipes.length > 0 && (
          <>
            <div className={styles.results}>
              <p className={styles.resultsHeading}>{isZh ? '为你推荐' : 'Your recipes'}</p>
              <p className={styles.resultsSubheading}>
                {isZh
                  ? `根据你的 ${ingredients.length} 种食材生成`
                  : `Generated from your ${ingredients.length} ingredients`}
              </p>
              {recipes.map((recipe, i) => (
                <RecipeCard
                  key={i}
                  recipe={recipe}
                  lang={lang}
                  hasMain={mainIndex !== null}
                  cuisineLabel={cuisineLabel}
                />
              ))}
            </div>
            <ShoppingPanel
              analysis={shopping}
              loading={loadingShop}
              lang={lang}
            />
          </>
        )}
      </div>
    </div>
  )
}
