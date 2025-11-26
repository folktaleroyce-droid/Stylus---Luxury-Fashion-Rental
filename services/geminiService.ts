import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const getStylingAdvice = async (userMessage: string): Promise<string> => {
  try {
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
    return "I am having trouble connecting to the styling mainframe. Please ensure your API key is valid.";
  }
};