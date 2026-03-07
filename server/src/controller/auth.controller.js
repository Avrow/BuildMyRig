import {
	comparePassword,
	generateToken,
	hashPassword,
	verifyAccessToken,
	addToCookies,
} from "../utils/jwt.js";
import { findUserByEmail, createUser } from "../service/user.service.js";

export async function registerUser(req, res) {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res
			.status(400)
			.json({ error: "Name, email and password are required" });
	}

	const oldUser = await findUserByEmail(email);
	if (oldUser) {
		return res.status(409).json({ error: "User already exists" });
	}

	const hashedPassword = await hashPassword(password);
	const newUser = await createUser({ name, email, password: hashedPassword });

	const accessToken = await generateToken(newUser);
	await addToCookies(res, accessToken);

	const { password: _, ...user } = newUser.toObject();
	return res
		.status(201)
		.json({ message: "User registered successfully", user });
}

export async function loginUser(req, res) {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({ error: "Email and password are required" });
	}

	const existingUser = await findUserByEmail(email);
	if (!existingUser) {
		return res.status(404).json({ error: "User not found" });
	}

	const isPasswordValid = await comparePassword(
		password,
		existingUser.password,
	);
	if (!isPasswordValid) {
		return res.status(401).json({ error: "Invalid credentials" });
	}

	const accessToken = await generateToken(existingUser);
	await addToCookies(res, accessToken);

	const { password: _, ...user } = existingUser.toObject();
	return res.status(200).json({ message: "Login successful", user });
}

export async function logoutUser(req, res) {
	res.clearCookie("token", {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
	});
	return res.status(200).json({ message: "Logged out successfully" });
}

export async function getMe(req, res) {
	const token = req.cookies?.token;
	if (!token) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	try {
		const decoded = await verifyAccessToken(token);
		const user = await findUserByEmail(decoded.email);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		const { password: _, ...userData } = user.toObject();
		return res.status(200).json({ user: userData });
	} catch {
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}

export async function refreshToken(req, res) {
	const token = req.cookies?.token;
	if (!token) {
		return res.status(401).json({ error: "Not authenticated" });
	}
	try {
		const decoded = await verifyAccessToken(token);
		const user = await findUserByEmail(decoded.email);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}
		const newToken = await generateToken(user);
		await addToCookies(res, newToken);
		return res.status(200).json({ message: "Token refreshed" });
	} catch {
		res.clearCookie("token");
		return res.status(401).json({ error: "Invalid or expired token" });
	}
}
