export interface UserData {
  id: string;
  name: string;
  email: string;
  balance: number;
  createdAt: Date;
}

export interface TransactionData {
  id: string;
  amount: number;
  description: string;
  type: 'CREDIT' | 'DEBIT';
  status: string;
  createdAt: Date;
  processedAt?: Date;
  senderUserId: string;
  receiverUserId: string;
}

export interface MonthlySummary {
  income: number;
  expenses: number;
  balance: number;
  transactionCount: number;
}

export interface SpendingTrend {
  month: string;
  expenses: number;
  change?: number;
}

export interface LimitsUsage {
  dailyUsed: number;
  dailyLimit: number;
  monthlyUsed: number;
  monthlyLimit: number;
}
