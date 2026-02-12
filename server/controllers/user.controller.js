import User from "../models/User.model.js";

export const getUserProfile = async (req, res) => {
    try {
        const { userId } = req.user;
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isVerified: user.isVerified,
            }
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to fetch profile",
        });
    }
};