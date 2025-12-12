import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import {
  UserData,
  TransactionData,
  MonthlySummary,
  SpendingTrend,
  LimitsUsage,
} from './types/analytics.types';

@Injectable()
export class AnalyticsService {
  constructor(private readonly httpService: HttpService) {}

  async getUserDashboard(userId: string) {
    const [userData, transactionsData, balanceData] = await Promise.all([
      this.getUserData(userId),
      this.getRecentTransactions(userId),
      this.getBalanceData(userId),
    ]);

    return {
      user: userData,
      balance: balanceData,
      recentTransactions: transactionsData.slice(0, 5),
      monthlySummary: await this.calculateMonthlySummary(userId),
      spendingTrends: await this.calculateSpendingTrends(userId),
      limits: await this.getLimitsUsage(),
    };
  }

  async getTransactionSummary(
    userId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'month' | 'category',
  ) {
    const transactions = await this.getAllTransactions(userId, startDate, endDate);

    switch (groupBy) {
      case 'day':
        return this.groupByDay(transactions);
      case 'month':
        return this.groupByMonth(transactions);
      case 'category':
        return this.groupByCategory(transactions);
      default:
        return transactions;
    }
  }

  async getSpendingByCategory(userId: string) {
    const transactions = await this.getAllTransactions(
      userId,
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias
      new Date(),
    );

    // Categorização automática baseada em descrição
    const categories = this.getCategoriesMapping();

    const categorized = transactions.reduce(
      (acc, transaction) => {
        const category = this.categorizeTransaction(transaction.description, categories);
        if (!acc[category]) acc[category] = { total: 0, count: 0 };
        acc[category].total += parseFloat(transaction.amount.toString());
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>,
    );

    const totalSpent = Object.values(categorized).reduce(
      (sum: number, cat: { total: number; count: number }) => sum + cat.total,
      0,
    );

    return Object.entries(categorized).map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpent > 0 ? (data.total / totalSpent) * 100 : 0,
      trend: 'stable' as const, // TODO: implementar cálculo de tendência
    }));
  }

  private async getUserData(userId: string): Promise<UserData> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://users-service:3001/api/users/${userId}`),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  private async getRecentTransactions(userId: string): Promise<TransactionData[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `http://transactions-service:3002/api/transactions/user/${userId}?limit=10`,
        ),
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      return [];
    }
  }

  private async getBalanceData(userId: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://users-service:3001/api/users/${userId}/balance`),
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching balance data:', error);
      return { balance: 0 };
    }
  }

  private async getAllTransactions(
    userId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<TransactionData[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(
          `http://transactions-service:3002/api/transactions/user/${userId}?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=1000`,
        ),
      );
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
  }

  private categorizeTransaction(description: string, categories: Record<string, string[]>): string {
    const desc = description.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some((keyword: string) => desc.includes(keyword))) {
        return category;
      }
    }
    return 'Outros';
  }

  private groupByDay(transactions: TransactionData[]) {
    return transactions.reduce((acc, transaction) => {
      const day = new Date(transaction.createdAt).toISOString().split('T')[0];
      if (!acc[day]) acc[day] = { total: 0, count: 0, transactions: [] };
      acc[day].total += parseFloat(transaction.amount.toString());
      acc[day].count += 1;
      acc[day].transactions.push(transaction);
      return acc;
    }, {});
  }

  private groupByMonth(transactions: TransactionData[]) {
    return transactions.reduce((acc, transaction) => {
      const month = new Date(transaction.createdAt).toISOString().slice(0, 7);
      if (!acc[month]) acc[month] = { total: 0, count: 0, transactions: [] };
      acc[month].total += parseFloat(transaction.amount.toString());
      acc[month].count += 1;
      acc[month].transactions.push(transaction);
      return acc;
    }, {});
  }

  private groupByCategory(transactions: TransactionData[]) {
    const categories = this.getCategoriesMapping();
    return transactions.reduce((acc, transaction) => {
      const category = this.categorizeTransaction(transaction.description, categories);
      if (!acc[category]) acc[category] = { total: 0, count: 0, transactions: [] };
      acc[category].total += parseFloat(transaction.amount.toString());
      acc[category].count += 1;
      acc[category].transactions.push(transaction);
      return acc;
    }, {});
  }

  private getCategoriesMapping(): Record<string, string[]> {
    return {
      Alimentação: ['restaurante', 'mercado', 'supermercado', 'ifood', 'padaria', 'lanchonete'],
      Transporte: ['uber', 'taxi', 'combustivel', 'estacionamento', 'metro', 'onibus'],
      Lazer: ['cinema', 'teatro', 'show', 'evento', 'academia', 'esporte'],
      Saúde: ['farmacia', 'medico', 'dentista', 'hospital', 'plano', 'exame'],
      Educação: ['curso', 'livro', 'material', 'faculdade', 'escola'],
      Compras: ['shopping', 'loja', 'roupas', 'eletro', 'moveis'],
      Serviços: ['conta', 'luz', 'agua', 'telefone', 'internet', 'gas'],
      Outros: [],
    };
  }
  private async calculateMonthlySummary(userId: string): Promise<MonthlySummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const transactions = await this.getAllTransactions(userId, startOfMonth, now);

    const income = transactions
      .filter((t) => t.type === 'CREDIT' || t.receiverUserId === userId)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const expenses = transactions
      .filter((t) => t.type === 'DEBIT' || t.senderUserId === userId)
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: transactions.length,
    };
  }

  private async calculateSpendingTrends(userId: string): Promise<SpendingTrend[]> {
    const months: Date[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date);
    }

    const trends: SpendingTrend[] = [];
    for (let i = 0; i < months.length - 1; i++) {
      const startDate = new Date(months[i].getFullYear(), months[i].getMonth(), 1);
      const endDate = new Date(months[i + 1].getFullYear(), months[i + 1].getMonth(), 0);

      const transactions = await this.getAllTransactions(userId, startDate, endDate);
      const expenses = transactions
        .filter((t) => t.senderUserId === userId)
        .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

      trends.push({
        month: startDate.toISOString().slice(0, 7),
        expenses,
      });
    }

    return trends.map((trend, index) => {
      if (index > 0) {
        const previous = trends[index - 1];
        trend.change =
          previous.expenses > 0
            ? ((trend.expenses - previous.expenses) / previous.expenses) * 100
            : 0;
      }
      return trend;
    });
  }

  private async getLimitsUsage(): Promise<LimitsUsage> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`http://users-service:3001/api/limits/usage`),
      );
      return response.data;
    } catch (error) {
      return {
        dailyUsed: 0,
        dailyLimit: 1000,
        monthlyUsed: 0,
        monthlyLimit: 10000,
      };
    }
  }
}
