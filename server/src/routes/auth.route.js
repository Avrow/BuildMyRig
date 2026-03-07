import { Router } from "express";
import {
	loginUser,
	logoutUser,
	registerUser,
	getMe,
	refreshToken,
} from "../controller/auth.controller.js";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", getMe);
router.post("/refresh", refreshToken);

export default router;
