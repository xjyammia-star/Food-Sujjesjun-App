import type { FilterState, Recipe } from './types'
import { FILTER_KEYS } from './translations'

function buildPrompt(
  lang: 'en' | 'zh',
  ingredients: string[],
  starred: string | null,
  staples: boolean,
  filters: FilterState,
): string {
  const ingList = ingredients.join(', ')
  const starredNote = starred
    ? ` The main/star ingredient is "${starred}" — all dishes should feature it prominently.`
    : ''
  const staplesNote = staples
    ? ' Assume pantry staples are available: salt, oil, sugar, soy sauce, water.'
    : ''
  const filterStr = FILTER_KEYS.filter((k) => filters[k])
    .map((k) => `${k}: ${filters[k]}`)
    .join('; ')

  if (lang === 'zh') {
    return `你是一位专业厨师和营养师。请根据以下食材和偏好，推荐2-3道菜肴。

食材：${ingList}${starredNote}${staplesNote}
${filterStr ? '偏好：' + filterStr : ''}

请严格按照以下JSON格式返回，不要添加任何其他文字：
{"recipes":[{"name":"菜名","calories":数字,"cookTime":"时间","difficulty":"难度","servings":数字,"steps":["步骤1","步骤2"],"substitutions":[{"missing":"缺少的食材","alternative":"替代品","reason":"原因"}],"shopping":["需要购买的食材"],"featuresMain":布尔值}]}`
  }

  return `You are a professional chef and nutritionist. Based on the following ingredients and preferences, suggest 2-3 recipes.

Ingredients: ${ingList}${starredNote}${staplesNote}
${filterStr ? 'Preferences: ' + filterStr : ''}

Return ONLY this exact JSON, no other text:
{"recipes":[{"name":"dish name","calories":number,"cookTime":"time","difficulty":"Easy/Medium/Hard","servings":number,"steps":["step 1","step 2"],"substitutions":[{"missing":"ingredient","alternative":"substitute","reason":"why it works"}],"shopping":["item to buy"],"featuresMain":boolean}]}`
}

export async function generateRecipes(
  lang: 'en' | 'zh',
  ingredients: string[],
  starred: string | null,
  staples: boolean,
  filters: FilterState,
): Promise<Recipe[]> {
  const prompt = buildPrompt(lang, ingredients, starred, staples, filters)

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  const data = await response.json()
  const text: string = data.content.map((b: { text?: string }) => b.text ?? '').join('')
  const clean = text.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)

  return parsed.recipes as Recipe[]
}
