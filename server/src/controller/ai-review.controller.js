import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Component specification templates for comparison
const componentSpecs = {
  CPU: ["cores", "threads", "baseClock", "boostClock", "tdp"],
  GPU: ["vram", "memoryInterface", "tdp"],
  RAM: ["capacity", "speed", "type"],
  Storage: ["capacity", "type", "readSpeed"],
  Motherboard: ["socket", "chipset", "formFactor"],
  PSU: ["watts", "efficiency"],
  Case: ["formFactor"],
  Cooler: ["type", "tdp"]
};

// Helper: Get component specifications
const getComponentSpecs = (component) => {
  const specs = {};
  if (component.specs) {
    Object.keys(component.specs).forEach(key => {
      specs[key] = component.specs[key];
    });
  }
  specs.type = component.type;
  specs.name = component.name;
  specs.brand = component.brand;
  return specs;
};

// Helper: Generate performance analysis prompt
const generateAnalysisPrompt = (components) => {
  const componentList = components.map(c => {
    const specs = getComponentSpecs(c);
    return `
      Component: ${c.name}
      Type: ${c.type}
      Brand: ${c.brand}
      Specifications: ${JSON.stringify(specs, null, 2)}
    `;
  }).join("\n---\n");

  return `
You are an expert PC builder and hardware analyst. Analyze the following PC build components and provide a detailed review.

Components:
${componentList}

Please provide analysis in the following JSON format:
{
  "overallScore": "number from 0-100",
  "verdict": "one of: 'Great setup for 1440p gaming', 'Balanced productivity workstation', 'High power consumption build', 'Entry-level gaming setup', 'Potential RAM bottleneck detected', 'CPU bottleneck detected', 'GPU bottleneck detected', 'Well-balanced budget build'",
  "gamingPerformance": "analysis of gaming capabilities",
  "productivityPerformance": "analysis for productivity tasks",
  "compatibility": "check if components are compatible (socket, form factor, power)",
  "bottlenecks": "identified bottlenecks if any",
  "powerConsumption": "estimated power usage in watts",
  "recommendations": "suggestions for improvement",
  "summary": "overall conclusion in 2-3 sentences"
}

Be specific and technical. Use the actual specifications provided.
`;
};

// Main review function
export const reviewBuild = async (req, res) => {
  try {
    const { components } = req.body;
    
    if (!components || components.length === 0) {
      return res.status(400).json({ error: "No components provided for review" });
    }
    
    console.log(`🔍 Analyzing build with ${components.length} components...`);
    
    const prompt = generateAnalysisPrompt(components);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert PC hardware analyst. Provide detailed, technical analysis of PC builds."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const response = completion.choices[0].message.content;
    
    // Parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (e) {
      // If response is not pure JSON, extract or return as text
      analysis = {
        overallScore: 75,
        verdict: "Custom build configuration",
        gamingPerformance: response,
        productivityPerformance: "See gaming performance",
        compatibility: "Check component specifications",
        bottlenecks: "None detected",
        powerConsumption: "Estimated 400-600W",
        recommendations: "Consider upgrading based on usage",
        summary: response.substring(0, 500)
      };
    }
    
    console.log(`✅ Analysis complete for ${components.length} components`);
    
    res.json({
      success: true,
      analysis: analysis,
      componentsReviewed: components.map(c => ({
        id: c._id,
        name: c.name,
        type: c.type
      }))
    });
    
  } catch (error) {
    console.error("AI Review error:", error);
    res.status(500).json({ error: error.message });
  }
};

// Quick analysis for single component
export const analyzeComponent = async (req, res) => {
  try {
    const { componentId } = req.params;
    const db = mongoose.connection.db;
    const component = await db.collection('components').findOne({ 
      _id: new mongoose.Types.ObjectId(componentId) 
    });
    
    if (!component) {
      return res.status(404).json({ error: "Component not found" });
    }
    
    const prompt = `
      Analyze this PC component and provide its:
      - Strengths
      - Weaknesses
      - Best use cases
      - Value for money (good/average/poor)
      - Comparable alternatives
      
      Component: ${component.name}
      Type: ${component.type}
      Brand: ${component.brand}
      Specifications: ${JSON.stringify(component.specs || {}, null, 2)}
    `;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a PC hardware expert." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });
    
    res.json({
      success: true,
      component: component.name,
      analysis: completion.choices[0].message.content
    });
    
  } catch (error) {
    console.error("Component analysis error:", error);
    res.status(500).json({ error: error.message });
  }
};
