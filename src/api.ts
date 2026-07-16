import type { Lang, Recipe, Selections, ShoppingAnalysis, Equipment } from './types'
import { T } from './translations'
import { ALL_EQUIPMENT, EQUIPMENT_INFO } from './components/EquipmentPanel'

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

function buildEquipmentClause(availableEquipment: Set<Equipment>, lang: Lang): string {
  const missing = ALL_EQUIPMENT.filter(eq => !availableEquipment.has(eq))

  if (missing.length === 0) return ''

  if (availableEquipment.size === 0) {
    return lang === 'zh'
      ? '【厨具限制】用户没有任何厨具，只能推荐完全不需要烹饪设备的菜肴（如沙拉、凉拌等）。'
      : '[EQUIPMENT] The user has NO cooking equipment. Only suggest no-cook dishes (e.g. salads, cold dishes).'
  }

  const missingNames = missing.map(eq =>
    lang === 'zh' ? EQUIPMENT_INFO[eq].labelZh : EQUIPMENT_INFO[eq].labelEn
  )
  const availableNames = ALL_EQUIPMENT
    .filter(eq => availableEquipment.has(eq))
    .map(eq => lang === 'zh' ? EQUIPMENT_INFO[eq].labelZh : EQUIPMENT_INFO[eq].labelEn)

  return lang === 'zh'
    ? `【厨具限制】用户没有：${missingNames.join('、')}。所有食谱步骤必须只使用：${availableNames.join('、')}。绝对不能出现需要缺少厨具的步骤。`
    : `[EQUIPMENT RESTRICTION] The user does NOT have: ${missingNames.join(', ')}. Every recipe step must only use: ${availableNames.join(', ')}. Do not include any step requiring missing equipment.`
}

function buildIngredientClause(
  ingredients: string[],
  staples: boolean,
  strict: boolean,
  lang: Lang
): string {
  const stapleList = lang === 'zh'
    ? '盐、食用油、糖、水、酱油'
    : 'salt, oil, sugar, water, soy sauce'

  if (strict) {
    return lang === 'zh'
      ? `【严格食材限制】用户需要立刻做饭，没有时间购物。食谱必须100%只使用用户提供的食材${staples ? `加上厨房常备（${stapleList}）` : ''}，绝对不能要求购买任何额外食材。"shopping"字段必须为空数组[]。`
      : `[STRICT INGREDIENTS] The user needs to cook right now and cannot go shopping. Recipes MUST use ONLY the ingredients listed${staples ? ` plus pantry staples (${stapleList})` : ''}. Do not require any extra items to buy. The "shopping" field MUST be an empty array [].`
  } else {
    return lang === 'zh'
      ? `【食材提示】如果食谱需要用户未列出的食材，请在"shopping"字段列出，并在"substitutions"字段为每个缺少的食材提供替代方案（用用户已有的食材替代），这样用户可以选择购买或直接替代。`
      : `[INGREDIENT GUIDANCE] If a recipe needs ingredients the user hasn't listed, include them in the "shopping" field. For every such missing ingredient, also provide a substitution in the "substitutions" field showing what the user can use instead from what they already have, so they can cook immediately if they choose not to shop.`
  }
}

function buildTasteClause(tasteNotes: string, lang: Lang): string {
  if (!tasteNotes.trim()) return ''

  return lang === 'zh'
    ? `【口味要求 - 必须严格遵守】用户的口味偏好：${tasteNotes}。请确保每道菜的所有步骤和用量都严格按照这些口味要求调整。`
    : `[TASTE PREFERENCES — MUST FOLLOW STRICTLY] The user's taste preferences: ${tasteNotes}. Every recipe's steps and ingredient quantities must be adjusted to respect these preferences throughout.`
}

export async function fetchRecipes(
  ingredients: string[],
  mainIngredient: string | null,
  selections: Selections,
  staples: boolean,
  lang: Lang,
  availableEquipment?: Set<Equipment>,
  strictIngredients?: boolean,
  tasteNotes?: string
): Promise<Recipe[]> {
  const t = T[lang]
  const isZh = lang === 'zh'

  const cuisineLabel = selections.cuisine !== null ? t.cuisine[selections.cuisine] : null
  const goalLabel = selections.goal !== null ? t.goal[selections.goal] : null
  const timeLabel = selections.time !== null ? t.time[selections.time] : null
  const mealLabel = selections.meal !== null ? t.meal[selections.meal] : null
  const skillLabel = selections.skill !== null ? t.skill[selections.skill] : null
  const dietLabel = selections.diet !== null ? t.diet[selections.diet] : null

  const equipmentClause = availableEquipment
    ? buildEquipmentClause(availableEquipment, lang)
    : ''

  const ingredientClause = buildIngredientClause(
    ingredients,
    staples,
    strictIngredients ?? false,
    lang
  )

  const tasteClause = buildTasteClause(tasteNotes ?? '', lang)

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
${tasteClause}
${ingredientClause}
${equipmentClause}

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
${tasteClause}
${ingredientClause}
${equipmentClause}

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

export async function fetchDishImage(dishName: string, cuisine: string): Promise<string | null> {
  try {
    const prompt = `Professional food photography of ${dishName}, ${cuisine} cuisine, served on a beautiful plate, restaurant quality, soft natural lighting, shallow depth of field, top-down or 45-degree angle shot, highly appetizing, vibrant colors, 4K ultra detailed`

    const res = await fetch('/api/generate-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    })

    if (!res.ok) return null
    const data = await res.json()
    return data.image ?? null
  } catch {
    return null
  }
}
