import { useState } from 'react'
import type { Lang, Staple } from '../types'
import { T } from '../translations'
import styles from './IngredientInput.module.css'

// ── Staple definitions ────────────────────────────────────────────────────────

export interface StapleInfo {
  labelEn: string
  labelZh: string
}

export interface StapleGroup {
  groupEn: string
  groupZh: string
  items: Staple[]
}

export const STAPLE_INFO: Record<Staple, StapleInfo> = {
  // Universal basics
  salt:         { labelEn: 'Salt',            labelZh: '盐' },
  oil:          { labelEn: 'Cooking oil',     labelZh: '食用油' },
  sugar:        { labelEn: 'Sugar',           labelZh: '糖' },
  water:        { labelEn: 'Water',           labelZh: '水' },
  sowSauce:     { labelEn: 'Soy sauce',       labelZh: '酱油' },
  blackPepper:  { labelEn: 'Black pepper',    labelZh: '黑胡椒' },
  garlic:       { labelEn: 'Garlic',          labelZh: '大蒜' },
  ginger:       { labelEn: 'Ginger',          labelZh: '生姜' },
  onion:        { labelEn: 'Onion',           labelZh: '洋葱' },
  flour:        { labelEn: 'Flour',           labelZh: '面粉' },
  cornstarch:   { labelEn: 'Cornstarch',      labelZh: '生粉/淀粉' },
  vinegar:      { labelEn: 'Vinegar',         labelZh: '醋' },
  honey:        { labelEn: 'Honey',           labelZh: '蜂蜜' },
  // Chinese
  oysterSauce:    { labelEn: 'Oyster sauce',      labelZh: '蚝油' },
  darkSoySauce:   { labelEn: 'Dark soy sauce',    labelZh: '老抽' },
  sesameOil:      { labelEn: 'Sesame oil',         labelZh: '香油' },
  shaoxingWine:   { labelEn: 'Shaoxing wine',      labelZh: '绍兴酒' },
  doubanjiang:    { labelEn: 'Doubanjiang',         labelZh: '豆瓣酱' },
  chickenPowder:  { labelEn: 'Chicken powder',     labelZh: '鸡精' },
  starAnise:      { labelEn: 'Star anise',          labelZh: '八角' },
  sichuanPepper:  { labelEn: 'Sichuan pepper',     labelZh: '花椒' },
  // Japanese
  misoSoup:     { labelEn: 'Miso paste',      labelZh: '味噌' },
  mirin:        { labelEn: 'Mirin',           labelZh: '味醂' },
  sake:         { labelEn: 'Sake',            labelZh: '清酒' },
  riceVinegar:  { labelEn: 'Rice vinegar',    labelZh: '米醋' },
  dashi:        { labelEn: 'Dashi stock',     labelZh: '出汁' },
  togarashi:    { labelEn: 'Togarashi',       labelZh: '七味粉' },
  // Thai
  fishSauce:      { labelEn: 'Fish sauce',        labelZh: '鱼露' },
  coconutMilk:    { labelEn: 'Coconut milk',       labelZh: '椰浆' },
  thaiBeanPaste:  { labelEn: 'Thai chili paste',   labelZh: '泰式辣酱' },
  lemongrass:     { labelEn: 'Lemongrass',         labelZh: '香茅' },
  limejuice:      { labelEn: 'Lime juice',         labelZh: '青柠汁' },
  // Western
  oliveoil:     { labelEn: 'Olive oil',       labelZh: '橄榄油' },
  driedOregano: { labelEn: 'Dried oregano',   labelZh: '干牛至' },
  paprika:      { labelEn: 'Paprika',         labelZh: '红椒粉' },
  cumin:        { labelEn: 'Cumin',           labelZh: '孜然' },
  butter:       { labelEn: 'Butter',          labelZh: '黄油' },
  cream:        { labelEn: 'Heavy cream',     labelZh: '鲜奶油' },
  bay:          { labelEn: 'Bay leaves',      labelZh: '月桂叶' },
  // Indian
  garam:        { labelEn: 'Garam masala',    labelZh: '马萨拉' },
  turmeric:     { labelEn: 'Turmeric',        labelZh: '姜黄粉' },
  coriander:    { labelEn: 'Ground coriander',labelZh: '香菜粉' },
  cardamom:     { labelEn: 'Cardamom',        labelZh: '豆蔻' },
  chiliPowder:  { labelEn: 'Chili powder',    labelZh: '辣椒粉' },
}

