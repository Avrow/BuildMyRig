import PriceWatch from "../models/PriceWatch.js";

// GET all prices for a specific component
export const getPricesByComponent = async (req, res) => {
  try {
    const prices = await PriceWatch.find({
      componentId: req.params.componentId,
    });
    if (prices.length === 0) {
      return res.status(404).json({ 
        message: "No prices found for this component" 
      });
    }
    res.status(200).json(prices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST add a new retailer price entry
export const addPrice = async (req, res) => {
  try {
    const { componentId, retailerName, price, inStock, location } = req.body;
    const newPrice = new PriceWatch({
      componentId,
      retailerName,
      price,
      inStock,
      location,
    });
    await newPrice.save();
    res.status(201).json({
      message: "Price entry added successfully",
      data: newPrice,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT update a price entry
export const updatePrice = async (req, res) => {
  try {
    const updated = await PriceWatch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ 
        error: "Price entry not found" 
      });
    }
    res.status(200).json({
      message: "Price updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};