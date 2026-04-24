"use client";

import { useState, useEffect } from "react";
import { Search, Store, MapPin, CheckCircle, XCircle, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COMPONENT_TYPES = [
  "CPU", "GPU", "RAM", "Storage",
  "Motherboard", "PSU", "Case", "Cooler"
];

const TYPE_COLORS = {
  CPU: "bg-blue-600/20 text-blue-400 border-blue-600/40",
  GPU: "bg-purple-600/20 text-purple-400 border-purple-600/40",
  RAM: "bg-green-600/20 text-green-400 border-green-600/40",
  Storage: "bg-yellow-600/20 text-yellow-400 border-yellow-600/40",
  Motherboard: "bg-red-600/20 text-red-400 border-red-600/40",
  PSU: "bg-orange-600/20 text-orange-400 border-orange-600/40",
  Case: "bg-cyan-600/20 text-cyan-400 border-cyan-600/40",
  Cooler: "bg-sky-600/20 text-sky-400 border-sky-600/40",
};

export default function PriceWatcherPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  // Search components by name or type
  const handleSearch = async (type = selectedType, query = searchQuery) => {
    setLoading(true);
    setError(null);
    setSearched(true);
    setSelectedComponent(null);
    setPrices([]);

    try {
      const params = new URLSearchParams();
      if (query) params.set("search", query);
      if (type) params.set("type", type);
      params.set("limit", "20");

      const res = await fetch(`${API_URL}/api/components?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch components");
      setComponents(data.components || data);
    } catch (err) {
      setError(err.message);
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  // When a type button is clicked
  const handleTypeClick = (type) => {
    const newType = type === selectedType ? "" : type;
    setSelectedType(newType);
    handleSearch(newType, searchQuery);
  };

  // When a component card is clicked, fetch its prices
  const handleComponentClick = async (component) => {
    setSelectedComponent(component);
    setPriceLoading(true);
    setPrices([]);
    try {
      const res = await fetch(
        `${API_URL}/api/pricewatcher/component/${component._id}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "No prices found");
      setPrices(data);
    } catch (err) {
      setPrices([]);
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* ── Hero ── */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-600/20 text-blue-400 border-blue-600/40">
            Price Watcher
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            Track Component Prices
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Compare prices for PC components across local retail shops in real time.
          </p>
        </div>

        {/* ── Type Filter Buttons ── */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {COMPONENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedType === type
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-700 text-gray-400 hover:border-blue-500 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* ── Search Bar ── */}
        <div className="flex gap-3 max-w-2xl mx-auto mb-12">
          <Input
            placeholder="Search by component name (e.g. RTX 4070, i9...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
          />
          <Button
            onClick={() => handleSearch()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* ── Price View (after clicking a component) ── */}
        {selectedComponent && (
          <div className="mb-10">
            <button
              onClick={() => { setSelectedComponent(null); setPrices([]); }}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to results
            </button>

            <div className="mb-6">
              <Badge className={`mb-2 ${TYPE_COLORS[selectedComponent.type] || "bg-gray-700"}`}>
                {selectedComponent.type}
              </Badge>
              <h2 className="text-2xl font-bold text-white">{selectedComponent.name}</h2>
              <p className="text-gray-400 text-sm">{selectedComponent.brand}</p>
            </div>

            <h3 className="text-lg font-semibold text-white mb-4">
              Prices Across Retailers
            </h3>

            {priceLoading && (
              <p className="text-gray-400">Loading prices...</p>
            )}

            {!priceLoading && prices.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No price data available for this component yet.
              </div>
            )}

            {!priceLoading && prices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {prices.map((entry) => (
                  <Card
                    key={entry._id}
                    className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-white flex items-center gap-2">
                          <Store className="h-4 w-4 text-blue-400" />
                          {entry.retailerName}
                        </CardTitle>
                        {entry.inStock ? (
                          <Badge className="bg-green-600/20 text-green-400 border-green-600/40 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            In Stock
                          </Badge>
                        ) : (
                          <Badge className="bg-red-600/20 text-red-400 border-red-600/40 text-xs">
                            <XCircle className="h-3 w-3 mr-1" />
                            Out of Stock
                          </Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-2xl font-bold text-white">
                        ৳{entry.price.toLocaleString()}
                      </p>
                      {entry.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {entry.location}
                        </p>
                      )}
                      <p className="text-xs text-gray-600">
                        Updated: {new Date(entry.updatedAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Component Search Results ── */}
        {!selectedComponent && (
          <>
            {loading && (
              <div className="text-center py-20 text-gray-400">
                Searching components...
              </div>
            )}

            {error && (
              <div className="text-center py-20 text-red-400">{error}</div>
            )}

            {!loading && searched && components.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                No components found. Try a different search!
              </div>
            )}

            {!loading && components.length > 0 && (
              <>
                <p className="text-xs text-gray-600 mb-6 uppercase tracking-widest">
                  {components.length} result{components.length !== 1 ? "s" : ""} — click a component to see prices
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {components.map((component) => (
                    <Card
                      key={component._id}
                      onClick={() => handleComponentClick(component)}
                      className="bg-gray-900 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-blue-950/40"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge className={`text-xs ${TYPE_COLORS[component.type] || "bg-gray-700"}`}>
                            {component.type}
                          </Badge>
                          {component.price && (
                            <span className="text-sm font-bold text-white">
                              ৳{component.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-sm text-white mt-2">
                          {component.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500">{component.brand}</p>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </>
        )}

      </main>
    </div>
  );
}