export const STAPLE_GROUPS: StapleGroup[] = [
  {
    groupEn: 'Universal basics',
    groupZh: '基础调料',
    items: ['salt','oil','sugar','water','sowSauce','blackPepper','garlic','ginger','onion','flour','cornstarch','vinegar','honey'],
  },
  {
    groupEn: 'Chinese pantry',
    groupZh: '中式常备',
    items: ['oysterSauce','darkSoySauce','sesameOil','shaoxingWine','doubanjiang','chickenPowder','starAnise','sichuanPepper'],
  },
  {
    groupEn: 'Japanese pantry',
    groupZh: '日式常备',
    items: ['misoSoup','mirin','sake','riceVinegar','dashi','togarashi'],
  },
  {
    groupEn: 'Thai pantry',
    groupZh: '泰式常备',
    items: ['fishSauce','coconutMilk','thaiBeanPaste','lemongrass','limejuice'],
  },
  {
    groupEn: 'Western pantry',
    groupZh: '西式常备',
    items: ['oliveoil','driedOregano','paprika','cumin','butter','cream','bay'],
  },
  {
    groupEn: 'Indian pantry',
    groupZh: '印度常备',
    items: ['garam','turmeric','coriander','cardamom','chiliPowder'],
  },
]

export const DEFAULT_STAPLES: Set<Staple> = new Set([
  'salt','oil','sugar','water','sowSauce',
])

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  lang: Lang
  ingredients: string[]
  mainIndex: number | null
  staples: Set<Staple>
  onAdd: (val: string) => void
  onRemove: (i: number) => void
  onToggleMain: (i: number) => void
  onStaplesChange: (val: Set<Staple>) => void
}

export default function IngredientInput({
  lang, ingredients, mainIndex, staples,
  onAdd, onRemove, onToggleMain, onStaplesChange,
}: Props) {
  const [input, setInput] = useState('')
  const [staplesOpen, setStaplesOpen] = useState(false)
  const t = T[lang]
  const isZh = lang === 'zh'

  const handleAdd = () => {
    const val = input.trim()
    if (!val) return
    onAdd(val)
    setInput('')
  }

  const toggleStaple = (s: Staple) => {
    const next = new Set(staples)
    if (next.has(s)) next.delete(s)
    else next.add(s)
    onStaplesChange(next)
  }

  const selectAll = () => {
    const all = new Set<Staple>(Object.keys(STAPLE_INFO) as Staple[])
    onStaplesChange(all)
  }

  const clearAll = () => onStaplesChange(new Set())

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

      {/* Pantry staples panel */}
      <div className={styles.staplesPanel}>
        <button
          className={styles.staplesToggleBtn}
          onClick={() => setStaplesOpen(o => !o)}
        >
          <span className={styles.stapleBtnLeft}>
            🧂 {isZh ? '厨房常备调料' : 'Pantry staples'}
            {staples.size > 0 && (
              <span className={styles.stapleBadge}>{staples.size}</span>
            )}
          </span>
          <span className={styles.staplesChevron}>{staplesOpen ? '▲' : '▼'}</span>
        </button>

        {staplesOpen && (
          <div className={styles.staplesBody}>
            <div className={styles.staplesActions}>
              <button className={styles.stapleActionBtn} onClick={selectAll}>
                {isZh ? '全选' : 'Select all'}
              </button>
              <button className={styles.stapleActionBtn} onClick={clearAll}>
                {isZh ? '清空' : 'Clear all'}
              </button>
            </div>

            {STAPLE_GROUPS.map(group => (
              <div key={group.groupEn} className={styles.stapleGroup}>
                <div className={styles.stapleGroupLabel}>
                  {isZh ? group.groupZh : group.groupEn}
                </div>
                <div className={styles.staplePills}>
                  {group.items.map(s => (
                    <button
                      key={s}
                      className={`${styles.staplePill} ${staples.has(s) ? styles.staplePillOn : styles.staplePillOff}`}
                      onClick={() => toggleStaple(s)}
                    >
                      {isZh ? STAPLE_INFO[s].labelZh : STAPLE_INFO[s].labelEn}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
