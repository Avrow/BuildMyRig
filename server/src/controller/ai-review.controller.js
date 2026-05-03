import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",

  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000",
    "X-Title": "BuildMyRig",
  },
});

const FREE_MODELS = [
  "google/gemma-4-31b-it:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free"
];

const getFallbackAnalysis = (components) => {
  const hasCPU = components.some((c) => c.type === "CPU");
  const hasGPU = components.some((c) => c.type === "GPU");
  const hasRAM = components.some((c) => c.type === "RAM");

  let verdict = "Balanced productivity workstation";
  let score = 70;
  let gamingPerformance = "Good for everyday gaming";
  let productivityPerformance = "Good for multitasking";
  let bottlenecks = "No major bottlenecks detected";
  let recommendations = "Use a reliable power supply";
  let powerConsumption = "Estimated 400W - 550W";

  if (hasCPU && hasGPU) {
    verdict = "Great setup for 1440p gaming";
    score = 85;
    gamingPerformance = "Excellent 1440p gaming performance";
    productivityPerformance =
      "Strong productivity and multitasking performance";
  }

  if (!hasGPU) {
    verdict = "Entry-level build";
    score = 45;
    gamingPerformance = "Limited gaming performance";
    bottlenecks = "No dedicated GPU detected";
    recommendations =
      "Consider adding a dedicated GPU for better gaming performance";
  }

  if (!hasRAM) {
    recommendations += ". Add at least 16GB RAM";
  }

  return {
    overallScore: score,
    verdict,
    gamingPerformance,
    productivityPerformance,
    compatibility: "Components appear compatible",
    bottlenecks,
    powerConsumption,
    recommendations,
    summary: `Build analyzed with ${components.length} component(s).`,
  };
};

const cleanJSONResponse = (text) => {
  return text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();
};

const callOpenRouter = async (prompt, model) => {
  try {
    const completion = await openrouter.chat.completions.create({
      model: model,

      messages: [
        {
          role: "system",
          content:
            "You are a professional PC hardware expert. Return ONLY valid JSON.",
        },

        {
          role: "user",
          content: prompt,
        },
      ],

      temperature: 0.3,
      max_tokens: 500,
    });

    return completion.choices[0].message.content;

  } catch (error) {
    console.log(`Model failed: ${model}`);
    console.log(error.message);

    return null;
  }
};

export const reviewBuild = async (req, res) => {
  try {
    const { components } = req.body;

    if (!components || components.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No components provided",
      });
    }

    const componentList = components
      .map((component) => {
        return `- ${component.type}: ${component.name}`;
      })
      .join("\n");

    const prompt = `
Analyze this PC build.

Components:
${componentList}

Return ONLY valid JSON in this exact format:

{
  "overallScore": 0,
  "verdict": "",
  "gamingPerformance": "",
  "productivityPerformance": "",
  "compatibility": "",
  "bottlenecks": "",
  "powerConsumption": "",
  "recommendations": "",
  "summary": ""
}
`;

    let response = null;

    for (const model of FREE_MODELS) {
      console.log(`Trying model: ${model}`);

      response = await callOpenRouter(prompt, model);

      if (response) {
        console.log(`Success with model: ${model}`);
        break;
      }
    }

    let analysis;

    if (response) {
      try {
        const cleanedResponse = cleanJSONResponse(response);

        analysis = JSON.parse(cleanedResponse);

      } catch (error) {
        console.log("Failed to parse AI response.");
        analysis = getFallbackAnalysis(components);
      }

    } else {
      console.log("All models failed. Using fallback analysis.");

      analysis = getFallbackAnalysis(components);
    }

    return res.json({
      success: true,
      analysis,
      reviewedComponents: components,
    });

  } catch (error) {
    console.error("Review Build Error:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to analyze build",
    });
  }
};

export const analyzeComponent = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Single component analysis coming soon",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: "Something went wrong",
    });
  }
};