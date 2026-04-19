import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const hashPassword = async (password) => {
	const saltRounds = 10;
	return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
	return await bcrypt.compare(password, hashedPassword);
};

const generateToken = async (user) => {
	const payload = { id: user._id, email: user.email };
	const secret = process.env.JWT_SECRET || "your_jwt_secret";
	const options = { expiresIn: process.env.JWT_EXPIRES_IN || "7d" };
	return await jwt.sign(payload, secret, options);
};

const verifyAccessToken = async (token) => {
	const secret = process.env.JWT_SECRET || "your_jwt_secret";
	try {
		return await jwt.verify(token, secret);
	} catch (error) {
		throw new Error("Invalid token");
	}
};

const addToCookies = async (res, token) => {
	await res.cookie("token", token, {
		secure: process.env.NODE_ENV === "production",
		httpOnly: true,
		sameSite: "lax",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});
};

export {
	hashPassword,
	comparePassword,
	generateToken,
	verifyAccessToken,
	addToCookies,
};
