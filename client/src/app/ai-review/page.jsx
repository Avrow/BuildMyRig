"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, Brain, CheckCircle, AlertCircle, TrendingUp, Zap, Cpu, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function AIReviewPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const searchRef = useRef(null);

  // Search products as user types (case insensitive - like inventory alert)
  useEffect(() => {
    const searchProducts = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      try {
        const res = await fetch(`${API_URL}/api/components?search=${encodeURIComponent(searchQuery)}&limit=10`);
        const data = await res.json();
        const products = data.components || data;
        setSuggestions(products);
        setShowDropdown(true);
      } catch (err) {
        console.error("Search error:", err);
        setSuggestions([]);
      }
    };
    
    const timeoutId = setTimeout(searchProducts, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close dropdown on click outside (same as inventory alert)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addProduct = (product) => {
    if (!selectedProducts.find(p => p._id === product._id)) {
      setSelectedProducts([...selectedProducts, product]);
    }
    setSearchQuery("");
    setSuggestions([]);
    setShowDropdown(false);
  };

  const removeProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p._id !== productId));
    setAnalysis(null);
  };

  const handleReview = async () => {
    if (selectedProducts.length === 0) {
      setError("Please add at least one product to review");
      return;
    }
    
    setAnalyzing(true);
    setError(null);
    setAnalysis(null);
    
    try {
      const res = await fetch(`${API_URL}/api/ai-review/review-build`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ components: selectedProducts })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to analyze build");
      
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200">
            AI-Powered Analysis
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            AI Build Review System
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Search and add products to your build. AI will analyze compatibility, performance, and bottlenecks.
          </p>
        </div>

        {/* Search Section - Same style as inventory alert */}
        <Card className="border border-slate-200 shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Search className="h-5 w-5 text-purple-500" />
              Add Products to Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={searchRef} className="relative">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for CPU, GPU, RAM, Storage, Motherboard..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 flex-1"
                />
                <Button
                  onClick={() => suggestions.length > 0 && addProduct(suggestions[0])}
                  disabled={suggestions.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>
              
              {/* Suggestions Dropdown - Same as inventory alert */}
              {showDropdown && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                  {suggestions.map((product) => (
                    <button
                      key={product._id}
                      onClick={() => addProduct(product)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <span>{product.name}</span>
                      <span className="text-xs text-slate-400">{product.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Products List */}
        {selectedProducts.length > 0 && (
          <Card className="border border-slate-200 shadow-sm mb-8">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-purple-500" />
                Your Build ({selectedProducts.length} products)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedProducts.map((product) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.brand} • {product.type}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeProduct(product._id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                onClick={handleReview}
                disabled={analyzing}
                className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    AI is analyzing your build...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Review Build with AI
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-center mb-8">
            {error}
          </div>
        )}

        {/* Analysis Results */}
        {analysis && (
          <Card className="border border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-100 rounded-lg">
                <div className="text-center sm:text-left">
                  <p className="text-sm text-slate-500">Overall Score</p>
                  <p className="text-4xl font-bold text-purple-600">{analysis.overallScore || 75}/100</p>
                </div>
                <div className="px-4 py-2 rounded-full bg-purple-100 text-purple-700">
                  <span className="font-semibold">{analysis.verdict || "Custom Build"}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    Gaming Performance
                  </h3>
                  <p className="text-sm text-slate-600">{analysis.gamingPerformance || "Analysis complete"}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <Zap className="h-4 w-4 text-blue-600" />
                    Productivity Performance
                  </h3>
                  <p className="text-sm text-slate-600">{analysis.productivityPerformance || "Analysis complete"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Compatibility
                  </h3>
                  <p className="text-sm text-slate-600">{analysis.compatibility || "Components are compatible"}</p>
                </div>
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    Bottlenecks
                  </h3>
                  <p className="text-sm text-slate-600">{analysis.bottlenecks || "No major bottlenecks detected"}</p>
                </div>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-semibold text-slate-900 mb-2">Power & Recommendations</h3>
                <p className="text-sm text-slate-600 mb-2">⚡ {analysis.powerConsumption || "Estimated 400-600W"}</p>
                <p className="text-sm text-slate-600">💡 {analysis.recommendations || "Consider a quality power supply"}</p>
              </div>

              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">AI Summary</h3>
                <p className="text-sm text-purple-800">{analysis.summary || "AI analysis completed successfully"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Initial State */}
        {!analysis && !analyzing && selectedProducts.length === 0 && !error && (
          <div className="text-center py-20">
            <Brain className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-400">Search for products, click + to add them to your build</p>
            <p className="text-slate-400 text-sm mt-2">Then click "Review Build with AI" for analysis</p>
          </div>
        )}
      </main>
    </div>
  );
}
