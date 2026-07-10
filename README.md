# Fridge to Meal 🍳

An AI-powered recipe generator — add the ingredients you have, pick your preferences, and get recipe ideas instantly.

## Features

- **Ingredient input** — add ingredients as tags, press Enter to confirm
- **Main ingredient** — star (⭐) any ingredient to make it the focus of all recipes
- **Pantry staples** — toggle to assume salt, oil, sugar, soy sauce, and water are available
- **6 preference filters** — cuisine, nutritional goal, cook time, meal type, skill level, dietary needs
- **AI recipe generation** — powered by Claude (claude-sonnet-4-6)
- **Serving size adjuster** — scale servings up or down on each recipe card
- **Generation history** — tap a past search to instantly re-run it
- **Share recipe** — copy any recipe as plain text to your clipboard
- **English / 中文** — full language toggle for UI and AI output

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add your Anthropic API key

Create a `.env` file in the project root:

```
VITE_ANTHROPIC_API_KEY=your_api_key_here
```

Then update `src/api.ts` to use it:

```ts
headers: {
  'Content-Type': 'application/json',
  'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-dangerous-direct-browser-access': 'true',
},
```

> ⚠️ **Note:** Calling the Anthropic API directly from the browser exposes your API key. For production, route requests through a backend or Vercel serverless function instead.

### 3. Run locally

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add `VITE_ANTHROPIC_API_KEY` as an environment variable in Vercel project settings
4. Deploy

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Styling | CSS Modules |
| AI | Claude API (claude-sonnet-4-6) |
| Deployment | Vercel |

## Planned features (Phase 2)

- User accounts (email / Google login)
- Save favourite recipes
- Neon PostgreSQL backend via Vercel serverless functions
