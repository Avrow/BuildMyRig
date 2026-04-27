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

export const aiApi = {
	generateBuildMatch: (budget, useCase, targetResolution, preferredBrands = [], extraNotes = "") =>
		apiFetch("/api/ai-build-matcher", {
			method: "POST",
			body: JSON.stringify({
				budget,
				useCase,
				targetResolution,
				preferredBrands,
				extraNotes,
			}),
		}),
};

export const buildPlannerApi = {
	generateVirtualLook: (parts) =>
		apiFetch("/api/builds/virtual-look", {
			method: "POST",
			body: JSON.stringify({ parts }),
		}),

	saveBuild: (payload) =>
		apiFetch("/api/builds", {
			method: "POST",
			body: JSON.stringify(payload),
		}),
};
