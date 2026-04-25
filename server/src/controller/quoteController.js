import Quote from "../models/quote.js";

const createQuote = async (req, res) => {
    try {
        const { quoteName, parts, userId } = req.body;

        if (!quoteName || !parts || parts.length === 0 || !userId) {
            return res.status(400).json({
                success: false,
                message: "Quote name, parts, and userId are required",
            });
        }

        // Transform the parts data to match the schema
        const transformedParts = parts.map(part => ({
            partName: part.name,
            category: part.detectedType || 'Unknown',
            price: part.price || 0,
        }));

        const quote = await Quote.create({
            userId,
            quoteName,
            parts: transformedParts,
        });

        res.status(201).json({
            success: true,
            data: quote,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getUserQuotes = async (req, res) => {
    try {
        const { userId } = req.params;
        const quotes = await Quote.find({ userId }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: quotes,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getQuoteById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Searching for quote with ID:', id);
        
        const quote = await Quote.findById(id);
        console.log('Found quote:', quote);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote not found",
                debug: {
                    searchedId: id,
                    allQuotesCount: await Quote.countDocuments()
                }
            });
        }

        res.status(200).json({
            success: true,
            data: quote,
        });
    } catch (error) {
        console.error('Error in getQuoteById:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const deleteQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await Quote.findByIdAndDelete(id);

        if (!quote) {
            return res.status(404).json({
                success: false,
                message: "Quote not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Quote deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export { createQuote, getUserQuotes, getQuoteById, deleteQuote };
