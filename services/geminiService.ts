
import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, SavingsGoal, AIInsight } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const insightSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "Ringkasan mendalam tentang kesehatan keuangan pengguna saat ini.",
    },
    savingTips: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Strategi spesifik menabung (seperti 50/30/20) dan efisiensi biaya.",
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
      description: "Rekomendasi instrumen investasi yang dipersonalisasi.",
    },
  },
  required: ["summary", "savingTips", "investmentAdvice"],
};

export const getFinancialAdvice = async (
  transactions: Transaction[],
  goals: SavingsGoal[]
): Promise<AIInsight> => {
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Anda adalah penasihat keuangan (Financial Planner) bersertifikat. 
    Analisis data keuangan berikut dan berikan strategi "Wealth Management" dalam Bahasa Indonesia yang formal namun mudah dimengerti.
    
    Data Transaksi (Input):
    ${JSON.stringify(transactions)}
    
    Target Tabungan:
    ${JSON.stringify(goals)}
    
    Instruksi Khusus:
    1. Identifikasi surplus bulanan (Pemasukan dikurangi Pengeluaran).
    2. Jika ada surplus, sarankan alokasi investasi ke instrumen seperti Reksadana Indeks, Obligasi, atau Emas.
    3. Jika ada defisit atau surplus kecil, berikan tips hemat ekstrem pada kategori pengeluaran terbesar.
    4. Berikan saran spesifik mengenai "Dana Darurat" (Emergency Fund).
    5. Gunakan perspektif jangka panjang (5-10 tahun ke depan).
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

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as AIInsight;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
