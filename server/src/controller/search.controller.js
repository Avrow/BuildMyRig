import mongoose from "mongoose";

export const searchComponents = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json([]);
    }
    
    const db = mongoose.connection.db;
    const components = await db.collection('components')
      .find({ 
        name: { $regex: q, $options: 'i' } 
      })
      .limit(10)
      .toArray();
    
    res.json(components.map(c => ({ id: c._id, name: c.name })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const searchRetailers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) {
      return res.json([]);
    }
    
    const db = mongoose.connection.db;
    const retailers = await db.collection('retailers')
      .find({ 
        name: { $regex: q, $options: 'i' } 
      })
      .limit(10)
      .toArray();
    
    res.json(retailers.map(r => ({ id: r._id, name: r.name })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
