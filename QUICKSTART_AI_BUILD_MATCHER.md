# 🚀 AI Build Matcher - Quick Start Guide

## Setup (5 minutes)

### 1. Get OpenRouter API Key
- Go to https://openrouter.io/
- Sign up and navigate to Keys
- Copy your API key

### 2. Configure Environment

**Server** - Edit `server/.env`:
```
OPENROUTER_API_KEY=sk-or-your-key-here
APP_URL=http://localhost:3000
CLIENT_URL=http://localhost:3000
```

**Client** - Edit `client/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 3. Install Dependencies
```bash
cd server
npm install
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### 5. Test It Out
- Open http://localhost:3000/ai-build-matcher
- Fill in the form and click "Generate Build"
- Watch the AI create a perfect build for you! 🎉

## Feature Preview

### Input Form
- Budget: $500+ (e.g., $2000)
- Use Case: Gaming, Productivity, Streaming, Video Editing, General Use
- Resolution: 1080p, 1440p, 4K
- Preferred Brands: Optional (Intel, AMD, NVIDIA, etc.)
- Extra Notes: Optional (any specific preferences)

### Output Build
- Build name and summary
- Total estimated cost
- 8 component selections:
  - CPU
  - GPU
  - RAM
  - Storage
  - Motherboard
  - PSU
  - Case
  - Cooler
- Reasoning for each choice
- Compatibility warnings (if any)

## What's New

### Backend Files
- ✅ `server/src/controller/ai-build-matcher.controller.js` - AI matching logic
- ✅ `server/src/routes/ai-build-matcher.route.js` - API endpoint
- ✅ `server/src/app.js` - Route registered

### Frontend Files
- ✅ `client/src/app/ai-build-matcher/page.jsx` - Full feature page
- ✅ `client/src/lib/api.js` - API helper added
- ✅ `client/src/components/Navbar.jsx` - Navigation link added

## Key Features

🤖 **AI-Powered**: Uses GPT-4o-mini from OpenRouter
📦 **Catalog-Bound**: AI ONLY selects from your components
💰 **Budget-Conscious**: Respects budget constraints always
🎯 **Use-Case Aware**: Tailored for gaming, productivity, streaming, etc.
📱 **Responsive**: Works beautifully on mobile and desktop
🌙 **Dark Mode**: Full dark mode support
⚡ **Fast**: Generated builds in 10-30 seconds

## Troubleshooting

**Issue**: "AI service authentication failed"
→ Check your OpenRouter API key is correct and has credits

**Issue**: No components showing up
→ Run `npm run seed` in the server directory to populate the database

**Issue**: Build generation times out
→ The OpenRouter API might be slow, try again after a moment

**Issue**: Budget validation failing
→ Make sure budget is entered as a number >= 500

## API Reference

### POST /api/ai-build-matcher
```json
{
  "budget": 2000,
  "useCase": "gaming",
  "targetResolution": "1440p",
  "preferredBrands": ["NVIDIA", "Intel"],
  "extraNotes": ""
}
```

## Next Steps

1. Test with different budgets and use cases
2. Check the output builds for quality
3. Customize the system prompt in the controller if needed
4. Add to your feature documentation

Happy building! 🛠️✨
