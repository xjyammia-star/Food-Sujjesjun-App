import type { Recipe, Lang } from '../types'
import { T } from '../translations'
import styles from './RecipeCard.module.css'

interface Props {
  recipe: Recipe
  lang: Lang
  hasMain: boolean
}

export default function RecipeCard({ recipe, lang, hasMain }: Props) {
  const t = T[lang]

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{recipe.name}</span>
        {hasMain && recipe.mainIngredient && (
          <span className={styles.mainBadge}>⭐ {t.mainBadge}: {recipe.mainIngredient}</span>
        )}
      </div>

      <div className={styles.meta}>
        <span className={styles.metaItem}>🔥 {recipe.calories} {t.calories}</span>
        <span className={styles.metaItem}>⏱ {recipe.cookTime}</span>
        <span className={styles.metaItem}>👨‍🍳 {recipe.difficulty}</span>
        <span className={styles.metaItem}>👥 {recipe.servings} {t.servings}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.sectionTitle}>{t.steps}</div>
      <ol className={styles.steps}>
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      {recipe.substitutions && recipe.substitutions.length > 0 && (
        <>
          <div className={styles.sectionTitle}>{t.subs}</div>
          <div className={styles.subsList}>
            {recipe.substitutions.map((s, i) => (
              <div key={i} className={styles.subItem}>
                <span>{s.missing}</span>
                <span className={styles.arrow}>→</span>
                <span className={styles.subUse}>{s.use}</span>
                <span className={styles.subReason}>— {s.reason}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {recipe.shopping && recipe.shopping.length > 0 && (
        <>
          <div className={styles.sectionTitle}>{t.shopping}</div>
          <div className={styles.shoppingPills}>
            {recipe.shopping.map((item, i) => (
              <span key={i} className={styles.pill}>{item}</span>
            ))}
          </div>
        </>
      )}

      {recipe.nutrition && (
        <>
          <div className={styles.divider} />
          <div className={styles.sectionTitle}>🥗 {t.nutritionTitle}</div>
          <div className={styles.macroGrid}>
            <div className={styles.macroItem}>
              <span className={styles.macroValue}>{recipe.nutrition.protein}</span>
              <span className={styles.macroLabel}>{t.protein}</span>
            </div>
            <div className={styles.macroItem}>
              <span className={styles.macroValue}>{recipe.nutrition.carbs}</span>
              <span className={styles.macroLabel}>{t.carbs}</span>
            </div>
            <div className={styles.macroItem}>
              <span className={styles.macroValue}>{recipe.nutrition.fat}</span>
              <span className={styles.macroLabel}>{t.fat}</span>
            </div>
            <div className={styles.macroItem}>
              <span className={styles.macroValue}>{recipe.nutrition.fiber}</span>
              <span className={styles.macroLabel}>{t.fiber}</span>
            </div>
          </div>
          {recipe.nutrition.highlights && recipe.nutrition.highlights.length > 0 && (
            <div className={styles.highlightsList}>
              {recipe.nutrition.highlights.map((h, i) => (
                <span key={i} className={styles.highlight}>✓ {h}</span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
