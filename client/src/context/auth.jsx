"use client";

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const fetchUser = useCallback(async () => {
		try {
			const data = await authApi.me();
			setUser(data.user);
		} catch {
			setUser(null);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchUser();
	}, [fetchUser]);

	const login = async (email, password) => {
		const data = await authApi.login(email, password);
		setUser(data.user);
		return data;
	};

	const register = async (name, email, password) => {
		const data = await authApi.register(name, email, password);
		setUser(data.user);
		return data;
	};

	const logout = async () => {
		await authApi.logout();
		setUser(null);
	};

	const refresh = async () => {
		await authApi.refresh();
		await fetchUser();
	};

	return (
		<AuthContext.Provider
			value={{ user, loading, login, register, logout, refresh }}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
