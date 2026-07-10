import type { FilterKey, FilterState } from '../types'
import type { Translations } from '../translations'
import { FILTER_KEYS } from '../translations'
import styles from './FilterPanel.module.css'

interface Props {
  t: Translations
  filters: FilterState
  onChange: (key: FilterKey, value: string | null) => void
}

export default function FilterPanel({ t, filters, onChange }: Props) {
  return (
    <div className={styles.section}>
      <div className={styles.label}>{t.filters}</div>
      <div className={styles.grid}>
        {FILTER_KEYS.map((key) => {
          const label = t.filterLabels[key]
          const options = t.filters[key]
          const enOptions = ['Western','Chinese','Japanese','Thai','Italian','Indian','Surprise me',
            'Balanced','High protein','Low carb','Low calorie','Bulking',
            'Under 20 min','30 min','1 hour','No limit',
            'Breakfast','Lunch','Dinner','Snack',
            'Beginner','Intermediate','Advanced',
            'None','Vegetarian','Vegan','Gluten-free','Halal']

          // Map display options back to English values for state
          const optionMap: Record<string, string> = {}
          options.forEach((opt, idx) => {
            // find the matching english value by position within this filter group
            const filterEnOptions: Record<string, string[]> = {
              cuisine: ['Western','Chinese','Japanese','Thai','Italian','Indian','Surprise me'],
              goal: ['Balanced','High protein','Low carb','Low calorie','Bulking'],
              time: ['Under 20 min','30 min','1 hour','No limit'],
              meal: ['Breakfast','Lunch','Dinner','Snack'],
              skill: ['Beginner','Intermediate','Advanced'],
              diet: ['None','Vegetarian','Vegan','Gluten-free','Halal'],
            }
            optionMap[opt] = filterEnOptions[key][idx]
          })

          return (
            <div key={key} className={styles.block}>
              <div className={styles.filterLabel}>{label}</div>
              <div className={styles.chips}>
                {options.map((opt) => {
                  const enVal = optionMap[opt]
                  const isSelected = filters[key] === enVal
                  return (
                    <button
                      key={opt}
                      className={`${styles.chip} ${isSelected ? styles.selected : ''}`}
                      onClick={() => onChange(key, isSelected ? null : enVal)}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
