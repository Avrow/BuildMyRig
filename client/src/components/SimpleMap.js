import { MapPin, ExternalLink } from "lucide-react";

const SimpleMap = ({ shops, searchLocation }) => {
    if (!shops || shops.length === 0) {
        return (
            <div style={{
                height: "400px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b"
            }}>
                <div style={{ textAlign: "center" }}>
                    <MapPin size={48} style={{ margin: "0 auto 16px" }} />
                    <p>No shops to display on map</p>
                </div>
            </div>
        );
    }

    // Generate OpenStreetMap URL with multiple markers
    const generateMapUrl = () => {
        if (shops.length === 0) return "";
        
        // Use the first shop as center, or search location if available
        const centerLat = searchLocation?.coordinates?.lat || shops[0].lat;
        const centerLon = searchLocation?.coordinates?.lon || shops[0].lon;
        
        // Create marker parameters
        const markers = shops.map((shop, index) => {
            if (shop.lat && shop.lon) {
                return `${shop.lat},${shopLon}`;
            }
            return null;
        }).filter(Boolean).join('|');

        return `https://www.openstreetmap.org/?mlat=${centerLat}&mlon=${centerLon}#map=13/${centerLat}/${centerLon}`;
    };

    return (
        <div style={{
            height: "400px",
            backgroundColor: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            position: "relative",
            overflow: "hidden"
        }}>
            {/* Map Background */}
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
                        {shops.length} shops found in {searchLocation?.name || "search area"}
                    </p>
                    
                    {/* Shop List */}
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "12px",
                        maxWidth: "600px",
                        margin: "0 auto"
                    }}>
                        {shops.slice(0, 6).map((shop, index) => (
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
                    
                    {shops.length > 6 && (
                        <p style={{ fontSize: "12px", color: "#64748b", marginTop: "12px" }}>
                            And {shops.length - 6} more shops...
                        </p>
                    )}
                </div>
            </div>

            {/* View on Map Button */}
            <div style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                zIndex: 10
            }}>
                <a
                    href={generateMapUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 16px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151",
                        textDecoration: "none",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                        transition: "all 0.2s"
                    }}
                    onMouseOver={(e) => {
                        e.target.style.backgroundColor = "#f9fafb";
                        e.target.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
                        e.target.style.textDecoration = "none";
                    }}
                    onMouseOut={(e) => {
                        e.target.style.backgroundColor = "#ffffff";
                        e.target.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
                        e.target.style.textDecoration = "none";
                    }}
                >
                    <ExternalLink size={16} />
                    View on OpenStreetMap
                </a>
            </div>
        </div>
    );
};

export default SimpleMap;
