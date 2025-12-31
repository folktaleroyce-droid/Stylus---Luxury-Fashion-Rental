
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

/**
 * Creates a fresh instance of the Gemini API client.
 * Refactored to use process.env.API_KEY directly as per guidelines.
 */
const getAi = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getStylingAdvice = async (userMessage: string): Promise<string> => {
  try {
    const ai = getAi();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency
      },
    });

    return response.text || "I apologize, I am currently consulting with our head stylists. Please try again in a moment.";
  } catch (error) {
    console.error("Gemini Connection Error:", error);
    return "I am unable to access the styling archives at this moment. Please ensure your concierge connection is active and try again.";
  }
};

export const generateShareCaption = async (productName: string, brand: string): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `Write a short, sophisticated social media caption (Instagram style) for someone wearing the ${productName} by ${brand}. 
    The brand vibe is 'Wear Royalty Without Cost'. Use elegant language and 2-3 luxury-themed hashtags. Return ONLY the caption text.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        temperature: 0.8,
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency
      }
    });
    return response.text?.trim() || `Adorning myself in ${brand} elegance. Wear Royalty Without Cost. #StylusLuxury #VirtualTryOn #Royalty`;
  } catch (e) {
    console.error("Caption Generation Error:", e);
    return `Adorning myself in ${brand} elegance. Wear Royalty Without Cost. #StylusLuxury #VirtualTryOn #Royalty`;
  }
};

export const getRecommendations = async (searchHistory: string[], browsingContext: string): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `
        User Search History: ${searchHistory.join(', ')}
        Current Context: ${browsingContext}
        
        Based on the user's search history and luxury fashion trends, suggest 3 specific types of items (e.g., "Vintage Chanel Clutch", "Velvet Tuxedo") they might like. 
        Format as a concise, elegant list. Do not explain, just list.
    `;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        temperature: 0.5,
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency
      }
    });
    return response.text || "Curated selections just for you.";
  } catch (e) {
    return "Timeless classics selected for your taste.";
  }
};

export const getDeliveryEstimate = async (userLocation: string, productLocation: string): Promise<string> => {
  try {
    const ai = getAi();
    const prompt = `Estimate delivery time from ${productLocation} to ${userLocation} for a premium courier. Return ONLY the range (e.g. "1-2 Business Days").`;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency
      }
    });
    return response.text?.trim() || "2-3 Business Days";
  } catch (e) {
    return "2-3 Business Days";
  }
};

export const checkRentalThreshold = (rentalCount: number): boolean => {
  return rentalCount >= 5;
};
