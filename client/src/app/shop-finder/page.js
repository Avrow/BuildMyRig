"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Phone, ExternalLink, CheckCircle, Store } from "lucide-react";
import Navbar from "@/components/Navbar";

const ShopFinder = () => {
    const [shops, setShops] = useState([]);
    const [filteredShops, setFilteredShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedArea, setSelectedArea] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [areas, setAreas] = useState([]);

    useEffect(() => {
        fetchShops();
    }, []);

    useEffect(() => {
        filterShops();
    }, [shops, selectedArea, searchTerm]);

    const fetchShops = async () => {
        try {
            const response = await fetch("http://localhost:8000/api/shops");
            const data = await response.json();
            
            if (data.success) {
                setShops(data.data);
                
                // Extract unique areas
                const uniqueAreas = [...new Set(data.data.map(shop => shop.area))];
                setAreas(uniqueAreas.sort());
            }
        } catch (error) {
            console.error("Error fetching shops:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterShops = () => {
        let filtered = shops;

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

        setFilteredShops(filtered);
    };

    const handleAreaFilter = (area) => {
        setSelectedArea(area);
    };

    const clearFilters = () => {
        setSelectedArea("");
        setSearchTerm("");
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
                        Find the best computer shops in your area. Browse verified stores with contact details and directions.
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
                    
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                        gap: "16px"
                    }}>
                        <div>
                            <label style={{ display: "block", fontSize: "14px", fontWeight: "500", color: "#475569", marginBottom: "8px" }}>
                                Search by name or address
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
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results */}
                <div style={{ marginBottom: "16px" }}>
                    <p style={{ color: "#64748b" }}>
                        {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"} found
                    </p>
                </div>

                {/* Shop Cards */}
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
                            Try adjusting your filters or search terms
                        </p>
                    </div>
                ) : (
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
            </div>
        </div>
    );
};

const ShopCard = ({ shop }) => {
    return (
        <div style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            transition: "box-shadow 0.2s"
        }}
        onMouseOver={(e) => e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)"}
        onMouseOut={(e) => e.currentTarget.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)"}
        >
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
                            {shop.verified && (
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
                                    backgroundColor: "#dbeafe",
                                    color: "#1e40af",
                                    borderRadius: "4px"
                                }}
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {shop.googleMapLink && (
                    <a
                        href={shop.googleMapLink}
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
                        View on Maps
                    </a>
                )}
            </div>
        </div>
    );
};

export default ShopFinder;
