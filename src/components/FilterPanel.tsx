import type { Lang, Selections } from '../types'
import { T } from '../translations'
import styles from './FilterPanel.module.css'

type FilterKey = keyof Selections

interface Props {
  lang: Lang
  selections: Selections
  onSelect: (cat: FilterKey, idx: number) => void
}

const filterDefs: { key: FilterKey; labelKey: keyof typeof T['en'] }[] = [
  { key: 'cuisine', labelKey: 'labelCuisine' },
  { key: 'goal',    labelKey: 'labelGoal' },
  { key: 'time',    labelKey: 'labelTime' },
  { key: 'meal',    labelKey: 'labelMeal' },
  { key: 'skill',   labelKey: 'labelSkill' },
  { key: 'diet',    labelKey: 'labelDiet' },
]

export default function FilterPanel({ lang, selections, onSelect }: Props) {
  const t = T[lang]

  return (
    <div className={styles.grid}>
      {filterDefs.map(({ key, labelKey }) => {
        const options = t[key] as unknown as string[]
        const label = t[labelKey] as string
        return (
          <div key={key} className={styles.section}>
            <div className={styles.label}>{label}</div>
            <div className={styles.chips}>
              {options.map((option, i) => (
                <button
                  key={i}
                  className={`${styles.chip} ${selections[key] === i ? styles.selected : ''}`}
                  onClick={() => onSelect(key, i)}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
