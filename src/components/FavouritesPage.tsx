import { useState, useMemo } from 'react'
import type { Recipe, Lang } from '../types'
import RecipeCard from './RecipeCard'
import styles from './FavouritesPage.module.css'

interface Props {
  favourites: Recipe[]
  lang: Lang
  onToggleFavourite: (recipe: Recipe) => void
  onBack: () => void
}

export default function FavouritesPage({ favourites, lang, onToggleFavourite, onBack }: Props) {
  const isZh = lang === 'zh'

  const [search, setSearch] = useState('')
  const [filterCuisine, setFilterCuisine] = useState<string | null>(null)
  const [filterDifficulty, setFilterDifficulty] = useState<string | null>(null)
  const [filterTime, setFilterTime] = useState<string | null>(null)

  // Derive unique filter options from saved recipes
  const cuisines = useMemo(() => {
    const all = favourites.map(r => r.mainIngredient).filter(Boolean)
    return []  // cuisine isn't stored on recipe directly — use difficulty/time instead
  }, [favourites])

  const difficulties = useMemo(() => {
    const s = new Set(favourites.map(r => r.difficulty).filter(Boolean))
    return [...s]
  }, [favourites])

  // Bucket cook times into groups
  function timeBucket(cookTime: string): string {
    const mins = parseInt(cookTime)
    if (isNaN(mins)) return cookTime
    if (mins <= 20) return isZh ? '20分钟内' : 'Under 20 min'
    if (mins <= 30) return isZh ? '30分钟' : '30 min'
    if (mins <= 60) return isZh ? '1小时' : '1 hour'
    return isZh ? '1小时以上' : 'Over 1 hour'
  }

  const timeBuckets = useMemo(() => {
    const s = new Set(favourites.map(r => timeBucket(r.cookTime)))
    return [...s]
  }, [favourites, isZh])

  const filtered = useMemo(() => {
    return favourites.filter(r => {
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false
      if (filterDifficulty && r.difficulty !== filterDifficulty) return false
      if (filterTime && timeBucket(r.cookTime) !== filterTime) return false
      return true
    })
  }, [favourites, search, filterDifficulty, filterTime, isZh])

  const toggleChip = <T extends string>(
    current: T | null,
    value: T,
    set: (v: T | null) => void
  ) => set(current === value ? null : value)

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <button className={styles.backBtn} onClick={onBack}>
            ← {isZh ? '返回' : 'Back'}
          </button>
          <div className={styles.eyebrow}>{isZh ? '我的收藏' : 'My Favourites'}</div>
          <h1 className={styles.title}>
            {isZh ? '收藏的食谱' : 'Saved Recipes'}
          </h1>
          <p className={styles.subtitle}>
            {favourites.length === 0
              ? (isZh ? '还没有收藏的食谱' : 'No saved recipes yet')
              : (isZh ? `共 ${favourites.length} 道收藏食谱` : `${favourites.length} recipe${favourites.length !== 1 ? 's' : ''} saved`)}
          </p>
        </div>
      </div>

      <div className={styles.container}>
        {favourites.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>♡</div>
            <p className={styles.emptyText}>
              {isZh
                ? '生成食谱后，点击心形图标收藏你喜欢的菜肴'
                : 'Generate some recipes and tap the heart icon to save your favourites here'}
            </p>
            <button className={styles.emptyBtn} onClick={onBack}>
              {isZh ? '去生成食谱' : 'Generate recipes'}
            </button>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                className={styles.searchInput}
                placeholder={isZh ? '搜索收藏的食谱…' : 'Search saved recipes…'}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.searchClear} onClick={() => setSearch('')}>✕</button>
              )}
            </div>

            {/* Filters */}
            <div className={styles.filters}>
              {/* Difficulty */}
              {difficulties.length > 1 && (
                <div className={styles.filterGroup}>
                  <div className={styles.filterLabel}>
                    {isZh ? '难度' : 'Difficulty'}
                  </div>
                  <div className={styles.chips}>
                    {difficulties.map(d => (
                      <button
                        key={d}
                        className={`${styles.chip} ${filterDifficulty === d ? styles.chipActive : ''}`}
                        onClick={() => toggleChip(filterDifficulty, d, setFilterDifficulty)}
                      >{d}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Cook time */}
              {timeBuckets.length > 1 && (
                <div className={styles.filterGroup}>
                  <div className={styles.filterLabel}>
                    {isZh ? '烹饪时间' : 'Cook time'}
                  </div>
                  <div className={styles.chips}>
                    {timeBuckets.map(t => (
                      <button
                        key={t}
                        className={`${styles.chip} ${filterTime === t ? styles.chipActive : ''}`}
                        onClick={() => toggleChip(filterTime, t, setFilterTime)}
                      >{t}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Results count */}
            {(search || filterDifficulty || filterTime) && (
              <p className={styles.resultCount}>
                {isZh
                  ? `找到 ${filtered.length} 道食谱`
                  : `${filtered.length} recipe${filtered.length !== 1 ? 's' : ''} found`}
                <button className={styles.clearAll} onClick={() => {
                  setSearch('')
                  setFilterDifficulty(null)
                  setFilterTime(null)
                }}>
                  {isZh ? '清除筛选' : 'Clear filters'}
                </button>
              </p>
            )}

            {/* Recipe cards */}
            <div className={styles.cards}>
              {filtered.length === 0 ? (
                <div className={styles.noResults}>
                  {isZh ? '没有符合条件的食谱' : 'No recipes match your filters'}
                </div>
              ) : (
                filtered.map((recipe, i) => (
                  <RecipeCard
                    key={i}
                    recipe={recipe}
                    lang={lang}
                    hasMain={false}
                    cuisineLabel="international"
                    mustBuy={[]}
                    isFavourite={true}
                    onToggleFavourite={() => onToggleFavourite(recipe)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
