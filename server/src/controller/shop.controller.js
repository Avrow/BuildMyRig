import Shop from "../models/Shop.js";

// Get all shops with optional area filtering
export const getAllShops = async (req, res) => {
    try {
        const { area } = req.query;
        let query = {};
        
        if (area) {
            query.area = { $regex: area, $options: "i" };
        }
        
        const shops = await Shop.find(query).sort({ createdAt: -1 });
        
        res.status(200).json({
            success: true,
            count: shops.length,
            data: shops,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching shops",
            error: error.message,
        });
    }
};

// Get single shop by ID
export const getShopById = async (req, res) => {
    try {
        const shop = await Shop.findById(req.params.id);
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }
        
        res.status(200).json({
            success: true,
            data: shop,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching shop",
            error: error.message,
        });
    }
};

// Create new shop (admin only)
export const createShop = async (req, res) => {
    try {
        const { shopName, area, address, phone, categories, googleMapLink } = req.body;
        
        if (!shopName || !area || !address || !phone) {
            return res.status(400).json({
                success: false,
                message: "Please provide shopName, area, address, and phone",
            });
        }
        
        const shop = await Shop.create({
            shopName,
            area,
            address,
            phone,
            categories: categories || [],
            googleMapLink,
        });
        
        res.status(201).json({
            success: true,
            message: "Shop created successfully",
            data: shop,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating shop",
            error: error.message,
        });
    }
};

// Update shop (admin only)
export const updateShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Shop updated successfully",
            data: shop,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating shop",
            error: error.message,
        });
    }
};

// Delete shop (admin only)
export const deleteShop = async (req, res) => {
    try {
        const shop = await Shop.findByIdAndDelete(req.params.id);
        
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }
        
        res.status(200).json({
            success: true,
            message: "Shop deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting shop",
            error: error.message,
        });
    }
};
