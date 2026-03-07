const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch(path, options = {}) {
	const res = await fetch(`${API_URL}${path}`, {
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options.headers,
		},
		...options,
	});

	const data = await res.json().catch(() => ({}));

	if (!res.ok) {
		throw new Error(data.error || `Request failed with status ${res.status}`);
	}

	return data;
}

export const authApi = {
	register: (name, email, password) =>
		apiFetch("/api/auth/register", {
			method: "POST",
			body: JSON.stringify({ name, email, password }),
		}),

	login: (email, password) =>
		apiFetch("/api/auth/login", {
			method: "POST",
			body: JSON.stringify({ email, password }),
		}),

	logout: () => apiFetch("/api/auth/logout", { method: "POST" }),

	me: () => apiFetch("/api/auth/me"),

	refresh: () => apiFetch("/api/auth/refresh", { method: "POST" }),
};
