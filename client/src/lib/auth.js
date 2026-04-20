import { cookies } from "next/headers";

/**
 * from cookie read the JWT token, decode it and return user info (id and name)
 */
export async function getSessionUser() {
    try {
        const cookieStore = await cookies();
        const tokenCookie = cookieStore.get("token");

        if (!tokenCookie || !tokenCookie.value) return null;

        // JWT payload decode
        const base64Url = tokenCookie.value.split('.')[1];
        if (!base64Url) return null;
        
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = Buffer.from(base64, 'base64').toString();
        const payload = JSON.parse(jsonPayload);

        return {
            id: payload.id || payload._id || payload.sub,
            name: payload.name
        };
    } catch (error) {
        console.error("Auth Helper Error:", error.message);
        return null;
    }
}