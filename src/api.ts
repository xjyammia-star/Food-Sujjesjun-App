import type { Lang, Recipe, Selections } from './types'
import { T } from './translations'

export async function fetchRecipes(
  ingredients: string[],
  mainIngredient: string | null,
  selections: Selections,
  staples: boolean,
  lang: Lang
): Promise<Recipe[]> {
  const t = T[lang]
  const isZh = lang === 'zh'

  const cuisineLabel = selections.cuisine !== null ? t.cuisine[selections.cuisine] : null
  const goalLabel = selections.goal !== null ? t.goal[selections.goal] : null
  const timeLabel = selections.time !== null ? t.time[selections.time] : null
  const mealLabel = selections.meal !== null ? t.meal[selections.meal] : null
  const skillLabel = selections.skill !== null ? t.skill[selections.skill] : null
  const dietLabel = selections.diet !== null ? t.diet[selections.diet] : null

  const prompt = isZh
    ? `你是一位专业厨师助手。根据以下信息，推荐2-3道菜肴。

食材：${ingredients.join('、')}
${mainIngredient ? `主料（菜肴必须以此为核心）：${mainIngredient}` : ''}
${staples ? '默认有：盐、食用油、糖、水、酱油' : ''}
${cuisineLabel ? `菜系：${cuisineLabel}` : ''}
${goalLabel ? `营养目标：${goalLabel}` : ''}
${timeLabel ? `烹饪时间：${timeLabel}` : ''}
${mealLabel ? `餐食类型：${mealLabel}` : ''}
${skillLabel ? `厨艺程度：${skillLabel}` : ''}
${dietLabel && dietLabel !== '无限制' ? `饮食要求：${dietLabel}` : ''}

请以JSON格式回复，不要用markdown代码块包裹，格式如下：
{"recipes":[{"name":"菜名","mainIngredient":"主料名","calories":300,"cookTime":"25分钟","difficulty":"简单","servings":2,"steps":["步骤1","步骤2"],"substitutions":[{"missing":"缺少食材","use":"替代品","reason":"原因"}],"shopping":["还需购买的食材"]}]}`
    : `You are a professional chef assistant. Based on the ingredients and preferences below, suggest 2-3 meal ideas.

Ingredients: ${ingredients.join(', ')}
${mainIngredient ? `Main ingredient (all dishes MUST center around this): ${mainIngredient}` : ''}
${staples ? 'Pantry staples available: salt, oil, sugar, water, soy sauce' : ''}
${cuisineLabel ? `Cuisine: ${cuisineLabel}` : ''}
${goalLabel ? `Nutritional goal: ${goalLabel}` : ''}
${timeLabel ? `Cook time: ${timeLabel}` : ''}
${mealLabel ? `Meal type: ${mealLabel}` : ''}
${skillLabel ? `Skill level: ${skillLabel}` : ''}
${dietLabel && dietLabel !== 'None' ? `Dietary restriction: ${dietLabel}` : ''}

Reply ONLY with JSON (no markdown), in this format:
{"recipes":[{"name":"Dish name","mainIngredient":"main ingredient used","calories":300,"cookTime":"25 min","difficulty":"Easy","servings":2,"steps":["Step 1","Step 2"],"substitutions":[{"missing":"ingredient you might lack","use":"alternative","reason":"why it works"}],"shopping":["extra items needed"]}]}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error('API request failed')

  const data = await res.json()
  const text = data.content.map((c: { text?: string }) => c.text ?? '').join('')
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return parsed.recipes as Recipe[]
}
