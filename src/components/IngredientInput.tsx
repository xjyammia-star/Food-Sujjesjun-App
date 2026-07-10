import { useRef } from 'react'
import type { Translations } from '../translations'
import styles from './IngredientInput.module.css'

interface Props {
  ingredients: string[]
  starred: string | null
  t: Translations
  onAdd: (ingredient: string) => void
  onRemove: (ingredient: string) => void
  onToggleStar: (ingredient: string) => void
  staplesChecked: boolean
  onStaplesChange: (checked: boolean) => void
}

export default function IngredientInput({
  ingredients,
  starred,
  t,
  onAdd,
  onRemove,
  onToggleStar,
  staplesChecked,
  onStaplesChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      const val = e.currentTarget.value.trim()
      if (val && !ingredients.includes(val)) {
        onAdd(val)
      }
      e.currentTarget.value = ''
    }
  }

  return (
    <div className={styles.section}>
      <div className={styles.label}>{t.ingredients}</div>
      <div
        className={styles.tagWrap}
        onClick={() => inputRef.current?.focus()}
      >
        {ingredients.map((ing) => (
          <span
            key={ing}
            className={`${styles.tag} ${ing === starred ? styles.starred : ''}`}
          >
            <button
              className={styles.tagStar}
              onClick={(e) => { e.stopPropagation(); onToggleStar(ing) }}
              title={t.mainIngr}
              aria-label={`Set ${ing} as main ingredient`}
            >
              {ing === starred ? '⭐' : '☆'}
            </button>
            {ing}
            <button
              className={styles.tagRemove}
              onClick={(e) => { e.stopPropagation(); onRemove(ing) }}
              aria-label={`Remove ${ing}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          className={styles.bareInput}
          placeholder={t.inputPlaceholder}
          onKeyDown={handleKeyDown}
        />
      </div>
      <div className={styles.staplesRow}>
        <input
          type="checkbox"
          id="staplesCheck"
          checked={staplesChecked}
          onChange={(e) => onStaplesChange(e.target.checked)}
        />
        <label htmlFor="staplesCheck">{t.staples}</label>
      </div>
    </div>
  )
}
