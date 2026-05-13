import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getManagerialInsights(data: any) {
  try {
    const prompt = `
      As a Senior Business Analyst for Davsplace Studio, provide 3 short, high-level, bullet-point managerial insights based on this financial data:
      ${JSON.stringify(data)}
      
      Format your response as a simple list of 3 bullet points. 
      Focus on growth, risk, and efficiency.
      Keep it professional and encouraging for a business owner.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text || "• Growth trajectory remains stable.\n• Monitor operational overhead strictly.\n• Opportunity detected in asset reallocation.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "• Growth trajectory remains stable.\n• Monitor operational overhead strictly.\n• Opportunity detected in asset reallocation.";
  }
}

export async function getModuleStrategySummary(moduleTitle: string, formData: any) {
  try {
    const prompt = `
      As a Senior Business Strategist for Davsplace Studio, provide a concise (2-3 sentences) summary of the strategic importance of the "${moduleTitle}" module for a business owner.
      Use the following context from their current progress:
      ${JSON.stringify(formData)}
      
      Focus on how this specific module drives growth and investor readiness.
      Keep the tone professional, minimalist, and visionary.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });

    return response.text || "Strategic validation of this module ensures alignment between core business objectives and market reality, serving as a critical pillar for long-term scalability.";
  } catch (error) {
    console.error("Gemini Module Summary Error:", error);
    return "Strategic validation of this module ensures alignment between core business objectives and market reality, serving as a critical pillar for long-term scalability.";
  }
}
