"use client";

import { useState } from "react";
import { Search, Store, MapPin, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1497";

const COMPONENT_TYPES = [
  "CPU", "GPU", "RAM", "Storage", 
  "Motherboard", "PSU", "Case", "Cooler"
];

export default function PriceWatcherPage() {
  const [selectedType, setSelectedType] = useState("");
  const [componentId, setComponentId] = useState("");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!componentId.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    try {
      const res = await fetch(
        `${API_URL}/api/pricewatcher/component/${componentId}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch prices");
      setPrices(data);
    } catch (err) {
      setError(err.message);
      setPrices([]);
    } finally {
      setLoading(false);
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

        {/* ── Filter by type ── */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {COMPONENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type === selectedType ? "" : type)}
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

        {/* ── Search bar ── */}
        <div className="flex gap-3 max-w-2xl mx-auto mb-12">
          <Input
            placeholder="Enter Component ID to search prices..."
            value={componentId}
            onChange={(e) => setComponentId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-blue-500"
          />
          <Button
            onClick={handleSearch}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* ── Loading ── */}
        {loading && (
          <div className="text-center py-20 text-gray-400">
            Loading prices...
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="text-center py-20 text-red-400">
            {error}
          </div>
        )}

        {/* ── Results ── */}
        {!loading && !error && searched && prices.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            No prices found for this component.
          </div>
        )}

        {!loading && prices.length > 0 && (
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

      </main>
    </div>
  );
}