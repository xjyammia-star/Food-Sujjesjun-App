import { useState, useEffect } from 'react'
import type { Recipe, Lang } from '../types'
import { T } from '../translations'
import { fetchDishImage } from '../api'
import styles from './RecipeCard.module.css'

interface Props {
  recipe: Recipe
  lang: Lang
  hasMain: boolean
  cuisineLabel: string
  mustBuy: string[]
  isFavourite: boolean
  onToggleFavourite: () => void
}

export default function RecipeCard({ recipe, lang, hasMain, cuisineLabel, mustBuy, isFavourite, onToggleFavourite }: Props) {
  const t = T[lang]
  const [image, setImage] = useState<string | null>(null)
  const [imgLoading, setImgLoading] = useState(true)

  // Normalise for fuzzy matching — lowercase, strip punctuation
  const normalisedMustBuy = mustBuy.map(s => s.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, ''))

  function isMustBuy(ingredient: string): boolean {
    if (normalisedMustBuy.length === 0) return false
    const normIng = ingredient.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]/g, '')
    return normalisedMustBuy.some(m => normIng.includes(m) || m.includes(normIng))
  }

  useEffect(() => {
    setImgLoading(true)
    fetchDishImage(recipe.name, cuisineLabel || 'international', recipe.imagePrompt)
      .then(img => setImage(img))
      .finally(() => setImgLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // empty array = run once on mount only; language changes must not re-trigger this

  return (
    <div className={styles.card}>
      {/* Image section */}
      <div className={styles.imageBox}>
        {imgLoading && (
          <div className={styles.imageSkeleton}>
            <div className={styles.skeletonShimmer} />
            <span className={styles.skeletonText}>Generating image...</span>
          </div>
        )}
        {image && (
          <img
            src={image}
            alt={recipe.name}
            className={styles.dishImage}
            style={{ opacity: imgLoading ? 0 : 1 }}
          />
        )}
        {!imgLoading && !image && (
          <div className={styles.imageFallback}>🍽️</div>
        )}
      </div>

      <div className={styles.cardTop}>
        <div className={styles.cardTopGlow} />
        <button
          className={`${styles.heartBtn} ${isFavourite ? styles.heartOn : styles.heartOff}`}
          onClick={onToggleFavourite}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
        >
          {isFavourite ? '♥' : '♡'}
        </button>
        {hasMain && recipe.mainIngredient && (
          <span className={styles.mainBadge}>⭐ {t.mainBadge}: {recipe.mainIngredient}</span>
        )}
        <span className={styles.name}>{recipe.name}</span>
        <div className={styles.meta}>
          <span className={styles.metaItem}>🔥 {recipe.calories} {t.calories}</span>
          <span className={styles.metaItem}>⏱ {recipe.cookTime}</span>
          <span className={styles.metaItem}>👨‍🍳 {recipe.difficulty}</span>
          <span className={styles.metaItem}>👥 {recipe.servings} {t.servings}</span>
        </div>
      </div>

      <div className={styles.body}>
        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <>
            <div className={styles.sectionTitle}>🧂 {lang === 'zh' ? '所需食材' : 'Ingredients'}</div>
            <ul className={styles.ingredientsList}>
              {recipe.ingredients.map((item, i) => (
                <li key={i} className={`${styles.ingredientItem} ${isMustBuy(item) ? styles.ingredientMustBuy : ''}`}>
                  {isMustBuy(item)
                    ? <span className={styles.ingredientCartIcon}>🛒</span>
                    : <span className={styles.ingredientDot} />}
                  {item}
                </li>
              ))}
            </ul>
            <div className={styles.divider} />
          </>
        )}

        <div className={styles.sectionTitle}>{t.steps}</div>
        <ol className={styles.steps}>
          {recipe.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>

        {recipe.substitutions && recipe.substitutions.length > 0 && (
          <>
            <div className={styles.divider} />
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
            <div className={styles.divider} />
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
            <div className={styles.nutritionBox}>
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
                    <span key={i} className={styles.highlight}>{h}</span>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
