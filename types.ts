
export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Transaction {
  id: string;
  amount: number;
  category: string;
  description: string;
  type: TransactionType;
  date: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface AIInsight {
  summary: string;
  savingTips: string[];
  investmentAdvice: {
    instrument: string;
    description: string;
    riskLevel: 'Low' | 'Medium' | 'High';
  }[];
}

export interface GoogleUser {
  name: string;
  email: string;
  picture: string;
  accessToken: string;
  spreadsheetId: string | null;
  isGuest?: boolean;
}

export enum AppTab {
  DASHBOARD = 'dashboard',
  TRANSACTIONS = 'transactions',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  AI_ADVISOR = 'ai_advisor'
}
