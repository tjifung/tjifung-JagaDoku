
import { Transaction, SavingsGoal } from "../types";

const GOOGLE_SHEETS_API_BASE = "https://sheets.googleapis.com/v4/spreadsheets";

export const createUserSpreadsheet = async (accessToken: string): Promise<string> => {
  const response = await fetch(GOOGLE_SHEETS_API_BASE, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        title: `JagaDoku - Data Finansial Saya`,
      },
      sheets: [
        { properties: { title: "Transaksi" } },
        { properties: { title: "Tabungan" } }
      ]
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "Gagal membuat spreadsheet");
  return data.spreadsheetId;
};

export const syncToGoogleSheets = async (
  accessToken: string,
  spreadsheetId: string,
  data: { transactions: Transaction[], goals: SavingsGoal[] }
) => {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  // 1. Update Sheet Transaksi
  const transactionRows = [
    ["ID", "Tanggal", "Deskripsi", "Kategori", "Tipe", "Jumlah"],
    ...data.transactions.map(t => [t.id, t.date, t.description, t.category, t.type, t.amount])
  ];

  await fetch(`${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/Transaksi!A1?valueInputOption=RAW`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ values: transactionRows }),
  });

  // 2. Update Sheet Tabungan
  const goalRows = [
    ["ID", "Nama Target", "Target", "Terkumpul", "Deadline"],
    ...data.goals.map(g => [g.id, g.name, g.targetAmount, g.currentAmount, g.deadline])
  ];

  await fetch(`${GOOGLE_SHEETS_API_BASE}/${spreadsheetId}/values/Tabungan!A1?valueInputOption=RAW`, {
    method: "PUT",
    headers,
    body: JSON.stringify({ values: goalRows }),
  });

  return true;
};