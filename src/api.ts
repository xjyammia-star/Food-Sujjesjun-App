import type { Lang, Recipe, Selections, ShoppingAnalysis } from './types'
import { T } from './translations'

const GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

async function callGemini(prompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('Missing VITE_GEMINI_API_KEY')

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error: ${err}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

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
    ? `你是一位专业营养师兼厨师。根据以下信息，推荐2-3道菜肴，并提供详细的营养分析。

食材：${ingredients.join('、')}
${mainIngredient ? `主料（菜肴必须以此为核心）：${mainIngredient}` : ''}
${staples ? '默认有：盐、食用油、糖、水、酱油' : ''}
${cuisineLabel ? `菜系：${cuisineLabel}` : ''}
${goalLabel ? `营养目标：${goalLabel}` : ''}
${timeLabel ? `烹饪时间：${timeLabel}` : ''}
${mealLabel ? `餐食类型：${mealLabel}` : ''}
${skillLabel ? `厨艺程度：${skillLabel}` : ''}
${dietLabel && dietLabel !== '无限制' ? `饮食要求：${dietLabel}` : ''}

请仅返回JSON（不要加任何说明文字），格式如下：
{
  "recipes": [
    {
      "name": "菜名",
      "mainIngredient": "主料名",
      "calories": 估算热量数字,
      "cookTime": "烹饪时间",
      "difficulty": "简单/中等/高级",
      "servings": 2,
      "steps": ["步骤1", "步骤2"],
      "substitutions": [{"missing": "缺少食材", "use": "替代品", "reason": "原因"}],
      "shopping": ["还需购买的食材"],
      "nutrition": {
        "calories": 热量数字,
        "protein": "蛋白质克数，如 '28g'",
        "carbs": "碳水克数，如 '45g'",
        "fat": "脂肪克数，如 '12g'",
        "fiber": "膳食纤维克数，如 '4g'",
        "highlights": ["营养亮点1", "营养亮点2", "营养亮点3"]
      }
    }
  ]
}`
    : `You are a professional nutritionist and chef. Based on the ingredients and preferences below, suggest 2-3 meal ideas with detailed nutritional analysis.

Ingredients: ${ingredients.join(', ')}
${mainIngredient ? `Main ingredient (all dishes MUST center around this): ${mainIngredient}` : ''}
${staples ? 'Pantry staples available: salt, oil, sugar, water, soy sauce' : ''}
${cuisineLabel ? `Cuisine: ${cuisineLabel}` : ''}
${goalLabel ? `Nutritional goal: ${goalLabel}` : ''}
${timeLabel ? `Cook time: ${timeLabel}` : ''}
${mealLabel ? `Meal type: ${mealLabel}` : ''}
${skillLabel ? `Skill level: ${skillLabel}` : ''}
${dietLabel && dietLabel !== 'None' ? `Dietary restriction: ${dietLabel}` : ''}

Return ONLY valid JSON (no explanation, no markdown), in this exact format:
{
  "recipes": [
    {
      "name": "Dish name",
      "mainIngredient": "main ingredient used",
      "calories": 350,
      "cookTime": "25 min",
      "difficulty": "Easy",
      "servings": 2,
      "steps": ["Step 1", "Step 2"],
      "substitutions": [{"missing": "ingredient", "use": "alternative", "reason": "why it works"}],
      "shopping": ["extra items needed"],
      "nutrition": {
        "calories": 350,
        "protein": "28g",
        "carbs": "45g",
        "fat": "12g",
        "fiber": "4g",
        "highlights": ["High in protein", "Good source of iron", "Low in saturated fat"]
      }
    }
  ]
}`

  const raw = await callGemini(prompt)
  const clean = raw.replace(/```json|```/g, '').trim()
  const parsed = JSON.parse(clean)
  return parsed.recipes as Recipe[]
}

export async function fetchShoppingAnalysis(
  ingredients: string[],
  recipes: Recipe[],
  lang: Lang
): Promise<ShoppingAnalysis> {
  const isZh = lang === 'zh'
  const recipeNames = recipes.map(r => r.name).join(isZh ? '、' : ', ')
  const allShopping = [...new Set(recipes.flatMap(r => r.shopping))]

  const prompt = isZh
    ? `你是一位营养顾问。用户冰箱里有：${ingredients.join('、')}。
他们想做这些菜：${recipeNames}。
建议购买的食材包括：${allShopping.join('、') || '暂无'}。

请分析并给出购物建议，仅返回JSON：
{
  "mustBuy": ["必买食材1", "必买食材2"],
  "niceToHave": ["可选食材1", "可选食材2"],
  "tip": "一句话饮食建议，基于用户当前的食材选择"
}`
    : `You are a nutrition advisor. The user has in their fridge: ${ingredients.join(', ')}.
They want to make: ${recipeNames}.
Suggested shopping items from recipes: ${allShopping.join(', ') || 'none'}.

Analyse and give shopping advice. Return ONLY valid JSON:
{
  "mustBuy": ["essential item 1", "essential item 2"],
  "niceToHave": ["optional item 1", "optional item 2"],
  "tip": "One sentence dietary tip based on the user's current ingredient choices"
}`

  const raw = await callGemini(prompt)
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as ShoppingAnalysis
}
