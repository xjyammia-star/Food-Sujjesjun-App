// api.ts
import type { Recipe, ShoppingAnalysis, Selections } from './types';
import { ALL_EQUIPMENT, EQUIPMENT_INFO, type Equipment } from './components/EquipmentPanel';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ─── Build a plain-English equipment restriction sentence ─────────────────────
function buildEquipmentClause(availableEquipment: Equipment[], lang: 'en' | 'zh'): string {
  const available = new Set(availableEquipment);
  const missing = ALL_EQUIPMENT.filter((eq) => !available.has(eq));

  if (missing.length === 0) {
    return lang === 'zh'
      ? '用户拥有所有常见厨具，可自由使用任何烹饪方式。'
      : 'The user has all common cooking equipment; any cooking method is fine.';
  }

  if (availableEquipment.length === 0) {
    return lang === 'zh'
      ? '用户没有任何厨具。请只生成不需要任何设备、可以完全手工完成的食谱（如沙拉、凉拌菜等）。'
      : 'The user has NO cooking equipment. Only suggest recipes that require absolutely no appliances (e.g. salads, no-cook dishes).';
  }

  const missingNames = missing.map((eq) =>
    lang === 'zh' ? EQUIPMENT_INFO[eq].labelZh : EQUIPMENT_INFO[eq].labelEn
  );
  const availableNames = availableEquipment.map((eq) =>
    lang === 'zh' ? EQUIPMENT_INFO[eq].labelZh : EQUIPMENT_INFO[eq].labelEn
  );

  if (lang === 'zh') {
    return (
      `用户没有以下厨具：${missingNames.join('、')}。` +
      `请确保食谱的每一个步骤都不需要使用这些设备。` +
      `用户拥有的厨具为：${availableNames.join('、')}。` +
      `食谱必须只使用这些可用的厨具。`
    );
  }

  return (
    `The user does NOT have the following equipment: ${missingNames.join(', ')}. ` +
    `Every step in every recipe must be achievable WITHOUT using any of those. ` +
    `The user DOES have: ${availableNames.join(', ')}. ` +
    `All cooking methods must only use the available equipment listed.`
  );
}

