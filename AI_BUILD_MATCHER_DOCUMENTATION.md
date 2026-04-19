# AI Build Matcher Feature Documentation

## Overview
The **AI Build Matcher** is a comprehensive AI-powered feature that helps users create optimized PC builds based on their budget, use case, and performance requirements. The system leverages OpenRouter's API with GPT-4o-mini to intelligently select components from your component catalog.

## Feature Highlights

✨ **AI-Powered Recommendations** - Uses GPT-4o-mini to analyze your component catalog and create optimized builds

🎯 **Smart Constraints** - AI is strictly instructed to select ONLY from your component catalog, ensuring all recommendations are available

💰 **Budget-Aware** - Respects user budget constraints and optimizes for best value

🎮 **Multi-Use Case Support** - Supports Gaming, Productivity, Streaming, Video Editing, and General Use

📊 **Performance Targeting** - Builds optimized for 1080p, 1440p, or 4K resolution targets

🔧 **Flexible Preferences** - Optional brand preferences and extra notes for personalization

## Architecture

### Backend Implementation

#### New Files Created:
- [server/src/controller/ai-build-matcher.controller.js](../../server/src/controller/ai-build-matcher.controller.js) - Core logic for AI build matching
- [server/src/routes/ai-build-matcher.route.js](../../server/src/routes/ai-build-matcher.route.js) - API route handler

#### Modified Files:
- [server/package.json](../../server/package.json) - Added `openai` dependency for OpenRouter integration
- [server/src/app.js](../../server/src/app.js) - Registered the new route

#### Key Backend Logic:
1. **Component Fetching**: Retrieves all components from MongoDB, grouped by type
2. **System Prompt Engineering**: Builds a detailed system prompt that:
   - Restricts AI to select ONLY from the provided catalog
   - Specifies component compatibility requirements
   - Enforces budget constraints
   - Emphasizes value optimization

3. **OpenRouter Integration**:
   - Uses OpenAI-compatible SDK to call `openai/gpt-4o-mini` model
   - Includes proper error handling and validation
   - Returns structured JSON response

4. **Response Validation**: Ensures all required components are present, prices are accurate, and total doesn't exceed budget

### Frontend Implementation

#### New Files Created:
- [client/src/app/ai-build-matcher/page.jsx](../../client/src/app/ai-build-matcher/page.jsx) - Main page component with form and results display

#### Modified Files:
- [client/src/lib/api.js](../../client/src/lib/api.js) - Added `aiApi.generateBuildMatch()` function
- [client/src/components/Navbar.jsx](../../client/src/components/Navbar.jsx) - Added navigation link to AI Build Matcher

#### Key Frontend Features:
1. **Professional Hero Section**: Eye-catching introduction with feature highlights
2. **Intuitive Form**: Clean input interface for:
   - Budget input with validation (minimum $500)
   - Use case selection (5 visual options)
   - Resolution targeting (1080p, 1440p, 4K)
   - Multi-select brand preferences
   - Optional extra notes field

3. **State Management**:
   - Loading state with spinner and message
   - Error state with clear error messages
   - Empty state encouraging user action
   - Success state with detailed build results

4. **Results Display**:
   - Build summary with catchy name and description
   - Total estimated cost with visual emphasis
   - Warnings/considerations section
   - Component cards with:
     - Component type icon and name
     - Brand information
     - Price
     - AI reasoning for selection
   - Key reasoning points (numbered list)

## Environment Setup

### Required Configuration

Add these environment variables to your `.env.local` files:

**Server (.env):**
```
OPENROUTER_API_KEY=your_openrouter_api_key_here
APP_URL=http://localhost:3000
```

Get your OpenRouter API key from: https://openrouter.io/

