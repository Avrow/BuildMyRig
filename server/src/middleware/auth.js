import { verifyAccessToken } from "../utils/jwt.js";
import { findUserByEmail } from "../service/user.service.js";

const authenticateUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Not authenticated - No token provided",
            });
        }

        const decoded = await verifyAccessToken(token);
        const user = await findUserByEmail(decoded.email);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        req.user = { id: user._id, email: user.email, name: user.name };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export { authenticateUser };
