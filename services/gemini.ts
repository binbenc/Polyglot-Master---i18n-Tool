import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const translateBatch = async (
  targetLang: string,
  sourceData: { key: string; sourceText: string }[]
): Promise<{ [key: string]: string }> => {
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  // Batching to avoid token limits, though for this UI example we'll do one batch
  // Real production code should chunk this.
  
  const prompt = `
    You are a professional translator for mobile applications. 
    Translate the following JSON object values from English (or detected language) to ${targetLang}.
    Keep the keys exactly as they are.
    Do not translate technical placeholders like %s, {0}, or @string/.
    
    Source Data:
    ${JSON.stringify(sourceData.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.sourceText }), {}))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          description: "A mapping of keys to translated values",
          properties: {
            translations: {
              type: Type.OBJECT,
              description: "Key-value pairs of translations",
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return {};
    
    const parsed = JSON.parse(jsonText);
    // Handle potential schema wrapping
    return parsed.translations || parsed;
  } catch (error) {
    console.error("Gemini translation failed:", error);
    throw error;
  }
};