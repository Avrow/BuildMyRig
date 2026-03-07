import User from "../models/user.js";

export const createUser = async ({ name, email, password }) => {
	try {
		const user = new User({ name, email, password });
		await user.save();
		return user;
	} catch (error) {
		throw new Error("Error creating user");
	}
};

export const findUserByEmail = async (email) => {
	try {
		const user = await User.findOne({ email });
		return user;
	} catch (error) {
		throw new Error("Error checking user");
	}
};

export const findUserbyId = async (id) => {
	const user = await User.findById(id);
	return user;
};

export const deleteUser = async (email) => {
	try {
		await User.findOneAndDelete({ email });
		return { message: "User deleted successfully" };
	} catch {
		throw new Error("Error deleting user");
	}
};

export const updateUser = async (email, userData) => {
	try {
		if (userData.email) {
			throw new Error("Email cannot be updated");
		}

		const user = await findUserByEmail(email);
		if (!user) throw new Error("User not found");

		const updatedUser = await User.findOneAndUpdate({ email }, userData);
		return updatedUser;
	} catch (error) {
		throw new Error("Error updating user");
	}
};
