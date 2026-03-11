"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import {
	LogOut,
	LayoutDashboard,
	Menu,
	X,
	Loader2,
	Zap,
	Store,
	Users,
	Cpu,
	PackageOpen,
	Newspaper,
} from "lucide-react";

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

	const navLinks = [
		{ href: "/shop-finder", label: "Shop Finder", icon: Store },
		{ href: "/components", label: "Components", icon: Cpu },
		{ href: "/vault", label: "Vault", icon: PackageOpen },
		{ href: "/community", label: "Community", icon: Users },
		{ href: "/news", label: "News", icon: Newspaper },
		...(user ? [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }] : []),
	];

	return (
		<header className='sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/80 dark:border-slate-800/80 dark:bg-slate-950/80 backdrop-blur-md'>
			<div className='mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'>
				{/* Logo */}
				<Link
					href='/'
					className='flex items-center gap-2 font-bold text-slate-900 dark:text-white'
				>
					<div className='flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-blue-600 to-indigo-600'>
						<Zap className='h-4 w-4 text-white' />
					</div>
					<span>MyApp</span>
				</Link>

				{/* Desktop nav */}
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

				{/* Desktop auth buttons */}
				<div className='hidden md:flex items-center gap-3'>
					{user ? (
						<div className='flex items-center gap-3'>
							<Badge variant='secondary' className='hidden sm:flex'>
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
								className='bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
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
					aria-label='Toggle menu'
				>
					{mobileOpen ? (
						<X className='h-5 w-5' />
					) : (
						<Menu className='h-5 w-5' />
					)}
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
					{user ? (
						<>
							<p className='text-xs text-slate-400 px-1 pt-1'>{user.email}</p>
							<Button
								variant='ghost'
								className='w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20'
								onClick={handleLogout}
								disabled={loggingOut}
							>
								{loggingOut ? (
									<Loader2 className='h-4 w-4 mr-2 animate-spin' />
								) : (
									<LogOut className='h-4 w-4 mr-2' />
								)}
								Sign out
							</Button>
						</>
					) : (
						<div className='flex flex-col gap-2 pt-1'>
							<Button variant='outline' className='w-full' asChild>
								<Link href='/signin' onClick={() => setMobileOpen(false)}>
									Sign in
								</Link>
							</Button>
							<Button
								className='w-full bg-linear-to-r from-blue-600 to-indigo-600 text-white'
								asChild
							>
								<Link href='/signup' onClick={() => setMobileOpen(false)}>
									Get started
								</Link>
							</Button>
						</div>
					)}
				</div>
			)}
		</header>
	);
}
