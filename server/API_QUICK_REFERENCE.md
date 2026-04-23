# Component Price API - Quick Reference

## Base URL

```
http://localhost:8000/api/components
```

## Endpoints

### 1. Get Single Component Price

**GET** `/price?name=<component_name>`

```bash
curl "http://localhost:8000/api/components/price?name=RTX%204090"
```

**Query Parameters:**

- `name` (required) - Component name

**Response:**

```json
{
	"component": {
		"_id": "...",
		"name": "RTX 4090",
		"type": "GPU",
		"brand": "NVIDIA",
		"prices": [
			{
				"source": "ryans",
				"price": 189999,
				"url": "...",
				"lastUpdated": "2026-03-30T13:42:54Z"
			}
		],
		"cached": false,
		"lastPriceUpdate": "2026-03-30T13:42:54Z"
	},
	"message": "Data freshly scraped from ryans.com and startech.com.bd"
}
```

---

### 2. Get Multiple Component Prices (Batch)

**POST** `/prices`

```bash
curl -X POST "http://localhost:8000/api/components/prices" \
  -H "Content-Type: application/json" \
  -d '{"names": ["RTX 4090", "Ryzen 7", "Kingston DDR5"]}'
```

**Request Body:**

```json
{
	"names": ["component1", "component2", "component3"]
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
      "name": "invalid_component",
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

---

### 3. List All Components (Search/Filter)

**GET** `/`

```bash
curl "http://localhost:8000/api/components?type=GPU&brand=NVIDIA&page=1&limit=24"
```

**Query Parameters:**

- `search` - Search by name/brand
- `type` - Filter by type (CPU, GPU, RAM, Storage, etc.)
- `brand` - Filter by brand
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 24)

---

### 4. Update Component Image

**PATCH** `/:id/image`

```bash
curl -X PATCH "http://localhost:8000/api/components/{id}/image" \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "https://example.com/image.jpg"}'
```

---

## Response Codes

| Code | Meaning                              |
| ---- | ------------------------------------ |
| 200  | Success                              |
| 400  | Bad request (missing/invalid params) |
| 404  | Not found                            |
| 500  | Server error                         |

---

## Cache Behavior

### Cache Hit

- **Duration**: Up to 24 hours from last update
- **Response**: Instant (< 100ms)
- **Flag**: `cached: true`

### Cache Miss (Auto-Scrape)

- **Trigger**: First query or > 24 hours old
- **Sources**: ryans.com, startech.com.bd
- **Response**: ~5-10 seconds
- **Flag**: `cached: false`

### Cache Fallback

- If scraping fails but cached data exists
- Returns stale cache with warning
- Flag: `cached: true` + `warning` field

---

## Usage Examples

### JavaScript/Node.js

```javascript
// Single component
const res = await fetch("/api/components/price?name=RTX%204090");
const data = await res.json();
console.log(data.component.prices);

// Batch query
const res = await fetch("/api/components/prices", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({
		names: ["RTX 4090", "Ryzen 7", "Kingston DDR5"],
	}),
});
const data = await res.json();
console.log(`Fetched ${data.summary.successful} components`);
```

### cURL

```bash
# Single component
curl "http://localhost:8000/api/components/price?name=RTX%204090" | jq '.'

# Batch query
curl -X POST "http://localhost:8000/api/components/prices" \
  -H "Content-Type: application/json" \
  -d '{"names": ["RTX 4090", "Ryzen 7", "Kingston DDR5"]}'
```

### Python

```python
import requests

# Single component
resp = requests.get('http://localhost:8000/api/components/price',
                   params={'name': 'RTX 4090'})
print(resp.json())

# Batch query
resp = requests.post('http://localhost:8000/api/components/prices',
                    json={'names': ['RTX 4090', 'Ryzen 7', 'Kingston DDR5']})
print(resp.json())
```

---

## Important Notes

1. **Component names are case-insensitive** - "rtx 4090" = "RTX 4090"
2. **First query creates component** - If not in database, auto-creates on first query
3. **Batch queries process sequentially** - One at a time to avoid rate limits
4. **Prices in local currency** - Bengali Taka (৳) for BD retailers
5. **Multiple sources** - Component can have prices from multiple retailers
6. **24-hour cache** - Set by system, not configurable per request

---

## Troubleshooting

**Component not found?**

- Try a simpler name (e.g., "RTX" instead of "NVIDIA RTX 4090")
- Check if website structure changed (scraping may fail)

**Prices look wrong?**

- Prices are in local currency (BDT)
- Check `source` field to see which retailer
- `lastUpdated` shows when price was fetched

**Getting stale data?**

- Check `lastPriceUpdate` timestamp
- Manual re-scrape: Clear cache and query again (cache expires in 24h)

**Slow response on first query?**

- Normal - Firecrawler needs 5-10s to scrape both sites
- Subsequent queries are instant from cache

---

## Environment Setup

**Required:**

```bash
FIRECRAWL_API_KEY=<your-api-key>
```

**Optional:**

```bash
PORT=8000  # Server port (default: 3000)
```

---

## Data Sources

- **ryans.com** - Bangladesh electronics retailer
- **startech.com.bd** - Bangladesh computer hardware retailer

Component types supported:

- CPU
- GPU
- RAM
- Storage
- Motherboard
- PSU
- Case
- Cooler