// ─── Recipe generation ────────────────────────────────────────────────────────
export async function fetchRecipes(
  ingredients: string[],
  mainIngredient: string | null,
  selections: Selections,
  lang: 'en' | 'zh'
): Promise<Recipe[]> {
  const equipmentClause = buildEquipmentClause(
    selections.availableEquipment,
    lang
  );

  const prompt =
    lang === 'zh'
      ? `你是一位专业厨师和营养师。请根据以下信息生成2-3个食谱。

食材：${ingredients.join('、')}
${mainIngredient ? `主要食材（所有食谱必须以此为核心）：${mainIngredient}` : ''}
菜系偏好：${selections.cuisine || '无特别偏好'}
营养目标：${selections.nutritionGoal || '均衡饮食'}
烹饪时间：${selections.cookTime || '无限制'}
餐点类型：${selections.mealType || '任意'}
技能水平：${selections.skillLevel || '普通'}
饮食限制：${selections.dietary.length > 0 ? selections.dietary.join('、') : '无'}
厨房常备：${selections.pantryStaples.length > 0 ? selections.pantryStaples.join('、') : '无'}

【厨具限制 - 非常重要】${equipmentClause}

请严格按照以下JSON格式返回，不要有任何其他文字：
{
  "recipes": [
    {
      "name": "菜名",
      "description": "简短描述（1-2句话）",
      "ingredients": ["食材1 - 用量", "食材2 - 用量"],
      "steps": ["步骤1", "步骤2"],
      "cookTime": "烹饪时间",
      "difficulty": "简单/中等/困难",
      "nutrition": {
        "calories": 数字,
        "protein": "克数g",
        "carbs": "克数g",
        "fat": "克数g",
        "fiber": "克数g"
      },
      "substitutions": ["替代方案1", "替代方案2"],
      "shoppingList": ["需要购买的食材1", "需要购买的食材2"]
    }
  ]
}`
      : `You are a professional chef and nutritionist. Generate 2-3 recipes based on the following:

Ingredients available: ${ingredients.join(', ')}
${mainIngredient ? `Main ingredient (all recipes must centre around this): ${mainIngredient}` : ''}
Cuisine preference: ${selections.cuisine || 'No preference'}
Nutrition goal: ${selections.nutritionGoal || 'Balanced'}
Cook time: ${selections.cookTime || 'No limit'}
Meal type: ${selections.mealType || 'Any'}
Skill level: ${selections.skillLevel || 'Intermediate'}
Dietary restrictions: ${selections.dietary.length > 0 ? selections.dietary.join(', ') : 'None'}
Pantry staples available: ${selections.pantryStaples.length > 0 ? selections.pantryStaples.join(', ') : 'None'}

[EQUIPMENT RESTRICTION — VERY IMPORTANT] ${equipmentClause}

Return ONLY valid JSON in this exact format, no other text:
{
  "recipes": [
    {
      "name": "Recipe name",
      "description": "Short description (1-2 sentences)",
      "ingredients": ["Ingredient 1 - amount", "Ingredient 2 - amount"],
      "steps": ["Step 1", "Step 2"],
      "cookTime": "cooking time",
      "difficulty": "Easy/Medium/Hard",
      "nutrition": {
        "calories": number,
        "protein": "Xg",
        "carbs": "Xg",
        "fat": "Xg",
        "fiber": "Xg"
      },
      "substitutions": ["Substitution 1", "Substitution 2"],
      "shoppingList": ["Item to buy 1", "Item to buy 2"]
    }
  ]
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed.recipes || [];
  } catch {
    console.error('Failed to parse recipe JSON:', cleaned);
    throw new Error('Failed to parse recipes from AI response');
  }
}

// ─── Shopping analysis ────────────────────────────────────────────────────────
export async function fetchShoppingAnalysis(
  recipes: Recipe[],
  ingredients: string[],
  lang: 'en' | 'zh'
): Promise<ShoppingAnalysis> {
  const recipeNames = recipes.map((r) => r.name).join(lang === 'zh' ? '、' : ', ');
  const allShoppingItems = [...new Set(recipes.flatMap((r) => r.shoppingList))];

  const prompt =
    lang === 'zh'
      ? `你是一位购物助手。用户想做以下菜肴：${recipeNames}。
用户已有食材：${ingredients.join('、')}
需要购买的食材清单：${allShoppingItems.join('、')}

请分析哪些是必须购买的，哪些是可选的，并给出一个简短的饮食建议。

只返回以下JSON格式，不要有任何其他文字：
{
  "mustBuy": ["必买食材1", "必买食材2"],
  "niceToHave": ["可选食材1", "可选食材2"],
  "dietTip": "简短的饮食建议（1-2句话）"
}`
      : `You are a shopping assistant. The user wants to make: ${recipeNames}.
User already has: ${ingredients.join(', ')}
Shopping list across all recipes: ${allShoppingItems.join(', ')}

Categorise which items are must-buy vs nice-to-have, and give a brief diet tip.

Return ONLY this JSON format, no other text:
{
  "mustBuy": ["Must-buy item 1", "Must-buy item 2"],
  "niceToHave": ["Nice-to-have item 1", "Nice-to-have item 2"],
  "dietTip": "Brief diet tip (1-2 sentences)"
}`;

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    return {
      mustBuy: allShoppingItems.slice(0, Math.ceil(allShoppingItems.length / 2)),
      niceToHave: allShoppingItems.slice(Math.ceil(allShoppingItems.length / 2)),
      dietTip:
        lang === 'zh'
          ? '均衡饮食，注意营养搭配。'
          : 'Eat a balanced diet with varied nutrients.',
    };
  }
}

// ─── Dish image (Imagen via Vercel serverless) ────────────────────────────────
export async function fetchDishImage(
  dishName: string,
  cuisine: string
): Promise<string> {
  const prompt = `Professional food photography of ${dishName}, ${cuisine} cuisine, beautifully plated on a clean white plate, soft natural lighting, shallow depth of field, restaurant quality, high resolution`;

  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error(`Image API error: ${response.status}`);
  }

  const data = await response.json();
  return data.imageBase64 || '';
}
