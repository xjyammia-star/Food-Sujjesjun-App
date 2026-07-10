import { useState } from 'react'
import type { Lang } from '../types'
import { T } from '../translations'
import styles from './IngredientInput.module.css'

interface Props {
  lang: Lang
  ingredients: string[]
  mainIndex: number | null
  staples: boolean
  onAdd: (val: string) => void
  onRemove: (i: number) => void
  onToggleMain: (i: number) => void
  onStaplesChange: (val: boolean) => void
}

export default function IngredientInput({
  lang, ingredients, mainIndex, staples,
  onAdd, onRemove, onToggleMain, onStaplesChange,
}: Props) {
  const [input, setInput] = useState('')
  const t = T[lang]

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return
    onAdd(val)
    setInput('')
  }

  return (
    <div className={styles.section}>
      <div className={styles.label}>{t.labelIngredients}</div>
      <div className={styles.inputRow}>
        <input
          type="text"
          className={styles.input}
          placeholder={t.inputPlaceholder}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button className={styles.addBtn} onClick={handleAdd}>
          + {t.btnAdd}
        </button>
      </div>

      <div className={styles.tags}>
        {ingredients.map((ing, i) => {
          const isMain = mainIndex === i
          return (
            <span key={i} className={`${styles.tag} ${isMain ? styles.mainTag : ''}`}>
              <span
                className={`${styles.star} ${isMain ? styles.starActive : ''}`}
                onClick={() => onToggleMain(i)}
                title="Set as main"
              >⭐</span>
              {ing}
              <span className={styles.remove} onClick={() => onRemove(i)}>×</span>
            </span>
          )
        })}
      </div>

      {ingredients.length > 0 && (
        <p className={styles.hint}>{t.mainHint}</p>
      )}

      <label className={styles.staplesRow}>
        <input
          type="checkbox"
          checked={staples}
          onChange={e => onStaplesChange(e.target.checked)}
        />
        <span>{t.labelStaples}</span>
      </label>
    </div>
  )
}
