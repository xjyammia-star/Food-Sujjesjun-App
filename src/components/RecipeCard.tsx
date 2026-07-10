import { useState } from 'react'
import type { Recipe } from '../types'
import type { Translations } from '../translations'
import styles from './RecipeCard.module.css'

interface Props {
  recipe: Recipe
  starred: string | null
  t: Translations
  onCopy: (text: string) => void
}

export default function RecipeCard({ recipe, starred, t, onCopy }: Props) {
  const [servings, setServings] = useState(recipe.servings)

  function handleShare() {
    const text = [
      `🍽️ ${recipe.name}`,
      `⏱ ${recipe.cookTime} | 🔥 ${recipe.calories} kcal | 👤 ${servings} servings`,
      '',
      `${t.steps}:`,
      ...recipe.steps.map((s, i) => `${i + 1}. ${s}`),
      recipe.shopping?.length
        ? `\n${t.shopping}: ${recipe.shopping.join(', ')}`
        : '',
    ].join('\n')

    navigator.clipboard.writeText(text).then(() => onCopy(t.copied))
  }

  return (
    <div className={styles.card}>
      <div className={styles.head}>
        <div>
          <span className={styles.name}>{recipe.name}</span>
          {recipe.featuresMain && starred && (
            <span className={styles.mainBadge}>⭐ {starred}</span>
          )}
        </div>
        <div className={styles.meta}>
          <span className={styles.metaPill}>🔥 {recipe.calories} kcal</span>
          <span className={styles.metaPill}>⏱ {recipe.cookTime}</span>
          <span className={styles.metaPill}>📊 {recipe.difficulty}</span>
        </div>
      </div>

      <div className={styles.body}>
        {/* Serving adjuster */}
        <div className={styles.servingRow}>
          <span className={styles.servingLabel}>{t.servings}</span>
          <div className={styles.servingCtrl}>
            <button
              className={styles.srvBtn}
              onClick={() => setServings((s) => Math.max(1, s - 1))}
              aria-label="Decrease servings"
            >
              −
            </button>
            <span className={styles.srvCount}>{servings}</span>
            <button
              className={styles.srvBtn}
              onClick={() => setServings((s) => s + 1)}
              aria-label="Increase servings"
            >
              +
            </button>
          </div>
        </div>

        {/* Steps */}
        <div>
          <div className={styles.sectionHead}>{t.steps}</div>
          <div className={styles.stepsList}>
            {recipe.steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <span className={styles.stepNum}>{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Substitutions */}
        {recipe.substitutions?.length > 0 && (
          <div>
            <div className={styles.sectionHead}>{t.subs}</div>
            <div className={styles.subList}>
              {recipe.substitutions.map((sub, i) => (
                <div key={i} className={styles.subItem}>
                  No <strong>{sub.missing}</strong>?
                  <span className={styles.subArrow}> → </span>
                  Use <strong>{sub.alternative}</strong> — {sub.reason}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shopping list */}
        {recipe.shopping?.length > 0 && (
          <div>
            <div className={styles.sectionHead}>{t.shopping}</div>
            <div className={styles.shopList}>
              {recipe.shopping.map((item) => (
                <span key={item} className={styles.shopTag}>{item}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.shareBtn} onClick={handleShare}>
          📋 {t.share}
        </button>
      </div>
    </div>
  )
}
