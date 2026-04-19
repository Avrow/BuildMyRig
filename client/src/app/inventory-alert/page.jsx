"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, Trash2, PackageCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1497";

export default function InventoryAlertPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [componentId, setComponentId] = useState("");
  const [email, setEmail] = useState("");
  const [retailerName, setRetailerName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all alerts
  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/inventoryalert/`);
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

  // Set a new alert
  const handleSetAlert = async () => {
    if (!componentId || !email || !retailerName) return;
    setSubmitting(true);
    setSuccessMsg("");
    try {
      const res = await fetch(`${API_URL}/api/inventoryalert/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ componentId, email, retailerName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to set alert");
      setSuccessMsg("✅ Alert set successfully!");
      setComponentId("");
      setEmail("");
      setRetailerName("");
      fetchAlerts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete an alert
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/inventoryalert/delete/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete alert");
      setAlerts((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">

        {/* ── Hero ── */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-600/20 text-yellow-400 border-yellow-600/40">
            Inventory Alerts
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-3">
            Stock Notifications
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Set alerts for out-of-stock components and get notified by email when they are back in stock.
          </p>
        </div>

        {/* ── Set Alert Form ── */}
        <Card className="bg-gray-900 border border-gray-800 mb-10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-400" />
              Set a New Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Component ID"
              value={componentId}
              onChange={(e) => setComponentId(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Input
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Input
              placeholder="Retailer Name (e.g. Star Tech)"
              value={retailerName}
              onChange={(e) => setRetailerName(e.target.value)}
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
            />
            <Button
              onClick={handleSetAlert}
              disabled={submitting}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              {submitting ? "Setting Alert..." : "Set Alert"}
            </Button>
            {successMsg && (
              <p className="text-green-400 text-sm text-center">{successMsg}</p>
            )}
            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        <Separator className="bg-gray-800 mb-10" />

        {/* ── Active Alerts ── */}
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <PackageCheck className="h-5 w-5 text-yellow-400" />
          Active Alerts
        </h2>

        {loading && (
          <p className="text-gray-400 text-center py-10">Loading alerts...</p>
        )}

        {!loading && alerts.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <BellOff className="mx-auto h-12 w-12 text-gray-700" />
            <p className="text-gray-500">No alerts set yet.</p>
          </div>
        )}

        {!loading && alerts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {alerts.map((alert) => (
              <Card
                key={alert._id}
                className="bg-gray-900 border border-gray-800 hover:border-yellow-500/50 transition-all"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-white">
                      {alert.componentId?.name || alert.componentId}
                    </CardTitle>
                    {alert.isNotified ? (
                      <Badge className="bg-green-600/20 text-green-400 border-green-600/40 text-xs">
                        Notified ✅
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-600/20 text-yellow-400 border-yellow-600/40 text-xs">
                        Watching 👀
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs text-gray-400">📧 {alert.email}</p>
                  <p className="text-xs text-gray-400">🏪 {alert.retailerName}</p>
                  <p className="text-xs text-gray-600">
                    Set on: {new Date(alert.createdAt).toLocaleDateString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(alert._id)}
                    className="w-full mt-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800"
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