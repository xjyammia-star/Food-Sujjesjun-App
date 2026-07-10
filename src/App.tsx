import { useState } from 'react'
import type { Lang, Selections, Recipe, ShoppingAnalysis } from './types'
import { T } from './translations'
import { fetchRecipes, fetchShoppingAnalysis } from './api'
import IngredientInput from './components/IngredientInput'
import FilterPanel from './components/FilterPanel'
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
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [shopping, setShopping] = useState<ShoppingAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingShop, setLoadingShop] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const t = T[lang]

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
      const result = await fetchRecipes(ingredients, mainIng, selections, staples, lang)
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

  const isZh = lang === 'zh'

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

        <FilterPanel
          lang={lang}
          selections={selections}
          onSelect={(cat, idx) =>
            setSelections(prev => ({ ...prev, [cat]: prev[cat] === idx ? null : idx }))
          }
        />

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
              <p className={styles.resultsSubheading}>{isZh ? `根据你的 ${ingredients.length} 种食材生成` : `Generated from your ${ingredients.length} ingredients`}</p>
              {recipes.map((recipe, i) => (
                <RecipeCard
                  key={i}
                  recipe={recipe}
                  lang={lang}
                  hasMain={mainIndex !== null}
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
