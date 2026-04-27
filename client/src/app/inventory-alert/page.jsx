"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Bell, BellOff, Trash2, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function InventoryAlertContent() {
  const searchParams = useSearchParams();

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [componentName, setComponentName] = useState(searchParams.get("componentName") || "");
  const [retailerName, setRetailerName] = useState(searchParams.get("retailerName") || "");
  const [email, setEmail] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState(null);

  const [componentSuggestions, setComponentSuggestions] = useState([]);
  const [retailerSuggestions, setRetailerSuggestions] = useState([]);
  const [showComponentDropdown, setShowComponentDropdown] = useState(false);
  const [showRetailerDropdown, setShowRetailerDropdown] = useState(false);
  const [stockChecking, setStockChecking] = useState(false);
  const [stockError, setStockError] = useState(null);

  const componentRef = useRef(null);
  const retailerRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (componentRef.current && !componentRef.current.contains(e.target)) {
        setShowComponentDropdown(false);
      }
      if (retailerRef.current && !retailerRef.current.contains(e.target)) {
        setShowRetailerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL + "/api/inventoryalert/");
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to fetch alerts");
      setAlerts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleComponentInput = async (value) => {
    setComponentName(value);
    setSelectedComponentId(null);
    setStockError(null);
    if (value.length < 1) {
      setComponentSuggestions([]);
      setShowComponentDropdown(false);
      return;
    }
    try {
      const res = await fetch(API_URL + "/api/components?search=" + encodeURIComponent(value) + "&limit=5");
      const data = await res.json();
      const list = data.components || data;
      setComponentSuggestions(list);
      setShowComponentDropdown(true);
    } catch {
      setComponentSuggestions([]);
    }
  };

  const handleRetailerInput = async (value) => {
    setRetailerName(value);
    setStockError(null);
    if (value.length < 1) {
      setRetailerSuggestions([]);
      setShowRetailerDropdown(false);
      return;
    }
    try {
      const res = await fetch(API_URL + "/api/pricewatcher/component/" + selectedComponentId);
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter((r) =>
          r.retailerName.toLowerCase().includes(value.toLowerCase())
        );
        setRetailerSuggestions(filtered);
        setShowRetailerDropdown(true);
      }
    } catch {
      setRetailerSuggestions([]);
    }
  };

  const selectComponent = (component) => {
    setComponentName(component.name);
    setSelectedComponentId(component._id);
    setShowComponentDropdown(false);
    setRetailerName("");
    setRetailerSuggestions([]);
    setStockError(null);
  };

  const selectRetailer = async (retailer) => {
    setRetailerName(retailer.retailerName);
    setShowRetailerDropdown(false);
    setStockError(null);

    setStockChecking(true);
    if (retailer.inStock) {
      setStockError("This component is currently IN STOCK at " + retailer.retailerName + ". Alerts can only be set for out-of-stock items!");
    }
    setStockChecking(false);
  };

  const handleSetAlert = async () => {
    if (!componentName || !email || !retailerName) {
      setError("Please fill in all fields!");
      return;
    }
    if (stockError) {
      setError("Cannot set alert — item is in stock!");
      return;
    }
    setSubmitting(true);
    setSuccessMsg("");
    setError(null);

    try {
      let componentId = selectedComponentId;

      if (!componentId) {
        const searchRes = await fetch(API_URL + "/api/components?search=" + encodeURIComponent(componentName) + "&limit=1");
        const searchData = await searchRes.json();
        const components = searchData.components || searchData;
        if (!components || components.length === 0) {
          setError("Component not found! Please check the name.");
          setSubmitting(false);
          return;
        }
        componentId = components[0]._id;
      }

      const res = await fetch(API_URL + "/api/inventoryalert/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ componentId, componentName, email, retailerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set alert");

      setSuccessMsg("Alert set! You will receive an email when " + componentName + " is back in stock at " + retailerName + "!");
      setComponentName("");
      setEmail("");
      setRetailerName("");
      setSelectedComponentId(null);
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(API_URL + "/api/inventoryalert/delete/" + id, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete alert");
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            Inventory Alerts
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-3">
            Stock Notifications
          </h1>
          <p className="text-slate-500 text-lg max-w-xl mx-auto">
            Set alerts for out-of-stock components and get notified by email when they are back in stock.
          </p>
        </div>

        <Card className="border border-slate-200 shadow-sm mb-10">
          <CardHeader>
            <CardTitle className="text-slate-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-500" />
              Set a New Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div ref={componentRef} className="relative">
              <label className="text-xs text-slate-500 mb-1 block">Component Name</label>
              <Input
                placeholder="e.g. Nvidia RTX 4070"
                value={componentName}
                onChange={(e) => handleComponentInput(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
              {showComponentDropdown && componentSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                  {componentSuggestions.map((c) => (
                    <button
                      key={c._id}
                      onClick={() => selectComponent(c)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <span>{c.name}</span>
                      <span className="text-xs text-slate-400">{c.type}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div ref={retailerRef} className="relative">
              <label className="text-xs text-slate-500 mb-1 block">
                Retailer Name
                {!selectedComponentId && (
                  <span className="text-amber-600 ml-2">(Select a component first)</span>
                )}
              </label>
              <Input
                placeholder="e.g. Star Tech"
                value={retailerName}
                onChange={(e) => handleRetailerInput(e.target.value)}
                disabled={!selectedComponentId}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
              />
              {showRetailerDropdown && retailerSuggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden">
                  {retailerSuggestions.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => selectRetailer(r)}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-between"
                    >
                      <span>{r.retailerName}</span>
                      <span className={"text-xs " + (r.inStock ? "text-green-600" : "text-red-600")}>
                        {r.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {stockError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-600 text-sm">
                {stockError}
              </div>
            )}

            <div>
              <label className="text-xs text-slate-500 mb-1 block">Your Email</label>
              <Input
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-slate-200 text-slate-900 placeholder:text-slate-400"
              />
            </div>

            <Button
              onClick={handleSetAlert}
              disabled={submitting || !!stockError}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {submitting ? "Setting Alert..." : "Set Alert"}
            </Button>

            {successMsg && (
              <p className="text-green-600 text-sm text-center">{successMsg}</p>
            )}
            {error && (
              <p className="text-red-600 text-sm text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        <Separator className="bg-slate-200 mb-10" />

        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-blue-500" />
          {"Active Alerts (" + alerts.length + ")"}
        </h2>

        {loading && <p className="text-slate-400 text-center py-10">Loading alerts...</p>}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <BellOff className="mx-auto h-12 w-12 text-slate-300" />
            <p className="text-slate-400">No alerts set yet.</p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {alerts.map((alert) => (
              <Card key={alert._id} className="border border-slate-200 shadow-sm hover:border-blue-300 transition-all">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-slate-900">
                      {alert.componentName || alert.componentId?.name || "Component"}
                    </CardTitle>
                    {alert.isNotified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                        Notified
                      </Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">
                        Watching
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-slate-500">{"Email: " + alert.email}</p>
                  <p className="text-xs text-slate-500">{"Shop: " + alert.retailerName}</p>
                  <p className="text-xs text-slate-400">
                    {"Set on: " + new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(alert._id)}
                    className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Cancel Alert
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function InventoryAlertPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <InventoryAlertContent />
    </Suspense>
  );
}
