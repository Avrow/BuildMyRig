"use client";

import { useState } from "react";
import { Search, Store, MapPin, CheckCircle, XCircle, ChevronLeft, Bell, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const COMPONENT_TYPES = ["CPU", "GPU", "RAM", "Storage", "Motherboard", "PSU", "Case", "Cooler"];

const TYPE_COLORS = {
  CPU: "bg-blue-100 text-blue-700 border-blue-200",
  GPU: "bg-purple-100 text-purple-700 border-purple-200",
  RAM: "bg-green-100 text-green-700 border-green-200",
  Storage: "bg-yellow-100 text-yellow-700 border-yellow-200",
  Motherboard: "bg-red-100 text-red-700 border-red-200",
  PSU: "bg-orange-100 text-orange-700 border-orange-200",
  Case: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Cooler: "bg-sky-100 text-sky-700 border-sky-200",
};

function PriceCard({ entry, alertBaseUrl, componentName }) {
  const alertUrl = alertBaseUrl + "&retailerName=" + encodeURIComponent(entry.retailerName);
  const trendUrl = "/market-trend?component=" + encodeURIComponent(componentName);
  return (
    <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Store className="h-4 w-4 text-blue-500" />
            {entry.retailerName}
          </CardTitle>
          {entry.inStock ? (
            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              In Stock
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">
              <XCircle className="h-3 w-3 mr-1" />
              Out of Stock
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">
          {"৳" + entry.price.toLocaleString()}
        </p>
        {entry.location && (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {entry.location}
          </p>
        )}
        <p className="text-xs text-slate-400">
          {"Updated: " + new Date(entry.updatedAt).toLocaleDateString()}
        </p>
        {!entry.inStock && (
          <a href={alertUrl} className="flex items-center justify-center gap-2 w-full mt-2 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-md py-2 hover:bg-amber-100 transition-colors">
            <Bell className="h-3 w-3" />
            Set Restock Alert
          </a>
        )}
        <a href={trendUrl} className="flex items-center justify-center gap-2 w-full mt-1 text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded-md py-2 hover:bg-purple-100 transition-colors">
          <TrendingUp className="h-3 w-3" />
          View Price Fluctuation
        </a>
      </CardContent>
    </Card>
  );
}

export default function PriceWatcherPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [components, setComponents] = useState([]);
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [alertBaseUrl, setAlertBaseUrl] = useState("");
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (type, query) => {
    const searchType = type !== undefined ? type : selectedType;
    const searchText = query !== undefined ? query : searchQuery;
    setLoading(true);
    setError(null);
    setSearched(true);
    setSelectedComponent(null);
    setPrices([]);
    setComponents([]);
    try {
      let url = API_URL + "/api/components?limit=20";
      if (searchText) url += "&search=" + encodeURIComponent(searchText);
      if (searchType) url += "&type=" + searchType;
      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch components");
      setComponents(data.components || data);
    } catch (err) {
      setError("Could not load components. Make sure the server is running.");
      setComponents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = (type) => {
    const newType = type === selectedType ? "" : type;
    setSelectedType(newType);
    handleSearch(newType, searchQuery);
  };

  const handleComponentClick = async (component) => {
    setSelectedComponent(component);
    setAlertBaseUrl("/inventory-alert?componentName=" + encodeURIComponent(component.name));
    setPriceLoading(true);
    setPrices([]);
    try {
      const res = await fetch(API_URL + "/api/pricewatcher/component/" + component._id);
      const data = await res.json();
      if (!res.ok) throw new Error("No prices found");
      setPrices(Array.isArray(data) ? data : []);
    } catch (err) {
      setPrices([]);
    } finally {
      setPriceLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Price Watcher</h1>
          <p className="mt-1 text-slate-500">Compare PC component prices across local retail shops in real time.</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {COMPONENT_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => handleTypeClick(type)}
              className={"px-4 py-1.5 rounded-full text-sm font-medium border transition-colors " + (selectedType === type ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 bg-white dark:bg-slate-900")}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="flex gap-3 mb-10">
          <Input
            placeholder="Search e.g. RTX 4070, Ryzen 7, Corsair..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          />
          <Button onClick={() => handleSearch()} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {selectedComponent && (
          <div>
            <button
              onClick={() => { setSelectedComponent(null); setPrices([]); }}
              className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to results
            </button>
            <div className="mb-6">
              <Badge className={"mb-2 border " + (TYPE_COLORS[selectedComponent.type] || "bg-slate-100")}>
                {selectedComponent.type}
              </Badge>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedComponent.name}</h2>
              <p className="text-slate-500 text-sm">{selectedComponent.brand}</p>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Prices Across Retailers</h3>
            {priceLoading && <p className="text-slate-500">Loading prices...</p>}
            {!priceLoading && prices.length === 0 && (
              <div className="text-center py-10 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                No retailer price data found for this component yet.
              </div>
            )}
            {!priceLoading && prices.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {prices.map((entry) => (
                  <PriceCard key={entry._id} entry={entry} alertBaseUrl={alertBaseUrl} componentName={selectedComponent.name} />
                ))}
              </div>
            )}
          </div>
        )}

        {!selectedComponent && (
          <>
            {loading && <div className="text-center py-20 text-slate-400">Searching components...</div>}
            {error && <div className="text-center py-20 text-red-500">{error}</div>}
            {!loading && searched && components.length === 0 && !error && (
              <div className="text-center py-20 text-slate-400">No components found. Try a different search!</div>
            )}
            {!loading && !searched && (
              <div className="text-center py-20 text-slate-300 dark:text-slate-600">
                Search for a component above or click a category button to browse
              </div>
            )}
            {!loading && components.length > 0 && (
              <>
                <p className="text-xs text-slate-400 mb-6 uppercase tracking-widest">
                  {components.length + " result" + (components.length !== 1 ? "s" : "") + " — click any component to see retailer prices"}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {components.map((component) => (
                    <Card
                      key={component._id}
                      onClick={() => handleComponentClick(component)}
                      className="border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge className={"text-xs border " + (TYPE_COLORS[component.type] || "bg-slate-100")}>
                            {component.type}
                          </Badge>
                          {component.price && (
                            <span className="text-sm font-bold text-slate-900 dark:text-white">
                              {"৳" + component.price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <CardTitle className="text-sm text-slate-900 dark:text-white mt-2 leading-snug">
                          {component.name}
                        </CardTitle>
                        <p className="text-xs text-slate-500">{component.brand}</p>
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
