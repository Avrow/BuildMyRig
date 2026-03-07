"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  RefreshCw,
  Loader2,
  User,
  Mail,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading, logout, refresh } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/signin");
    }
  }, [user, loading, router]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      toast.success("Session refreshed successfully");
    } catch {
      toast.error("Failed to refresh session. Please sign in again.");
      router.push("/signin");
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-slate-500">
            Welcome back, {user.name || "there"}!
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Profile card */}
          <Card className="col-span-1 md:col-span-2 lg:col-span-1 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <User className="h-5 w-5 text-blue-500" />
                Profile
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-600 text-white text-lg font-bold">
                  {(user.name || user.email)[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {user.name || "—"}
                  </p>
                  <p className="text-sm text-slate-500 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Account status</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border-0">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">User ID</span>
                <code className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                  {String(user._id).slice(-8)}
                </code>
              </div>
            </CardContent>
          </Card>

          {/* Session card */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-white">
                <ShieldCheck className="h-5 w-5 text-violet-500" />
                Session
              </CardTitle>
              <CardDescription>Manage your active session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 space-y-1">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Token status
                </p>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                    Active
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh token
              </Button>
            </CardContent>
          </Card>

          {/* Quick actions card */}
          <Card className="border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white">
                Quick actions
              </CardTitle>
              <CardDescription>Common account actions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="destructive"
                className="w-full gap-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800"
                onClick={async () => {
                  try {
                    await logout();
                    toast.success("Signed out");
                    router.push("/");
                  } catch {
                    toast.error("Sign out failed");
                  }
                }}
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
