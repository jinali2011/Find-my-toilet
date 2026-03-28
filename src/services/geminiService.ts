import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface GeneratedRestroom {
  name: string;
  latitude: number;
  longitude: number;
  type: 'public' | 'commercial' | 'paid';
  is_accessible: boolean;
  has_baby_changing: boolean;
  is_gender_neutral: boolean;
  is_free: boolean;
  access_type: 'open' | 'customer' | 'key';
  description: string;
}

export async function searchRestroomsInArea(lat: number, lng: number): Promise<GeneratedRestroom[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find real, publicly accessible restrooms, toilets, or washrooms near coordinates ${lat}, ${lng}. 
      Include restrooms in cafes, malls, parks, and public buildings. 
      Return a list of real places with their exact coordinates.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              latitude: { type: Type.NUMBER },
              longitude: { type: Type.NUMBER },
              type: { type: Type.STRING, enum: ['public', 'commercial', 'paid'] },
              is_accessible: { type: Type.BOOLEAN },
              has_baby_changing: { type: Type.BOOLEAN },
              is_gender_neutral: { type: Type.BOOLEAN },
              is_free: { type: Type.BOOLEAN },
              access_type: { type: Type.STRING, enum: ['open', 'customer', 'key'] },
              description: { type: Type.STRING }
            },
            required: ['name', 'latitude', 'longitude', 'type', 'is_accessible', 'has_baby_changing', 'is_gender_neutral', 'is_free', 'access_type']
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error searching restrooms with Gemini:', error);
    return [];
  }
}
