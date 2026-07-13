// App.tsx
import { useState } from 'react';
import styles from './App.module.css';
import IngredientInput from './components/IngredientInput';
import FilterPanel from './components/FilterPanel';
import EquipmentPanel, { ALL_EQUIPMENT, type Equipment } from './components/EquipmentPanel';
import RecipeCard from './components/RecipeCard';
import ShoppingPanel from './components/ShoppingPanel';
import { fetchRecipes, fetchShoppingAnalysis } from './api';
import type { Recipe, ShoppingAnalysis, Selections } from './types';
import { translations } from './translations';

function App() {
  const [lang, setLang] = useState<'en' | 'zh'>('en');
  const t = translations[lang];

  // ── Ingredient state ──────────────────────────────────────────────────────
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [mainIngredient, setMainIngredient] = useState<string | null>(null);

  // ── Filter / preference state ─────────────────────────────────────────────
  const [selections, setSelections] = useState<Omit<Selections, 'availableEquipment'>>({
    cuisine: '',
    nutritionGoal: '',
    cookTime: '',
    mealType: '',
    skillLevel: '',
    dietary: [],
    pantryStaples: [],
  });

  // ── Equipment state — all ON by default ──────────────────────────────────
  const [availableEquipment, setAvailableEquipment] = useState<Set<Equipment>>(
    new Set(ALL_EQUIPMENT)
  );

  // ── Result state ──────────────────────────────────────────────────────────
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [shoppingAnalysis, setShoppingAnalysis] = useState<ShoppingAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasGenerated, setHasGenerated] = useState(false);

  // ── Generate ──────────────────────────────────────────────────────────────
  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError(
        lang === 'zh'
          ? '请至少输入一种食材'
          : 'Please add at least one ingredient'
      );
      return;
    }

    setLoading(true);
    setError(null);
    setRecipes([]);
    setShoppingAnalysis(null);

    try {
      const fullSelections: Selections = {
        ...selections,
        availableEquipment: Array.from(availableEquipment),
      };

      const generatedRecipes = await fetchRecipes(
        ingredients,
        mainIngredient,
        fullSelections,
        lang
      );
      setRecipes(generatedRecipes);
      setHasGenerated(true);

      const analysis = await fetchShoppingAnalysis(generatedRecipes, ingredients, lang);
      setShoppingAnalysis(analysis);
    } catch (err) {
      setError(
        lang === 'zh'
          ? '生成失败，请重试。'
          : 'Generation failed. Please try again.'
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.app}>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.langToggle}>
            <button
              className={`${styles.langBtn} ${lang === 'en' ? styles.langActive : ''}`}
              onClick={() => setLang('en')}
            >
              EN
            </button>
            <span className={styles.langDivider}>|</span>
            <button
              className={`${styles.langBtn} ${lang === 'zh' ? styles.langActive : ''}`}
              onClick={() => setLang('zh')}
            >
              中文
            </button>
          </div>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroSubtitle}>{t.heroSubtitle}</p>
        </div>
      </header>

      {/* ── Main form ───────────────────────────────────────────────────── */}
      <main className={styles.main}>
        <div className={styles.formCard}>
          {/* Ingredient input */}
          <IngredientInput
            ingredients={ingredients}
            mainIngredient={mainIngredient}
            onIngredientsChange={setIngredients}
            onMainIngredientChange={setMainIngredient}
            lang={lang}
          />

          {/* Preference filters */}
          <FilterPanel
            selections={selections}
            onSelectionsChange={setSelections}
            lang={lang}
          />

          {/* ── Equipment panel (NEW) ──────────────────────────────────── */}
          <EquipmentPanel
            available={availableEquipment}
            onChange={setAvailableEquipment}
            lang={lang}
          />

          {/* Error */}
          {error && <p className={styles.error}>{error}</p>}

          {/* Generate button */}
          <button
            className={styles.generateBtn}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.loadingDots}>
                {lang === 'zh' ? '生成中' : 'Generating'}
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            ) : (
              t.generateBtn
            )}
          </button>
        </div>

        {/* ── Results ─────────────────────────────────────────────────── */}
        {hasGenerated && (
          <section className={styles.results}>
            {recipes.map((recipe, i) => (
              <RecipeCard
                key={i}
                recipe={recipe}
                lang={lang}
                cuisineLabel={selections.cuisine}
              />
            ))}
            {shoppingAnalysis && (
              <ShoppingPanel analysis={shoppingAnalysis} lang={lang} />
            )}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
