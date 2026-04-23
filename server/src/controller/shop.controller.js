import Shop from "../models/shop.js";

const getShops = async (req, res) => {
    try {
        const { area, search } = req.query;
        let query = {};

        // Filter by area if provided
        if (area && area !== "All areas") {
            query.area = area;
        }

        // Search by name or address if provided
        if (search) {
            query.$or = [
                { shopName: { $regex: search, $options: "i" } },
                { address: { $regex: search, $options: "i" } }
            ];
        }

        const shops = await Shop.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: shops,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getShopById = async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await Shop.findById(id);

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
            message: error.message,
        });
    }
};

const createShop = async (req, res) => {
    try {
        const { shopName, area, address, phone, categories, googleMapLink } = req.body;

        if (!shopName || !area || !address || !phone) {
            return res.status(400).json({
                success: false,
                message: "Shop name, area, address, and phone are required",
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
            data: shop,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const updateShop = async (req, res) => {
    try {
        const { id } = req.params;
        const { shopName, area, address, phone, categories, googleMapLink, verified } = req.body;

        const shop = await Shop.findById(id);
        if (!shop) {
            return res.status(404).json({
                success: false,
                message: "Shop not found",
            });
        }

        const updatedShop = await Shop.findByIdAndUpdate(
            id,
            {
                shopName,
                area,
                address,
                phone,
                categories,
                googleMapLink,
                verified,
            },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: updatedShop,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteShop = async (req, res) => {
    try {
        const { id } = req.params;
        const shop = await Shop.findByIdAndDelete(id);

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
            message: error.message,
        });
    }
};

export { getShops, getShopById, createShop, updateShop, deleteShop };
