"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";

import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
	const router = useRouter();
	const { login } = useAuth();

	const [form, setForm] = useState({ email: "", password: "" });
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({});

	const validate = () => {
		const errs = {};
		if (!form.email) errs.email = "Email is required";
		else if (!/\S+@\S+\.\S+/.test(form.email))
			errs.email = "Invalid email address";
		if (!form.password) errs.password = "Password is required";
		else if (form.password.length < 6)
			errs.password = "Password must be at least 6 characters";
		return errs;
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		const errs = validate();
		if (Object.keys(errs).length) {
			setErrors(errs);
			return;
		}
		setLoading(true);
		try {
			await login(form.email, form.password);
			toast.success("Welcome back!");
			router.push("/dashboard");
		} catch (err) {
			toast.error(err.message || "Sign in failed");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Card className='w-full max-w-md shadow-xl border-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm'>
			<CardHeader className='space-y-1 pb-4'>
				<div className='flex items-center justify-center mb-2'>
					<div className='h-10 w-10 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center'>
						<LogIn className='h-5 w-5 text-white' />
					</div>
				</div>
				<CardTitle className='text-2xl font-bold text-center text-slate-900 dark:text-white'>
					Welcome back
				</CardTitle>
				<CardDescription className='text-center text-slate-500'>
					Sign in to your account to continue
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleSubmit} noValidate className='space-y-4'>
					<div className='space-y-1.5'>
						<Label
							htmlFor='email'
							className='text-slate-700 dark:text-slate-300'
						>
							Email address
						</Label>
						<Input
							id='email'
							name='email'
							type='email'
							autoComplete='email'
							placeholder='you@example.com'
							value={form.email}
							onChange={handleChange}
							aria-invalid={!!errors.email}
							className={
								errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
							}
							disabled={loading}
						/>
						{errors.email && (
							<p className='text-xs text-red-500 mt-1'>{errors.email}</p>
						)}
					</div>

					<div className='space-y-1.5'>
						<div className='flex items-center justify-between'>
							<Label
								htmlFor='password'
								className='text-slate-700 dark:text-slate-300'
							>
								Password
							</Label>
							<Link
								href='#'
								className='text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline'
							>
								Forgot password?
							</Link>
						</div>
						<div className='relative'>
							<Input
								id='password'
								name='password'
								type={showPassword ? "text" : "password"}
								autoComplete='current-password'
								placeholder='••••••••'
								value={form.password}
								onChange={handleChange}
								aria-invalid={!!errors.password}
								className={`pr-10 ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
								disabled={loading}
							/>
							<button
								type='button'
								tabIndex={-1}
								onClick={() => setShowPassword((v) => !v)}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
								aria-label={showPassword ? "Hide password" : "Show password"}
							>
								{showPassword ? (
									<EyeOff className='h-4 w-4' />
								) : (
									<Eye className='h-4 w-4' />
								)}
							</button>
						</div>
						{errors.password && (
							<p className='text-xs text-red-500 mt-1'>{errors.password}</p>
						)}
					</div>

					<Button
						type='submit'
						className='w-full bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium'
						disabled={loading}
					>
						{loading ? (
							<>
								<Loader2 className='mr-2 h-4 w-4 animate-spin' />
								Signing in…
							</>
						) : (
							"Sign in"
						)}
					</Button>
				</form>
			</CardContent>

			<Separator />

			<CardFooter className='flex justify-center pt-4'>
				<p className='text-sm text-slate-500'>
					Don&apos;t have an account?{" "}
					<Link
						href='/signup'
						className='font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 hover:underline'
					>
						Create one
					</Link>
				</p>
			</CardFooter>
		</Card>
	);
}
