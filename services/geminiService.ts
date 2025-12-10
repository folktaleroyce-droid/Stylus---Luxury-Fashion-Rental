import { GoogleGenAI } from "@google/genai";

const SYSTEM_INSTRUCTION = `
You are 'Stylus AI', the premier digital concierge for Stylus, a luxury fashion rental platform. 
Your tone is sophisticated, elegant, warm, and professional. 
Your goal is to assist users in finding the perfect outfit from our high-end collection.
Our brand colors are Espresso, Golden Orange, and Cream. Our vibes are Royalty, Authenticity, and Timeless Excellence.
We carry brands like Chanel, Tom Ford, Alexander McQueen, Patek Philippe, etc.

When advising:
1. Be concise but polite.
2. Suggest items based on occasions (Galas, Weddings, Business, Date Night).
3. If asked about prices, emphasize "Slay Without Pay" - high value for low rental cost.
4. Do not make up specific item IDs, but describe items that would fit the user's request generally (e.g., "A velvet tuxedo would suit you well").
`;

// Helper to safely get the API key without crashing if 'process' is undefined
const getApiKey = () => {
  try {
    return process.env.API_KEY;
  } catch (e) {
    console.warn("API Key not found in environment.");
    return undefined;
  }
};

let aiInstance: GoogleGenAI | null = null;

const getAiClient = () => {
  if (!aiInstance) {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("API Key is missing. Please check your configuration.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const getStylingAdvice = async (userMessage: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    return response.text || "I apologize, I am currently consulting with our head stylists. Please try again in a moment.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am unable to access the styling archives at this moment. Please ensure your concierge connection (API Key) is active.";
  }
};

export const getRecommendations = async (searchHistory: string[], browsingContext: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `
            User Search History: ${searchHistory.join(', ')}
            Current Context: ${browsingContext}
            
            Based on the user's search history and luxury fashion trends, suggest 3 specific types of items (e.g., "Vintage Chanel Clutch", "Velvet Tuxedo") they might like. 
            Format as a concise, elegant list. Do not explain, just list.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: { temperature: 0.5 }
        });
        return response.text || "Curated selections just for you.";
    } catch (e) {
        return "Timeless classics selected for your taste.";
    }
};

export const getDeliveryEstimate = async (userLocation: string, productLocation: string): Promise<string> => {
    try {
        const ai = getAiClient();
        const prompt = `Estimate delivery time from ${productLocation} to ${userLocation} for a premium courier. Return ONLY the range (e.g. "1-2 Business Days").`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text?.trim() || "2-3 Business Days";
    } catch (e) {
        return "2-3 Business Days";
    }
};

export const checkRentalThreshold = (rentalCount: number): boolean => {
    // AI Monitoring logic rule
    return rentalCount >= 5;
};