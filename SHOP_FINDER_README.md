# Shop Finder Enhancement - Installation Guide

## Overview
The Shop Finder has been upgraded with real-time location search using free external APIs:
- **Nominatim API** (OpenStreetMap) - Convert location names to coordinates
- **Overpass API** - Find nearby computer/electronics shops
- **SimpleMap component** - Display shop locations (Leaflet.js ready)

## 📦 Package Installation Required

### For Full Interactive Map (Recommended)
Run these commands in the client directory:

```bash
cd client
npm install leaflet react-leaflet
```

### If npm is blocked (Windows PowerShell issue)
1. Open PowerShell as Administrator
2. Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Then run the npm install commands above

### Alternative: Manual Installation
Add to `client/package.json`:
```json
{
  "dependencies": {
    "leaflet": "^1.9.4",
    "react-leaflet": "^4.2.1"
  }
}
```

Then run: `npm install`

## 🚀 New Features

### 1. Location Search
- Search any location: "Mirpur Dhaka", "Gulshan", "Chattogram", etc.
- Automatically finds nearby computer/electronics shops within 2km radius
- Real-time geocoding using Nominatim API

### 2. Enhanced Shop Display
- **Verified Shops**: Original MongoDB shops (Startech, Ryans, etc.)
- **Area Search**: Real shops found via external APIs
- **Combined View**: Shows both sources together
- Visual badges to distinguish data sources

### 3. Map Integration
- **SimpleMap**: Current implementation (no external dependencies)
- **Leaflet Ready**: Prepared for full interactive map integration
- Shop pins and location markers
- Click to view on OpenStreetMap

### 4. Improved UI
- Location search bar with loading states
- Error handling for invalid locations
- Data source toggle buttons
- Enhanced shop cards with additional info
- Opening hours and website links (when available)

## 🔧 Technical Implementation

### API Services Created
- `src/services/geoService.js` - Nominatim + Overpass integration
- `src/components/SimpleMap.js` - Map component (Leaflet ready)

### Enhanced Components
- `src/app/shop-finder/page.js` - Upgraded with location search
- New state management for API results
- Combined data filtering (MongoDB + API)

### Data Flow
1. User types location → Nominatim converts to coordinates
2. Coordinates → Overpass finds nearby shops
3. Results → Combined with MongoDB shops
4. Display → Cards + Map view

## 🌍 API Endpoints Used

### Nominatim (Geocoding)
```
GET https://nominatim.openstreetmap.org/search?q={location}&format=json
```
- Free, no API key required
- Rate limit: ~1 request/second

### Overpass (Shop Search)
```
POST https://overpass-api.de/api/interpreter
```
- Free, no API key required
- Finds shops with tags: shop=computer, shop=electronics
- Search radius: 2km (configurable)

## 🎯 Usage Examples

### Search Locations That Work:
- "Mirpur Dhaka"
- "Gulshan 1 Dhaka" 
- "Dhanmondi Dhaka"
- "Chattogram"
- "Uttara Dhaka"
- "Banani Dhaka"

### Expected Results:
- 5-20 shops per search area
- Mix of computer shops and electronics stores
- Real addresses and phone numbers
- Opening hours (when available)

## 🔍 Troubleshooting

### Common Issues:
1. **"Location not found"** → Try more specific location names
2. **"No shops found"** → Try different area or expand search radius
3. **API rate limits** → Wait a few seconds between searches
4. **npm install fails** → Check PowerShell execution policy

### Debug Mode:
- Open browser console to see API calls
- Check network tab for request/response details
- View geocoding coordinates and shop data

## 🗺️ Future Enhancements

### With Leaflet.js Installed:
- Interactive map with zoom/pan
- Clickable shop markers
- Real-time location tracking
- Heat map of shop density
- Route planning features

### Additional Features:
- User ratings and reviews
- Shop comparison tools
- Price tracking
- Appointment booking
- Inventory checking

## 📱 Mobile Responsive
The enhanced Shop Finder is fully responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🔒 Privacy & Security
- No API keys required
- No user data stored
- All API calls are client-side
- OpenStreetMap data is open source

---

**Note**: The current implementation uses SimpleMap for immediate functionality. Install Leaflet packages for full interactive map features.
