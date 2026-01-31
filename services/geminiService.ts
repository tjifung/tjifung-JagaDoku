
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SavingsGoal, AIInsight } from "../types";

// Fix: Use process.env.API_KEY directly as required by guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const insightSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Ringkasan kondisi keuangan pengguna saat ini.",
    },
    savingTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Tips spesifik untuk menabung berdasarkan pola pengeluaran.",
    },
    investmentAdvice: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          instrument: { type: Type.STRING },
          description: { type: Type.STRING },
          riskLevel: { type: Type.STRING },
        },
        required: ["instrument", "description", "riskLevel"],
      },
      description: "Rekomendasi instrumen investasi yang cocok.",
    },
  },
  required: ["summary", "savingTips", "investmentAdvice"],
};

export const getFinancialAdvice = async (
  transactions: Transaction[],
  goals: SavingsGoal[]
): Promise<AIInsight> => {
  // Fix: Use gemini-3-pro-preview for complex reasoning and financial advice tasks
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Analisis data keuangan berikut dan berikan saran finansial profesional dalam Bahasa Indonesia.
    
    Data Transaksi:
    ${JSON.stringify(transactions)}
    
    Tujuan Menabung:
    ${JSON.stringify(goals)}
    
    Tugas Anda:
    1. Berikan ringkasan singkat tentang kesehatan keuangan.
    2. Berikan 3-5 tips praktis menabung berdasarkan pengeluaran terbesar.
    3. Rekomendasikan 2-3 instrumen investasi (seperti Reksadana, Saham, atau Emas) yang sesuai dengan surplus bulanan mereka.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: insightSchema,
      },
    });

    // Fix: Access .text property directly
    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIInsight;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