**Client (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Installation

1. Install server dependencies:
```bash
cd server
npm install
```

2. Update `.env` with your OpenRouter API key

## API Endpoint

### POST `/api/ai-build-matcher`

Generates an AI-recommended PC build based on provided specifications.

**Request Body:**
```json
{
  "budget": 2000,
  "useCase": "gaming",
  "targetResolution": "1440p",
  "preferredBrands": ["NVIDIA", "Intel", "Corsair"],
  "extraNotes": "Need quiet cooling for streaming"
}
```

**Request Parameters:**
- `budget` (number, required) - Build budget in USD (minimum $500)
- `useCase` (string, required) - One of: "gaming", "productivity", "streaming", "video-editing", "general-use"
- `targetResolution` (string, required) - One of: "1080p", "1440p", "4K"
- `preferredBrands` (array, optional) - List of preferred component brands
- `extraNotes` (string, optional) - Additional user preferences or constraints

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "buildName": "1440p Gaming Beast",
    "summary": "This build is optimized for high-refresh 1440p gaming...",
    "estimatedTotal": 1950,
    "selectedParts": {
      "CPU": {
        "name": "Intel Core i7-14700K",
        "brand": "Intel",
        "price": 399,
        "reason": "Excellent gaming performance with 20 cores..."
      },
      "GPU": {
        "name": "NVIDIA RTX 4070 Ti",
        "brand": "NVIDIA",
        "price": 750,
        "reason": "Perfect for 1440p high-refresh gaming..."
      },
      // ... other components
    },
    "reasoning": [
      "Selected high-performance components to achieve 100+ FPS at 1440p",
      "Balanced CPU and GPU for optimal gaming performance",
      "Efficient power management with 750W PSU"
    ],
    "warnings": []
  }
}
```

**Error Responses:**
- `400` - Invalid input (budget too low, invalid use case, etc.)
- `500` - Server error (API key issues, component fetch failed, etc.)

## How It Works

### User Flow

1. **User navigates** to `/ai-build-matcher`
2. **Fills out form** with budget, use case, resolution, preferences
3. **Clicks "Generate Build"** button
4. **Form validates** inputs (budget >= $500, all required fields filled)
5. **Frontend sends request** to backend with form data
6. **Backend processes request**:
   - Fetches all components from MongoDB
   - Groups them by type (CPU, GPU, RAM, etc.)
   - Builds detailed system prompt with catalog
   - Calls OpenRouter API with GPT-4o-mini
   - Parses JSON response from AI
   - Validates response structure and compatibility
7. **Frontend receives result** and displays beautiful formatted build
8. **User can reset** and generate another build

### AI Prompt Strategy

The system prompt is carefully engineered to ensure:
- ✅ AI ONLY selects from provided catalog
- ✅ All components are compatible
- ✅ Total cost respects budget
- ✅ Build meets performance targets for use case and resolution
- ✅ Reasoning explains each choice

The prompt includes the complete component catalog in JSON format, making it impossible for the AI to suggest components outside your inventory.

## Component Types Supported

The feature works with the following PC component types:
- **CPU** - Processors (Intel, AMD)
- **GPU** - Graphics cards (NVIDIA, AMD, Intel)
- **RAM** - Memory (DDR4, DDR5)
- **Storage** - Hard drives, SSDs (NVMe, SATA)
- **Motherboard** - Motherboards
- **PSU** - Power supply units
- **Case** - PC cases
- **Cooler** - CPU coolers (air, liquid)

## Use Cases Supported

1. **Gaming** - Optimized for high FPS and visual fidelity
2. **Productivity** - Balanced for multitasking and professional work
3. **Streaming** - Heavy on GPU/CPU for encoding quality
4. **Video Editing** - High RAM and storage, powerful CPU/GPU
5. **General Use** - Budget-friendly, reliable daily use

## Styling & Design

- **Color scheme**: Modern Tailwind CSS with blue accent color
- **Dark mode**: Full dark mode support with color consistency
- **Responsive**: Mobile-first design that works on all screen sizes
- **Icons**: Lucide React icons for visual clarity
- **Animations**: Smooth loading spinners and transitions
- **Typography**: Clear hierarchy with readable font sizes

## Error Handling

### Frontend Errors
- Budget validation (< $500)
- Required field validation
- Network errors
- API error responses

### Backend Errors
- MongoDB connection issues
- OpenRouter API key missing/invalid
- API rate limiting
- JSON parsing failures
- Missing components in catalog

All errors display user-friendly messages and allow retry.

## Performance Considerations

- **Component fetching**: Async database query, grouped by type
- **API call**: Typically 10-30 seconds (depends on API load)
- **Response parsing**: Handles malformed JSON gracefully
- **Caching**: Could be added for 1-2 hours if needed
- **Rate limiting**: Should be implemented in production

## Testing the Feature

### Manual Testing Steps

1. **Start servers**:
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

2. **Test successful build**:
   - Navigate to http://localhost:3000/ai-build-matcher
   - Enter budget: 2000
   - Select use case: Gaming
   - Select resolution: 1440p
   - Leave brands empty or select some
   - Click "Generate Build"
   - Verify results display all components

3. **Test validation**:
   - Try budget < 500 (should show error)
   - Try submitting without use case (should show error)
   - Try submitting without resolution (should show error)

4. **Test error handling**:
   - Temporarily remove API key from .env
   - Attempt to generate build
   - Verify error message displays

## Future Enhancements

- 📊 Add cost breakdowns by component type
- ⚡ Add estimated power consumption display
- 🔄 Add "refine" feature to regenerate with different constraints
- 💾 Add ability to save builds to user dashboard
- 🔗 Add 1-click shopping links to component pages
- 📈 Track popular builds and use cases
- 🤝 Community build sharing and ratings
- 🎮 Gaming benchmark predictions for selected config

## Troubleshooting

### API Key Issues
**Error**: "AI service authentication failed"
- ✅ Verify `OPENROUTER_API_KEY` is set in `.env`
- ✅ Check API key is valid on openrouter.io
- ✅ Ensure `APP_URL` env var is set (even for local testing)

### Component Catalog Empty
**Issue**: "No components returned"
- ✅ Verify MongoDB is running and connected
- ✅ Check if components have been seeded: `npm run seed` (in server)
- ✅ Verify component prices are set (null prices handled but affect cost calculation)

### Build Exceeds Budget
**Issue**: AI returned build over budget
- ✅ This shouldn't happen due to system prompt constraints
- ✅ Check if component prices are accurate in DB
- ✅ May indicate need for stricter prompt engineering

### Timeout on Generate
**Issue**: Request takes > 60 seconds
- ✅ OpenRouter API might be slow
- ✅ Try again (temporary API load)
- ✅ Check network connectivity

## Files Modified Summary

| File | Changes |
|------|---------|
| [server/package.json](../../server/package.json) | Added openai dependency |
| [server/src/app.js](../../server/src/app.js) | Registered /api/ai-build-matcher route |
| [client/src/lib/api.js](../../client/src/lib/api.js) | Added aiApi.generateBuildMatch() |
| [client/src/components/Navbar.jsx](../../client/src/components/Navbar.jsx) | Added AI Builder navigation link |

## Files Created Summary

| File | Purpose |
|------|---------|
| [server/src/controller/ai-build-matcher.controller.js](../../server/src/controller/ai-build-matcher.controller.js) | Core AI build matching logic |
| [server/src/routes/ai-build-matcher.route.js](../../server/src/routes/ai-build-matcher.route.js) | Route handler and validation |
| [client/src/app/ai-build-matcher/page.jsx](../../client/src/app/ai-build-matcher/page.jsx) | Full page with form and results |

---

**Implementation Status**: ✅ Complete and Ready for Use

The AI Build Matcher feature is fully implemented with professional UI, robust error handling, and comprehensive OpenRouter integration. Users can now generate AI-powered PC builds tailored to their specific needs!
