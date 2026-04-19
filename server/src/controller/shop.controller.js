"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Phone, ExternalLink, CheckCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
            const response = await fetch("/api/shops");
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
            <div className="min-h-screen bg-white dark:bg-slate-950">
                <Navbar />
                <div className="flex items-center justify-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
            <Navbar />
            
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Shop Finder
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                        Find the best computer shops in your area. Browse verified stores with contact details and directions.
                    </p>
                </div>

                {/* Filters */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5" />
                            Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Search by name or address
                                </label>
                                <Input
                                    placeholder="Search shops..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Filter by area
                                </label>
                                <Select value={selectedArea} onValueChange={handleAreaFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select area" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">All areas</SelectItem>
                                        {areas.map((area) => (
                                            <SelectItem key={area} value={area}>
                                                {area}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            <div className="flex items-end">
                                <Button 
                                    onClick={clearFilters}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                <div className="mb-4">
                    <p className="text-slate-600 dark:text-slate-400">
                        {filteredShops.length} {filteredShops.length === 1 ? "shop" : "shops"} found
                    </p>
                </div>

                {/* Shop Cards */}
                {filteredShops.length === 0 ? (
                    <Card className="text-center py-12">
                        <CardContent>
                            <Store className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No shops found
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Try adjusting your filters or search terms
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                            {shop.shopName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                            <MapPin className="h-4 w-4 text-slate-500" />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                {shop.area}
                            </span>
                            {shop.verified && (
                                <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span className="text-xs font-medium">Verified</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
                <div className="space-y-2">
                    <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-slate-500 mt-0.5" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {shop.address}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                            {shop.phone}
                        </span>
                    </div>
                </div>

                {shop.categories && shop.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {shop.categories.map((category, index) => (
                            <span
                                key={index}
                                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded"
                            >
                                {category}
                            </span>
                        ))}
                    </div>
                )}

                {shop.googleMapLink && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        asChild
                    >
                        <a
                            href={shop.googleMapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                        >
                            <ExternalLink className="h-4 w-4" />
                            View on Maps
                        </a>
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default ShopFinder;
