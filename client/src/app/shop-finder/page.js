"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Phone, ExternalLink, CheckCircle, Store, Map, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
// import SimpleMap from "@/components/SimpleMap";
// import { searchShopsByLocation } from "@/services/geoService";

// Real API functions for Nominatim and Overpass
const geocodeLocation = async (location) => {
    try {
        const params = new URLSearchParams({
            q: location,
            format: 'json',
            limit: 1,
            addressdetails: 1
        });

        const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
            headers: {
                'User-Agent': 'BuildMyRig/1.0'
            }
        });
        
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

const findNearbyShops = async (lat, lon, radius = 50000) => {
    try {
        const query = `
            [out:json][timeout:25];
            (
              node["shop"="computer"](around:${radius},${lat},${lon});
              node["shop"="electronics"](around:${radius},${lat},${lon});
              node["shop"="hardware"](around:${radius},${lat},${lon});
              node["shop"="mobile_phone"](around:${radius},${lat},${lon});
              node["name"~"computer|tech|digital|ryans|startech|ultratech|skyland|laptop|pc|hardware",i](around:${radius},${lat},${lon});
            );
            out body;
        `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
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
        
        const shops = [];
        const processedElements = new Set();

        data.elements.forEach(element => {
            const elementId = `${element.type}_${element.id}`;
            if (processedElements.has(elementId)) return;
            processedElements.add(elementId);

            const tags = element.tags || {};
            const shopName = tags.name || tags['brand'];
            const shopType = tags.shop || 'unknown';
            
            // Skip shops without proper names
            if (!shopName || shopName.trim() === '' || shopName.toLowerCase().includes('unnamed') || shopName.toLowerCase().includes('unknown')) {
                return;
            }
            
            // Comprehensive filtering to exclude non-computer businesses
            const lowerName = shopName.toLowerCase();
            
            // Exclude TV channels, media, news
            const excludedMedia = ['tv', 'news', 'bangla vision', 'atn', 'channel', 'television', 'media', 'broadcast', 'radio', 'satellite'];
            if (excludedMedia.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude phone-related shops completely
            const excludedPhone = ['phone', 'mobile', 'sim', 'recharge', 'topup', 'balance', 'airtel', 'grameenphone', 'robi', 'banglalink', 'teletalk'];
            if (excludedPhone.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude educational institutions
            const excludedEducation = ['university', 'college', 'school', 'institute', 'academy', 'campus', 'education'];
            if (excludedEducation.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude government and non-shop entities
            const excludedGovernment = ['government', 'office', 'ministry', 'department', 'municipality', 'city corporation'];
            if (excludedGovernment.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude medical and services
            const excludedMedical = ['hospital', 'clinic', 'pharmacy', 'doctor', 'medical', 'health'];
            if (excludedMedical.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude food and retail
            const excludedFood = ['restaurant', 'food', 'cafe', 'grocery', 'supermarket', 'bakery'];
            if (excludedFood.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude banks and financial
            const excludedFinancial = ['bank', 'atm', 'insurance', 'financial'];
            if (excludedFinancial.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Exclude generic names that are likely not computer shops
            const excludedGeneric = ['service center', 'customer service', 'hotline', 'helpline', 'support', 'call center'];
            if (excludedGeneric.some(term => lowerName.includes(term))) {
                return;
            }
            
            // Must be either a shop type we want OR have computer-related keywords in name
            const validShopTypes = ['computer', 'electronics', 'hardware'];
            const computerKeywords = ['computer', 'tech', 'digital', 'ryans', 'startech', 'ultratech', 'skyland', 'laptop', 'pc', 'hardware', 'desktop', 'printer', 'monitor', 'keyboard', 'mouse'];
            
            const isValidShopType = validShopTypes.includes(shopType);
            const hasComputerKeyword = computerKeywords.some(keyword => lowerName.includes(keyword));
            
            if (!isValidShopType && !hasComputerKeyword) {
                return; // Skip if neither valid shop type nor computer keywords
            }
            
            let lat, lon;
            if (element.type === 'node') {
                lat = element.lat;
                lon = element.lon;
            } else if (element.type === 'way' || element.type === 'relation') {
                lat = element.center?.lat;
                lon = element.center?.lon;
            }

            if (!lat || !lon) return;

            const address = [
                tags['addr:housenumber'],
                tags['addr:street'],
                tags['addr:city'] || tags['addr:town'] || tags['addr:village'],
                tags['addr:postcode']
            ].filter(Boolean).join(', ') || 'Address not available';

            const phone = tags.phone || tags['contact:phone'] || 'Phone not available';
            const website = tags.website || tags['contact:website'] || '';
            const openingHours = tags['opening_hours'] || '';

            const categories = [];
            if (shopType === 'computer') categories.push('Computer');
            if (shopType === 'electronics') categories.push('Electronics');
            if (shopType === 'hardware') categories.push('Hardware');
            if (shopType === 'mobile_phone') categories.push('Mobile Phone');
            
            if (tags['shop:computer:category']) {
                categories.push(tags['shop:computer:category']);
            }
            if (tags['shop:electronics:category']) {
                categories.push(tags['shop:electronics:category']);
            }

            // Extract area/neighborhood from address or tags
            let area = tags['addr:city'] || tags['addr:town'] || tags['addr:village'] || 'Unknown Area';
            if (area === 'Unknown Area' && tags['addr:suburb']) {
                area = tags['addr:suburb'];
            }
            if (area === 'Unknown Area' && tags['addr:district']) {
                area = tags['addr:district'];
            }

            shops.push({
                _id: `osm_${element.type}_${element.id}`,
                shopName,
                area,
                address,
                phone,
                website,
                openingHours,
                categories: categories.length > 0 ? categories : ['Shop'],
                verified: false,
                lat,
                lon,
                source: 'osm',
                tags
            });
        });

        return shops;
    } catch (error) {
        console.error('Overpass API error:', error);
        throw error;
    }
};

const searchShopsByLocation = async (location, radius = 2000) => {
    try {
        const coordinates = await geocodeLocation(location);
        const shops = await findNearbyShops(coordinates.lat, coordinates.lon, radius);
        
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

const ShopFinder = () => {
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [areas, setAreas] = useState([]);
    const [allAreas, setAllAreas] = useState([]); // All areas from all divisions
    
    // Comprehensive areas list for all Bangladesh divisions
    const divisionAreas = {
        'Dhaka Division': [
            'Dhaka', 'Gulshan', 'Banani', 'Dhanmondi', 'Mirpur', 'Uttara', 'Mohammadpur', 
            'Tejgaon', 'Shahbagh', 'Old Dhaka', 'Paltan', 'Motijheel', 'Farmgate', 'Bashundhara',
            'Baridhara', 'Niketan', 'Gazipur', 'Narayanganj', 'Manikganj', 'Munshiganj', 'Rajbari',
            'Faridpur', 'Madhabdi', 'Kaliakair', 'Savar', 'Ashulia', 'Tongi', 'Keraniganj'
        ],
        'Chittagong Division': [
            'Chattogram', 'Agrabad', 'Halishahar', 'Pahartali', 'Bayezid', 'Patenga', 'Karnaphuli',
            'Cox\'s Bazar', 'Teknaf', 'Ukhia', 'Ramu', 'Chakaria', 'Bandarban', 'Rangamati',
            'Khagrachari', 'Comilla', 'Feni', 'Brahmanbaria', 'Chandpur', 'Lakshmipur', 'Noakhali',
            'Sitakunda', 'Bhatiary', 'Karnaphuli EPZ', 'Mirsarai', 'Sandwip'
        ],
        'Khulna Division': [
            'Khulna', 'Jessore', 'Satkhira', 'Mongla', 'Bagerhat', 'Narail', 'Magura', 
            'Jhenaidah', 'Chuadanga', 'Meherpur', 'Kushtia', 'Shatkhira', 'Dumuria',
            'Phultala', 'Daulatpur', 'Khalishpur', 'Rupsha', 'Batiaghata', 'Rupsa'
        ],
        'Rajshahi Division': [
            'Rajshahi', 'Bogra', 'Pabna', 'Sirajganj', 'Natore', 'Joypurhat', 'Naogaon',
            'Chapainawabganj', 'Puthia', 'Bagmara', 'Godagari', 'Tanore', 'Mohanpur',
            'Shah Makhdum', 'Boalia', 'Kazla', 'Matshagor', 'Sherpur', 'Dhunat'
        ],
        'Sylhet Division': [
            'Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj', 'Beanibazar', 'Barlekha',
            'Jaintiapur', 'Gowainghat', 'Bishwanath', 'Zakiganj', 'Kanaighat', 'Companyganj',
            'Balaganj', 'Fenchuganj', 'Barachhara', 'Dakshin Surma', 'Jalalabad', 'Shahjalal'
        ],
        'Barisal Division': [
            'Barisal', 'Bhola', 'Patuakhali', 'Pirojpur', 'Jhalokati', 'Barguna', 
            'Bakerganj', 'Banaripara', 'Gaurnadi', 'Hizla', 'Mehendiganj', 'Muladi',
            'Wazirpur', 'Babuganj', 'Kathalia', 'Nalchity', 'Rangabali', 'Taltoli'
        ],
        'Rangpur Division': [
            'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari',
            'Panchagarh', 'Thakurgaon', 'Badarganj', 'Mithapukur', 'Gangachara', 'Taragonj',
            'Pirgachha', 'Kaunia', 'Rajapur', 'Hatibandha', 'Patgram', 'Boda'
        ],
        'Mymensingh Division': [
            'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur', 'Kishoreganj', 'Tangail',
            'Muktagachha', 'Trishal', 'Gaffargaon', 'Bhaluka', 'Sripur', 'Pakundia',
            'Kotwali', 'Melandaha', 'Islampur', 'Dewanganj', 'Madhupur', 'Dhanbari'
        ]
    };
    
    // New state for division-based search
    const divisions = [
        { name: 'Dhaka Division', query: 'Dhaka Division Bangladesh' },
        { name: 'Chittagong Division', query: 'Chittagong Division Bangladesh' },
        { name: 'Khulna Division', query: 'Khulna Division Bangladesh' },
        { name: 'Rajshahi Division', query: 'Rajshahi Division Bangladesh' },
        { name: 'Sylhet Division', query: 'Sylhet Division Bangladesh' },
        { name: 'Barisal Division', query: 'Barisal Division Bangladesh' },
        { name: 'Rangpur Division', query: 'Rangpur Division Bangladesh' },
        { name: 'Mymensingh Division', query: 'Mymensingh Division Bangladesh' },
    ];
    const [selectedDivision, setSelectedDivision] = useState("");
    const [divisionLoading, setDivisionLoading] = useState(false);
    const [divisionError, setDivisionError] = useState("");
    const [hasPhoneFilter, setHasPhoneFilter] = useState(false);
    const [sortBy, setSortBy] = useState("name"); // "name" or "area"
    
    // Legacy location search state
    const [locationSearch, setLocationSearch] = useState("");
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [searchLocation, setSearchLocation] = useState(null);
    const [showMap, setShowMap] = useState(false);
    
    // Combine MongoDB and API shops
    const [mongoShops, setMongoShops] = useState([]);
    const [apiShops, setApiShops] = useState([]);
    const [dataSource, setDataSource] = useState("mongodb"); // "mongodb", "api", or "both"

    useEffect(() => {
        fetchMongoShops();
        // Initialize all areas from all divisions
        const allDivisionAreas = Object.values(divisionAreas).flat();
        const uniqueAllAreas = [...new Set(allDivisionAreas)].sort();
        setAllAreas(uniqueAllAreas);
        setAreas(uniqueAllAreas); // Initially show all areas
    }, []);

    useEffect(() => {
        filterShops();
        // Update available areas based on selected division and available shops
        const allAvailableShops = [...mongoShops, ...apiShops];
        
        if (selectedDivision) {
            const divisionName = divisions.find(d => d.query === selectedDivision)?.name;
            if (divisionName) {
                // Get areas from shops in the selected division
                const shopAreas = allAvailableShops
                    .filter(shop => {
                        // Check if shop area belongs to current division
                        const divisionAreaList = divisionAreas[divisionName] || [];
                        return divisionAreaList.includes(shop.area);
                    })
                    .map(shop => shop.area)
                    .filter(area => area && area !== 'Unknown Area');
                
                // Combine with predefined division areas and remove duplicates
                const currentDivisionAreas = divisionAreas[divisionName] || [];
                const combinedAreas = [...new Set([...currentDivisionAreas, ...shopAreas])].sort();
                setAreas(combinedAreas);
            }
        } else {
            // Show all areas that have at least one shop
            const shopAreas = allAvailableShops
                .map(shop => shop.area)
                .filter(area => area && area !== 'Unknown Area');
            
            // Combine with all predefined areas but only keep those that have shops
            const allDivisionAreas = Object.values(divisionAreas).flat();
            const areasWithShops = [...new Set([...allDivisionAreas, ...shopAreas])]
                .filter(area => shopAreas.includes(area))
                .sort();
            
            setAreas(areasWithShops);
        }
    }, [mongoShops, apiShops, selectedArea, searchTerm, dataSource, hasPhoneFilter, sortBy, selectedDivision]);

    const fetchMongoShops = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/shops");
            const data = await response.json();
            
            if (data.success) {
                setMongoShops(data.data);
                
                // Extract unique areas
                const uniqueAreas = [...new Set(data.data.map(shop => shop.area))];
                setAreas(uniqueAreas.sort());
            }
        } catch (error) {
            console.error("Error fetching MongoDB shops:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDivisionSearch = async (divisionQuery) => {
        if (!divisionQuery) return;
        
        setDivisionLoading(true);
        setDivisionError("");
        setApiShops([]);
        setSelectedDivision(divisionQuery);
        setSelectedArea(""); // Reset area filter when division changes

        try {
            const coordinates = await geocodeLocation(divisionQuery);
            const shops = await findNearbyShops(coordinates.lat, coordinates.lon);
            
            setApiShops(shops);
            setSearchLocation({
                name: divisionQuery,
                coordinates,
                displayName: coordinates.display_name
            });
            setDataSource("both"); // Show both MongoDB and API results
            
            // Add new areas from API results to the current division's areas
            const divisionName = divisions.find(d => d.query === divisionQuery)?.name;
            if (divisionName) {
                const allAvailableShops = [...mongoShops, ...shops];
                
                // Get areas from shops in selected division
                const shopAreasInDivision = allAvailableShops
                    .filter(shop => {
                        const divisionAreaList = divisionAreas[divisionName] || [];
                        return divisionAreaList.includes(shop.area);
                    })
                    .map(shop => shop.area)
                    .filter(area => area && area !== 'Unknown Area');
                
                // Combine with predefined division areas but only keep those that have shops
                const currentDivisionAreas = divisionAreas[divisionName] || [];
                const areasWithShops = [...new Set([...currentDivisionAreas, ...shopAreasInDivision])]
                    .filter(area => shopAreasInDivision.includes(area))
                    .sort();
                
                setAreas(areasWithShops);
            }
            
        } catch (error) {
            console.error("Division search error:", error);
            if (error.message.includes('Location not found')) {
                setDivisionError("Division not found. Please try again.");
            } else {
                setDivisionError("Failed to search for shops in this division. Please try again.");
            }
        } finally {
            setDivisionLoading(false);
        }
    };

    const handleLocationSearch = async () => {
        if (!locationSearch.trim()) {
            setLocationError("Please enter a location");
            return;
        }

        setLocationLoading(true);
        setLocationError("");
        setApiShops([]);

        try {
            const result = await searchShopsByLocation(locationSearch);
            
            setApiShops(result.shops);
            setSearchLocation(result.searchLocation);
            setDataSource("both"); // Show both MongoDB and API results
            setShowMap(true);
            
            // Add new areas from API results
            const newAreas = [...new Set(result.shops.map(shop => shop.area))];
            setAreas(prev => [...new Set([...prev, ...newAreas])].sort());
            
        } catch (error) {
            console.error("Location search error:", error);
            if (error.message.includes('Location not found')) {
                setLocationError("Location not found. Please try a different location name.");
            } else if (error.message.includes('No shops found')) {
                setLocationError("No computer shops found in this area. Try a different location or expand the search radius.");
            } else {
                setLocationError("Failed to search for shops. Please try again.");
            }
        } finally {
            setLocationLoading(false);
        }
    };

    const filterShops = () => {
        let filtered = [];
        
        // Combine shops based on data source
        if (dataSource === "mongodb") {
            filtered = mongoShops;
        } else if (dataSource === "api") {
            filtered = apiShops;
        } else {
            filtered = [...mongoShops, ...apiShops];
        }

        if (selectedArea) {
            filtered = filtered.filter(shop => 
                shop.area.toLowerCase() === selectedArea.toLowerCase()
            );
        }

        if (searchTerm) {
            filtered = filtered.filter(shop =>
                shop.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by phone availability
        if (hasPhoneFilter) {
            filtered = filtered.filter(shop => 
                shop.phone && shop.phone !== 'Phone not available' && shop.phone !== ''
            );
        }

        // Sort results
        if (sortBy === "name") {
            filtered.sort((a, b) => a.shopName.localeCompare(b.shopName));
        } else if (sortBy === "area") {
            filtered.sort((a, b) => a.area.localeCompare(b.area));
        }

        setFilteredShops(filtered);
    };

    const handleAreaFilter = (area) => {
        setSelectedArea(area);
    };

    const clearFilters = () => {
        setSelectedArea("");
        setSearchTerm("");
        setLocationSearch("");
        setSearchLocation(null);
        setApiShops([]);
        setDataSource("mongodb");
        setShowMap(false);
        setLocationError("");
        setSelectedDivision("");
        setDivisionError("");
        setHasPhoneFilter(false);
        setSortBy("name");
        
        // Reset areas to show only areas with shops
        const mongoShopAreas = mongoShops
            .map(shop => shop.area)
            .filter(area => area && area !== 'Unknown Area');
        const allDivisionAreas = Object.values(divisionAreas).flat();
        const areasWithShops = [...new Set([...allDivisionAreas, ...mongoShopAreas])]
            .filter(area => mongoShopAreas.includes(area))
            .sort();
        setAreas(areasWithShops);
    };

    const generateMapLink = (shop) => {
        if (shop.lat && shop.lon) {
            return `https://www.google.com/maps?q=${shop.lat},${shop.lon}`;
        }
        return shop.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`;
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", color: "#0f172a" }}>
                <Navbar />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
                    <div style={{
                        width: "48px",
                        height: "48px",
                        border: "4px solid #e2e8f0",
                        borderTop: "4px solid #2563eb",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }}></div>
                </div>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", color: "#0f172a" }}>
            <Navbar />
            
            <div style={{ maxWidth: "1152px", margin: "0 auto", padding: "0 16px 32px" }}>
                {/* Header */}
                <div style={{ textAlign: "center", marginBottom: "32px" }}>
                    <h1 style={{ fontSize: "36px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>
                        Shop Finder
                    </h1>
                    <p style={{ color: "#64748b", maxWidth: "672px", margin: "0 auto", lineHeight: "1.6" }}>
                        Find the best computer shops in your area. Search by location or browse verified stores with contact details and directions.
                    </p>
                </div>

                {/* Filters */}
                <div style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "24px",
                    marginBottom: "32px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                }}>
                    <h2 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                        <Search size={20} />
                        Search & Filter
                    </h2>
                    
                    {/* Division Dropdown - Primary Filter */}
                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "8px" }}>
                            Select Division (Primary Search)
                        </label>
                        <select
                            value={selectedDivision}
                            onChange={(e) => {
                                const division = divisions.find(d => d.name === e.target.value);
                                if (division) {
                                    handleDivisionSearch(division.query);
                                }
                            }}
                            disabled={divisionLoading}
                            style={{
                                width: "100%",
                                padding: "10px 12px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                outline: "none",
                                backgroundColor: "#ffffff",
                                cursor: divisionLoading ? "not-allowed" : "pointer"
                            }}
                        >
                            <option value="">Choose a division...</option>
                            {divisions.map((division) => (
                                <option key={division.name} value={division.name}>
                                    {division.name}
                                </option>
                            ))}
                        </select>
                        {divisionLoading && (
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px", color: "#2563eb" }}>
                                <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />
                                <span style={{ fontSize: "14px" }}>Searching division...</span>
                            </div>
                        )}
                    </div>
                    
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "16px",
                        marginBottom: "16px"
                    }}>
                        {/* Shop Search */}
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "8px" }}>
                                Search by shop name or address
                            </label>
                            <input
                                type="text"
                                placeholder="Search shops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    outline: "none",
                                    transition: "border-color 0.2s"
                                }}
                                onFocus={(e) => e.target.style.borderColor = "#2563eb"}
                                onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
                            />
                        </div>
                        
                        {/* Area Filter */}
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "8px" }}>
                                Filter by area
                            </label>
                            <select
                                value={selectedArea}
                                onChange={(e) => handleAreaFilter(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    outline: "none",
                                    backgroundColor: "#ffffff",
                                    cursor: "pointer"
                                }}
                            >
                                <option value="">All areas</option>
                                {areas.map((area) => (
                                    <option key={area} value={area}>
                                        {area}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Sort Options */}
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "8px" }}>
                                Sort by
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={{
                                    width: "100%",
                                    padding: "10px 12px",
                                    border: "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "14px",
                                    outline: "none",
                                    backgroundColor: "#ffffff",
                                    cursor: "pointer"
                                }}
                            >
                                <option value="name">Name A-Z</option>
                                <option value="area">Area</option>
                            </select>
                        </div>
                        
                        {/* Phone Filter */}
                        <div>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "8px" }}>
                                <input
                                    type="checkbox"
                                    checked={hasPhoneFilter}
                                    onChange={(e) => setHasPhoneFilter(e.target.checked)}
                                    style={{ cursor: "pointer" }}
                                />
                                Only show shops with phone numbers
                            </label>
                        </div>
                    </div>

                                        
                    {/* Clear Filters */}
                    <div style={{ display: "flex", alignItems: "flex-end" }}>
                        <button
                            onClick={clearFilters}
                            style={{
                                width: "100%",
                                padding: "10px 16px",
                                border: "1px solid #d1d5db",
                                borderRadius: "6px",
                                fontSize: "14px",
                                fontWeight: "500",
                                backgroundColor: "#ffffff",
                                color: "#374151",
                                cursor: "pointer",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = "#f9fafb"}
                            onMouseOut={(e) => e.target.style.backgroundColor = "#ffffff"}
                        >
                            Clear All Filters
                        </button>
                    </div>

                    {/* Division Error */}
                    {divisionError && (
                        <div style={{
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <AlertCircle size={16} style={{ color: "#dc2626" }} />
                            <span style={{ color: "#dc2626", fontSize: "14px" }}>
                                {divisionError}
                            </span>
                        </div>
                    )}

                    {/* Location Error */}
                    {locationError && (
                        <div style={{
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "16px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px"
                        }}>
                            <AlertCircle size={16} style={{ color: "#dc2626" }} />
                            <span style={{ color: "#dc2626", fontSize: "14px" }}>
                                {locationError}
                            </span>
                        </div>
                    )}

                    {/* Search Location Info */}
                    {searchLocation && (
                        <div style={{
                            backgroundColor: "#eff6ff",
                            border: "1px solid #bfdbfe",
                            borderRadius: "8px",
                            padding: "12px",
                            marginBottom: "16px"
                        }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                                <MapPin size={16} style={{ color: "#2563eb" }} />
                                <span style={{ fontWeight: "500", color: "#1e40af" }}>
                                    Searching near: {searchLocation.displayName}
                                </span>
                            </div>
                            <div style={{ fontSize: "12px", color: "#64748b" }}>
                                Found {apiShops.length} shops in this area
                            </div>
                        </div>
                    )}

                    {/* Data Source Toggle */}
                    {(apiShops.length > 0 || mongoShops.length > 0) && (
                        <div style={{
                            display: "flex",
                            gap: "8px",
                            flexWrap: "wrap"
                        }}>
                            <button
                                onClick={() => setDataSource("mongodb")}
                                style={{
                                    padding: "6px 12px",
                                    border: dataSource === "mongodb" ? "1px solid #2563eb" : "1px solid #d1d5db",
                                    borderRadius: "6px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: dataSource === "mongodb" ? "#eff6ff" : "#ffffff",
                                    color: dataSource === "mongodb" ? "#1e40af" : "#374151",
                                    cursor: "pointer"
                                }}
                            >
                                Verified Shops ({mongoShops.length})
                            </button>
                            {apiShops.length > 0 && (
                                <button
                                    onClick={() => setDataSource("api")}
                                    style={{
                                        padding: "6px 12px",
                                        border: dataSource === "api" ? "1px solid #2563eb" : "1px solid #d1d5db",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        backgroundColor: dataSource === "api" ? "#eff6ff" : "#ffffff",
                                        color: dataSource === "api" ? "#1e40af" : "#374151",
                                        cursor: "pointer"
                                    }}
                                >
                                    Area Shops ({apiShops.length})
                                </button>
                            )}
                            {apiShops.length > 0 && mongoShops.length > 0 && (
                                <button
                                    onClick={() => setDataSource("both")}
                                    style={{
                                        padding: "6px 12px",
                                        border: dataSource === "both" ? "1px solid #2563eb" : "1px solid #d1d5db",
                                        borderRadius: "6px",
                                        fontSize: "12px",
                                        fontWeight: "500",
                                        backgroundColor: dataSource === "both" ? "#eff6ff" : "#ffffff",
                                        color: dataSource === "both" ? "#1e40af" : "#374151",
                                        cursor: "pointer"
                                    }}
                                >
                                    All Shops ({mongoShops.length + apiShops.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Results */}
                <div style={{ marginBottom: "16px" }}>
                    <p style={{ color: "#64748b", fontSize: "16px", fontWeight: "500" }}>
                        {selectedDivision ? 
                            `Found ${filteredShops.length} computer shops in ${selectedDivision.replace(' Division', '')}` : 
                            `${filteredShops.length} ${filteredShops.length === 1 ? "shop" : "shops"} found`
                        }
                        {dataSource !== "mongodb" && (
                            <span style={{ marginLeft: "8px", fontSize: "12px", color: "#94a3b8" }}>
                                ({dataSource === "api" ? "Area search" : dataSource === "both" ? "Combined" : "Verified"} results)
                            </span>
                        )}
                    </p>
                </div>

                {/* Shop Cards - Separated by source */}
                {filteredShops.length === 0 ? (
                    <div style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "48px 24px",
                        textAlign: "center",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                    }}>
                        <Store size={48} style={{ color: "#94a3b8", margin: "0 auto 16px" }} />
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                            No shops found
                        </h3>
                        <p style={{ color: "#64748b" }}>
                            Try selecting a division or adjusting your filters
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Verified Shops Section */}
                        {dataSource === "both" && mongoShops.length > 0 && (
                            <div style={{ marginBottom: "32px" }}>
                                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <CheckCircle size={20} style={{ color: "#059669" }} />
                                    Verified Shops ({mongoShops.filter(shop => 
                                        filteredShops.some(f => f._id === shop._id)
                                    ).length})
                                </h3>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                    gap: "24px"
                                }}>
                                    {mongoShops
                                        .filter(shop => filteredShops.some(f => f._id === shop._id))
                                        .map((shop) => (
                                            <ShopCard key={shop._id} shop={shop} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Area Shops Section */}
                        {dataSource === "both" && apiShops.length > 0 && (
                            <div style={{ marginBottom: "32px" }}>
                                <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#0f172a", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <MapPin size={20} style={{ color: "#2563eb" }} />
                                    Area Shops ({apiShops.filter(shop => 
                                        filteredShops.some(f => f._id === shop._id)
                                    ).length})
                                </h3>
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                    gap: "24px"
                                }}>
                                    {apiShops
                                        .filter(shop => filteredShops.some(f => f._id === shop._id))
                                        .map((shop) => (
                                            <ShopCard key={shop._id} shop={shop} />
                                        ))}
                                </div>
                            </div>
                        )}

                        {/* Single source display */}
                        {dataSource !== "both" && (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                                gap: "24px"
                            }}>
                                {filteredShops.map((shop) => (
                                    <ShopCard key={shop._id} shop={shop} />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Map View Toggle */}
                {apiShops.length > 0 && (
                    <div style={{ marginTop: "32px", textAlign: "center" }}>
                        <button
                            onClick={() => setShowMap(!showMap)}
                            style={{
                                padding: "12px 24px",
                                border: "1px solid #2563eb",
                                borderRadius: "8px",
                                fontSize: "16px",
                                fontWeight: "500",
                                backgroundColor: "#2563eb",
                                color: "#ffffff",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "8px"
                            }}
                        >
                            <Map size={20} />
                            {showMap ? "Hide Map" : "Show Map"}
                        </button>
                    </div>
                )}

                {/* Map View */}
                {showMap && apiShops.length > 0 && (
                    <div style={{
                        marginTop: "32px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "24px",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
                    }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Map size={20} />
                            Shop Locations Map
                        </h3>
                        {/* Inline Map Component */}
                        <div style={{
                            height: "400px",
                            backgroundColor: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            borderRadius: "8px",
                            position: "relative",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: `linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                            }}>
                                <div style={{ textAlign: "center", color: "#0c4a6e" }}>
                                    <MapPin size={64} style={{ margin: "0 auto 16px", opacity: 0.6 }} />
                                    <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px" }}>
                                        Interactive Map View
                                    </h3>
                                    <p style={{ fontSize: "14px", marginBottom: "16px" }}>
                                        {apiShops.length} shops found in {searchLocation?.name || "search area"}
                                    </p>
                                    
                                    <div style={{
                                        display: "grid",
                                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                                        gap: "12px",
                                        maxWidth: "600px",
                                        margin: "0 auto"
                                    }}>
                                        {apiShops.slice(0, 6).map((shop, index) => (
                                            <div
                                                key={shop._id}
                                                style={{
                                                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                    padding: "12px",
                                                    borderRadius: "8px",
                                                    border: "1px solid rgba(59, 130, 246, 0.2)"
                                                }}
                                            >
                                                <div style={{ fontWeight: "500", fontSize: "14px", marginBottom: "4px" }}>
                                                    {shop.shopName}
                                                </div>
                                                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                                                    {shop.area}
                                                </div>
                                                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                                                    {shop.categories?.join(", ") || "Shop"}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {apiShops.length > 6 && (
                                        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
                                            And {apiShops.length - 6} more shops...
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ShopCard = ({ shop }) => {
    const isApiShop = shop.source === 'osm';
    
    return (
        <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "box-shadow 0.2s",
            position: "relative"
        }}
        onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"}
        onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"}
        >
            {/* Data Source Badge */}
            {isApiShop && (
                <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: "500"
                }}>
                    Area Shop
                </div>
            )}
            
            <div style={{ marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "8px" }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#0f172a", marginBottom: "8px" }}>
                            {shop.shopName}
                        </h3>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                            <MapPin size={16} style={{ color: "#64748b" }} />
                            <span style={{ fontSize: "14px", color: "#64748b" }}>
                                {shop.area}
                            </span>
                            {!isApiShop && shop.verified && (
                                <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#059669" }}>
                                    <CheckCircle size={16} />
                                    <span style={{ fontSize: "12px", fontWeight: "500" }}>Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            <div style={{ spaceY: "12px" }}>
                <div style={{ marginBottom: "16px" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                        <MapPin size={16} style={{ color: "#64748b", marginTop: "2px" }} />
                        <span style={{ fontSize: "14px", color: "#64748b", lineHeight: "1.5" }}>
                            {shop.address}
                        </span>
                    </div>
                    
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <Phone size={16} style={{ color: "#64748b" }} />
                        <span style={{ fontSize: "14px", color: "#64748b" }}>
                            {shop.phone}
                        </span>
                    </div>
                </div>

                {shop.categories && shop.categories.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "16px" }}>
                        {shop.categories.map((category, index) => (
                            <span
                                key={index}
                                style={{
                                    display: "inline-block",
                                    padding: "4px 8px",
                                    fontSize: "12px",
                                    fontWeight: "500",
                                    backgroundColor: isApiShop ? "#fef3c7" : "#dbeafe",
                                    color: isApiShop ? "#92400e" : "#1e40af",
                                    borderRadius: "4px"
                                }}
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {/* Opening Hours */}
                {shop.openingHours && (
                    <div style={{ marginBottom: "16px" }}>
                        <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>
                            <strong>Hours:</strong> {shop.openingHours}
                        </div>
                    </div>
                )}

                {/* Website */}
                {shop.website && (
                    <div style={{ marginBottom: "16px" }}>
                        <a
                            href={shop.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                fontSize: "14px",
                                color: "#2563eb",
                                textDecoration: "none"
                            }}
                        >
                            <ExternalLink size={16} />
                            Visit Website
                        </a>
                    </div>
                )}

                <a
                    href={generateMapLink(shop)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "10px 16px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "14px",
                        fontWeight: "500",
                        backgroundColor: "#ffffff",
                        color: "#374151",
                        textDecoration: "none",
                        cursor: "pointer",
                        transition: "background-color 0.2s"
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#f9fafb";
                        e.target.style.textDecoration = "none";
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.textDecoration = "none";
                    }}
                >
                    <ExternalLink size={16} />
                    View on Google Maps
                </a>
            </div>
        </div>
    );
};

const generateMapLink = (shop) => {
    if (shop.lat && shop.lon) {
        return `https://www.google.com/maps?q=${shop.lat},${shop.lon}`;
    }
    return shop.googleMapLink || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shop.address)}`;
};

export default ShopFinder;
