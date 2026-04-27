"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, TrendingUp, TrendingDown, DollarSign, BarChart3, Cpu, Gpu, MemoryStick, HardDrive, CircuitBoard, Battery, Fan, Box } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Component types with icons
const COMPONENT_TYPES = [
  { name: "CPU", icon: Cpu, color: "bg-blue-100 text-blue-700" },
  { name: "GPU", icon: Gpu, color: "bg-purple-100 text-purple-700" },
  { name: "RAM", icon: MemoryStick, color: "bg-green-100 text-green-700" },
  { name: "Storage", icon: HardDrive, color: "bg-yellow-100 text-yellow-700" },
  { name: "Motherboard", icon: CircuitBoard, color: "bg-red-100 text-red-700" },
  { name: "PSU", icon: Battery, color: "bg-orange-100 text-orange-700" },
  { name: "Cooler", icon: Fan, color: "bg-cyan-100 text-cyan-700" },
  { name: "Case", icon: Box, color: "bg-slate-100 text-slate-700" }
];

function MarketTrendContent() {
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("component") || "");
  const [selectedComponentType, setSelectedComponentType] = useState(null);
  const [components, setComponents] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch components by type
  const fetchComponentsByType = async (type) => {
    setLoading(true);
    setSelectedComponentType(type);
    setTrendData(null);
    setComponents([]);
    try {
      const res = await fetch(`${API_URL}/api/components?type=${type}&limit=20`);
      const data = await res.json();
      const componentList = data.components || data;
      setComponents(componentList);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrend = async (componentName) => {
    setLoading(true);
    setError(null);
    setTrendData(null);
    try {
      const res = await fetch(`${API_URL}/api/markettrend/trend/${encodeURIComponent(componentName)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch trend");
      setTrendData(data);
      setComponents([]);
      setSelectedComponentType(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const component = searchParams.get("component");
    if (component) {
      fetchTrend(component);
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    fetchTrend(searchQuery.trim());
  };

  const formatBDT = (value) => "৳" + value.toLocaleString();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-md">
          <p className="text-slate-400 text-xs mb-1">{label}</p>
          <p className="text-slate-900 font-bold">{formatBDT(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Market Trend Analysis</h1>
          <p className="mt-1 text-slate-500">Track 30-day price history and market trends for PC components</p>
        </div>

        {/* Component Type Buttons */}
        <div className="flex flex-wrap gap-3 mb-8">
          {COMPONENT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.name}
                onClick={() => fetchComponentsByType(type.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedComponentType === type.name
                    ? `${type.color} border-2 border-current`
                    : "bg-white border border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                {type.name}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="flex gap-3 mb-8">
          <Input
            placeholder="Or search specific component (e.g., Intel Core i9-13900K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            className="bg-white border-slate-200"
          />
          <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-6">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Components List (when type selected) */}
        {selectedComponentType && components.length > 0 && !trendData && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              {selectedComponentType} Components ({components.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {components.map((comp) => (
                <button
                  key={comp._id}
                  onClick={() => fetchTrend(comp.name)}
                  className="text-left px-4 py-3 bg-white border border-slate-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <p className="text-slate-900 font-medium text-sm">{comp.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{comp.brand}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {loading && <div className="text-center py-20 text-slate-400">Loading market data...</div>}
        {error && <div className="text-center py-20 text-red-500">{error}</div>}

        {/* Trend Display */}
        {trendData && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{trendData.componentName}</h2>
                <p className="text-slate-500 text-sm">
                  Exchange Rate: 1 USD = ৳{trendData.exchangeRate.toFixed(2)}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-lg px-4 py-2">
                {formatBDT(trendData.currentPrice)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs text-slate-500 font-medium">Current Price</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xl font-bold text-slate-900">{formatBDT(trendData.currentPrice)}</p>
                  <p className="text-xs text-slate-400">${trendData.currentPriceUSD}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs text-slate-500 font-medium">Highest (30d)</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xl font-bold text-green-600">{formatBDT(trendData.highest)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs text-slate-500 font-medium">Lowest (30d)</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <p className="text-xl font-bold text-red-600">{formatBDT(trendData.lowest)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-1 pt-4 px-4">
                  <CardTitle className="text-xs text-slate-500 font-medium">Monthly Change</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <div className="flex items-center gap-1">
                    {trendData.percentChange >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <p className={`text-xl font-bold ${trendData.percentChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {trendData.percentChange >= 0 ? "+" : ""}{trendData.percentChange}%
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart - Shows 30 days */}
            <Card>
              <CardHeader>
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Price History (Last 30 Days) - {trendData.history.length} days
                </CardTitle>
              </CardHeader>
              <CardContent>
                {trendData.history.length === 0 ? (
                  <p className="text-slate-400 text-center py-10">No historical data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={trendData.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="date"
                        stroke="#94a3b8"
                        tick={{ fontSize: 10 }}
                        interval={4}
                        tickFormatter={(date) => {
                          const d = new Date(date);
                          return `${d.getMonth()+1}/${d.getDate()}`;
                        }}
                      />
                      <YAxis
                        stroke="#94a3b8"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(v) => "৳" + (v / 1000).toFixed(0) + "k"}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="priceBDT" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <DollarSign className="h-5 w-5 text-blue-500" />
                <p className="text-slate-500 text-sm">
                  30-day average price:{" "}
                  <span className="text-slate-900 font-bold">{formatBDT(trendData.average)}</span>
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!trendData && !loading && !selectedComponentType && !error && (
          <div className="text-center py-20">
            <BarChart3 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">Click a component type above or search for a specific component</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function MarketTrendPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <MarketTrendContent />
    </Suspense>
  );
}
