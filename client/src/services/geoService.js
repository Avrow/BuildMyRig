// API service for Nominatim (geocoding) and Overpass (shop search)

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org/search';
const OVERPASS_BASE_URL = 'https://overpass-api.de/api/interpreter';

/**
 * Convert location name to coordinates using Nominatim API
 * @param {string} location - Location name (e.g., "Mirpur Dhaka", "Gulshan")
 * @returns {Promise<{lat: number, lon: number, display_name: string}>}
 */
export const geocodeLocation = async (location) => {
    try {
        const params = new URLSearchParams({
            q: location,
            format: 'json',
            limit: 1,
            addressdetails: 1
        });

        const response = await fetch(`${NOMINATIM_BASE_URL}?${params}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.length === 0) {
            throw new Error('Location not found');
        }

        const result = data[0];
        return {
            lat: parseFloat(result.lat),
            lon: parseFloat(result.lon),
            display_name: result.display_name,
            address: result.address
        };
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
};

/**
 * Find computer/electronics shops near coordinates using Overpass API
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude 
 * @param {number} radius - Search radius in meters (default: 2000m = 2km)
 * @returns {Promise<Array>} Array of shop objects
 */
export const findNearbyShops = async (lat, lon, radius = 2000) => {
    try {
        // Overpass QL query to find computer and electronics shops
        const query = `
            [out:json][timeout:25];
            (
                node["shop"="computer"](around:${radius},${lat},${lon});
                node["shop"="electronics"](around:${radius},${lat},${lon});
                way["shop"="computer"](around:${radius},${lat},${lon});
                way["shop"="electronics"](around:${radius},${lon});
                relation["shop"="computer"](around:${radius},${lat},${lon});
                relation["shop"="electronics"](around:${radius},${lon});
            );
            out body;
            >;
            out skel qt;
        `;

        const response = await fetch(OVERPASS_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: query
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Process and normalize the results
        const shops = [];
        const processedElements = new Set();

        data.elements.forEach(element => {
            // Skip if we've already processed this element (avoid duplicates)
            const elementId = `${element.type}_${element.id}`;
            if (processedElements.has(elementId)) return;
            processedElements.add(elementId);

            // Extract shop information
            const tags = element.tags || {};
            const shopName = tags.name || tags['brand'] || 'Unnamed Shop';
            const shopType = tags.shop || 'unknown';
            
            // Get coordinates
            let lat, lon;
            if (element.type === 'node') {
                lat = element.lat;
                lon = element.lon;
            } else if (element.type === 'way' || element.type === 'relation') {
                // For ways and relations, use the center coordinates
                lat = element.center?.lat;
                lon = element.center?.lon;
            }

            if (!lat || !lon) return; // Skip if no coordinates

            // Build address from tags
            const address = [
                tags['addr:housenumber'],
                tags['addr:street'],
                tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
                tags['addr:postcode']
            ].filter(Boolean).join(', ') || 'Address not available';

            // Get contact information
            const phone = tags.phone || tags['contact:phone'] || 'Phone not available';
            const website = tags.website || tags['contact:website'] || '';
            const openingHours = tags['opening_hours'] || '';

            // Determine shop categories
            const categories = [];
            if (shopType === 'computer') categories.push('Computer');
            if (shopType === 'electronics') categories.push('Electronics');
            
            // Add additional categories based on tags
            if (tags['shop:computer:category']) {
                categories.push(tags['shop:computer:category']);
            }
            if (tags['shop:electronics:category']) {
                categories.push(tags['shop:electronics:category']);
            }

            shops.push({
                _id: `osm_${element.type}_${element.id}`,
                shopName,
                area: tags['addr:city'] || tags['addr:town'] || 'Unknown Area',
                address,
                phone,
                website,
                openingHours,
                categories: categories.length > 0 ? categories : ['Shop'],
                verified: false, // OSM data is not verified
                lat,
                lon,
                source: 'osm', // Track data source
                tags // Keep original tags for reference
            });
        });

        return shops;
    } catch (error) {
        console.error('Overpass API error:', error);
        throw error;
    }
};

/**
 * Search shops for a given location
 * @param {string} location - Location name
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array>} Array of shop objects
 */
export const searchShopsByLocation = async (location, radius = 2000) => {
    try {
        // First get coordinates for the location
        const coordinates = await geocodeLocation(location);
        
        // Then find shops near those coordinates
        const shops = await findNearbyShops(coordinates.lat, coordinates.lon, radius);
        
        // Add location info to each shop
        return {
            shops,
            searchLocation: {
                name: location,
                coordinates,
                displayName: coordinates.display_name
            }
        };
    } catch (error) {
        console.error('Shop search error:', error);
        throw error;
    }
};
