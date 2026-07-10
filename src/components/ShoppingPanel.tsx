import type { ShoppingAnalysis, Lang } from '../types'
import { T } from '../translations'
import styles from './ShoppingPanel.module.css'

interface Props {
  analysis: ShoppingAnalysis | null
  loading: boolean
  lang: Lang
}

export default function ShoppingPanel({ analysis, loading, lang }: Props) {
  const t = T[lang]

  if (loading) {
    return (
      <div className={styles.panel}>
        <div className={styles.title}>🛒 {t.shoppingPanelTitle}</div>
        <div className={styles.loading}>{t.loadingShop}</div>
      </div>
    )
  }

  if (!analysis) return null

  return (
    <div className={styles.panel}>
      <div className={styles.title}>🛒 {t.shoppingPanelTitle}</div>

      {analysis.mustBuy.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupLabel}>{t.mustBuy}</div>
          <div className={styles.pills}>
            {analysis.mustBuy.map((item, i) => (
              <span key={i} className={`${styles.pill} ${styles.pillMust}`}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {analysis.niceToHave.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupLabel}>{t.niceToHave}</div>
          <div className={styles.pills}>
            {analysis.niceToHave.map((item, i) => (
              <span key={i} className={`${styles.pill} ${styles.pillNice}`}>{item}</span>
            ))}
          </div>
        </div>
      )}

      {analysis.tip && (
        <div className={styles.tip}>
          <span className={styles.tipLabel}>💡 {t.dietTip}</span>
          <span className={styles.tipText}>{analysis.tip}</span>
        </div>
      )}
    </div>
  )
}
