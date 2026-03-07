import mongoose from "mongoose";

const user = new mongoose.Schema({
	name: {
		required: true,
		type: String,
		min: 3,
		max: 50,
	},
	email: {
		type: String,
		unique: true,
		required: "Email address is required",
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please fill a valid email address",
		],
	},
	password: {
		required: true,
		type: String,
		min: 6,
	},
});

export default mongoose.model("User", user);
