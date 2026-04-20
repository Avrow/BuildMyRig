# Component Price Lookup System

## Overview

A smart component price lookup system that automatically manages caching and price updates. When a user queries a component name, the system:

1. **Checks the local database** for existing component data
2. **Validates cache freshness** - if price was updated within 24 hours, returns cached data
3. **Auto-scrapes** ryans.com and startech.com.bd via Firecrawler API if cache is stale
4. **Updates the database** with fresh pricing data from both sources
5. **Returns merged results** showing all available prices

## Architecture

### Components

#### Data Model (`src/models/Component.js`)

```javascript
{
  name: String,           // Component name
  type: String,          // CPU, GPU, RAM, Storage, etc.
  brand: String,         // Extracted from name
  specs: Mixed,          // Technical specifications
  prices: [{             // Array of prices from multiple sources
    source: String,      // "ryans" or "startech"
    price: Number,       // Price in local currency
    url: String,         // Source URL
    lastUpdated: Date    // When this price was fetched
  }],
  price: Number,         // Lowest price (for quick access)
  lastPriceUpdate: Date, // Overall cache timestamp
  imageUrl: String       // Component image
}
```

#### Service (`src/service/componentPriceService.js`)

Handles the intelligent caching and scraping logic:

- `getComponentPrice(name)` - Single component lookup
- `getComponentsPrices(names)` - Batch component lookup
- `isCacheExpired(lastUpdateDate)` - 24-hour cache validation
- `scrapeComponentPrices(name)` - Firecrawler integration

#### Controller (`src/controller/component.controller.js`)

Handles HTTP requests:

- `getComponentPriceHandler()` - Single component endpoint
- `getComponentsPricesHandler()` - Batch endpoint

#### Routes (`src/routes/component.route.js`)

Exposes the following endpoints:

- `GET /api/components/price?name=<component>`
- `POST /api/components/prices`

## API Usage

### Single Component Price Lookup

**Request:**

```bash
GET /api/components/price?name=RTX%204090
```

**Response (Cache Hit - Fresh Data):**

```json
{
  "component": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "RTX 4090",
    "type": "GPU",
    "brand": "NVIDIA",
    "specs": { ... },
    "prices": [
      {
        "source": "ryans",
        "price": 189999,
        "url": "https://ryans.com/product/rtx-4090",
        "lastUpdated": "2026-03-30T12:00:00Z"
      },
      {
        "source": "startech",
        "price": 185999,
        "url": "https://startech.com.bd/product/rtx-4090",
        "lastUpdated": "2026-03-30T12:00:00Z"
      }
    ],
    "imageUrl": "https://...",
    "cached": true,
    "lastPriceUpdate": "2026-03-30T12:00:00Z"
  },
  "message": "Data from cache (updated within 24 hours)"
}
```

**Response (Cache Miss - Auto-Scrape):**

```json
{
  "component": { ... },
  "message": "Data freshly scraped from ryans.com and startech.com.bd"
}
```

**Response (Scrape Failure with Fallback):**

```json
{
  "component": { ... },
  "message": "Data from cache (scraping failed, returning older data)",
  "warning": "Could not scrape from ryans.com"
}
```

### Batch Component Price Lookup

**Request:**

```bash
POST /api/components/prices
Content-Type: application/json

{
  "names": ["RTX 4090", "Ryzen 7 9700X", "Kingston DDR5 32GB"]
}
```

**Response:**

```json
{
  "components": [
    {
      "component": { ... },
      "message": "Data from cache (updated within 24 hours)"
    },
    { ... },
    { ... }
  ],
  "errors": [
    {
      "name": "Unknown Component",
      "error": "Could not fetch component data"
    }
  ],
  "summary": {
    "total": 3,
    "successful": 2,
    "failed": 1
  }
}
```

## Cache Strategy

### 24-Hour Cache Validation

The system tracks `lastPriceUpdate` timestamp for each component:

```javascript
function isCacheExpired(lastUpdateDate) {
	const now = new Date();
	const ageHours = (now - new Date(lastUpdateDate)) / (1000 * 60 * 60);
	return ageHours > 24; // 24-hour cache window
}
```

### Cache Flow

```
┌─ Component Query ─┐
│                   │
├─ Find in DB ──────┤
│                   │
├─ Check Timestamp ─┤
│         │         │
│    < 24h?        │
│     / \          │
│   YES NO         │
│   |   |          │
│   ✓   └─ Scrape ─┤
│       Update DB   │
│                   │
└─ Return Data ────┘
```

## Scraping Logic

### Data Sources

- **ryans.com** - Bangladesh electronics retailer
- **startech.com.bd** - Bangladesh computer hardware retailer

### Firecrawler Integration

Uses the Firecrawler API to scrape product pages:

```javascript
const scrapedData = await scrapeProductPrice(url);
// Returns: { name, price, source, url }
```

### Price Extraction

- Searches markdown content for Bengali Taka symbol (৳)
- Parses price as number with comma removal
- Validates price is positive number

### Error Handling

- If scraping fails for one source, continues with others
- If all scraping fails but cached data exists, returns stale cache with warning
- If no data available at all, returns error

## Database Updates

### New Components

When a component name is queried for the first time:

1. Creates new Component document
2. Initializes with brand from first word of name
3. Stores scraped prices from both sources
4. Sets `lastPriceUpdate` to current timestamp

### Existing Components

When cache expires and re-scraping is needed:

1. Finds existing document
2. Updates `prices` array with latest prices
3. Updates individual source `lastUpdated` timestamps
4. Updates `lastPriceUpdate` to current timestamp
5. Recalculates `price` as minimum across all sources

## Environment Variables

```bash
FIRECRAWL_API_KEY=<your-firecrawl-api-key>
```

## Error Codes

| Status | Scenario                                 |
| ------ | ---------------------------------------- |
| 400    | Missing/invalid component name parameter |
| 400    | Invalid request body format              |
| 500    | Database error                           |
| 500    | Firecrawler API failure                  |
| 500    | Price parsing failure                    |

## Performance Considerations

- **Cache Hits**: O(1) database lookup, fast response
- **Cache Misses**: Parallel scraping from both sources, ~5-10 seconds typical
- **Batch Queries**: Sequential processing, timeouts per component
- **Database Indexes**: Full-text index on name/brand for quick searching

## Future Enhancements

- [ ] Configurable cache duration per component type
- [ ] Price history tracking and trend analysis
- [ ] Notification system for price drops
- [ ] Additional data sources (international retailers)
- [ ] Product image auto-fetching
- [ ] Availability status tracking
- [ ] Concurrent scraping with rate limiting
