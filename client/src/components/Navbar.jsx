"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { LogOut, LayoutDashboard, Menu, X, Loader2, Zap, Store, Users, Cpu, Newspaper, Sparkles, Calculator, PackageOpen, ArrowLeftRight, Tag, Bell, Wrench,Brain,TrendingUp } from "lucide-react";

import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);


const navLinks = [
  { href: "/shop-finder", label: "Shop Finder", icon: Store },
  { href: "/price-watcher", label: "Price Watcher", icon: Tag },
  { href: "/inventory-alert", label: "Inventory Alerts", icon: Bell },
   { href: "/market-trend", label: "Market Trend", icon: TrendingUp },
		{ href: "/build-planner", label: "Build Planner", icon: Wrench },
        { href: "/ai-review", label: "AI Review", icon: Brain },
  		{ href: "/quote-generator", label: "Quote Generator", icon: Calculator },
		{ href: "/components", label: "Components", icon: Cpu },
		{ href: "/ai-build-matcher", label: "AI Builder", icon: Sparkles },
		// { href: "/vault", label: "Vault", icon: PackageOpen },
		{ href: "/community", label: "Community", icon: Users },
        { href: "/marketplace", label: "Marketplace", icon: Users },
		{ href: "/news", label: "News", icon: Newspaper },

		
  ...(user ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : [])
];
    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await logout();
            toast.success("Signed out successfully");
            router.push("/");
        } catch {
            toast.error("Failed to sign out");
        } finally {
            setLoggingOut(false);
            setMobileOpen(false);
        }
    };

    // তোমার সেই অরিজিনাল লিঙ্ক লিস্ট, শুধু মার্কেটপ্লেস অ্যাড করা হয়েছে


    return (
        <header className='sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-md'>
            {/* উইডথ বাড়িয়ে ১৮০০পিএক্স করা হয়েছে যাতে সব নাম আর লোগো ধরে যায় */}
            <div className='mx-auto flex h-16 max-w-[1800px] items-center justify-between px-4 sm:px-6'>
                
                {/* Logo - তোমার অরিজিনাল 'BuildMyRig' টেক্সটসহ */}
                <Link
                    href='/'
                    className='flex items-center gap-2 font-bold text-slate-900 dark:text-white'
                >
                    <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600'>
                        <Zap className='h-4 w-4 text-white' />
                    </div>
                    <span className="text-lg">BuildMyRig</span>
                </Link>

                {/* Desktop nav - অরিজিনাল ফন্ট সাইজ এবং গ্যাপ */}
                <nav className='hidden md:flex items-center gap-6'>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                                pathname === href
                                    ? "text-blue-600 dark:text-blue-400"
                                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                            }`}
                        >
                            <Icon className='h-4 w-4' />
                            {label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop auth buttons - তোমার সেই 'ইউজার নেম ব্যাজ' সহ */}
                <div className='hidden md:flex items-center gap-3'>
                    {user ? (
                        <div className='flex items-center gap-3'>
                            {/* ইউজারের নাম (যেমন: পল্লব সাহা) এখানে দেখাবে */}
                            <Badge variant='secondary' className='flex gap-1 px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-50 border-blue-100'>
                                {user.name || user.email}
                            </Badge>
                            
                            <Button
                                variant='ghost'
                                size='sm'
                                onClick={handleLogout}
                                disabled={loggingOut}
                                className='text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400'
                            >
                                {loggingOut ? (
                                    <Loader2 className='h-4 w-4 animate-spin' />
                                ) : (
                                    <LogOut className='h-4 w-4 mr-1.5' />
                                )}
                                Sign out
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button variant='ghost' size='sm' asChild>
                                <Link href='/signin'>Sign in</Link>
                            </Button>
                            <Button
                                size='sm'
                                className='bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md'
                                asChild
                            >
                                <Link href='/signup'>Get started</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile menu toggle */}
                <button
                    className='md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    onClick={() => setMobileOpen((v) => !v)}
                >
                    {mobileOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className='md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 py-4 space-y-2'>
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            onClick={() => setMobileOpen(false)}
                            className='flex items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-slate-300'
                        >
                            <Icon className='h-4 w-4' />
                            {label}
                        </Link>
                    ))}
                    <Separator />
                    {user && (
                        <Button
                            variant='ghost'
                            className='w-full justify-start text-red-600'
                            onClick={handleLogout}
                        >
                            <LogOut className='h-4 w-4 mr-2' /> Sign out
                        </Button>
                    )}
                </div>
            )}
        </header>
    );
}