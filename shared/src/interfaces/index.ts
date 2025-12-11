// Abstract service interfaces (not implemented)

export interface INotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSMS(to: string, message: string): Promise<void>;
  sendPushNotification(userId: string, title: string, body: string): Promise<void>;
}

export interface IAnalyticsService {
  trackEvent(eventName: string, properties: Record<string, any>): Promise<void>;
  trackTransaction(transactionId: string, amount: number, status: string): Promise<void>;
}

export interface IAuditService {
  logAction(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any>,
  ): Promise<void>;
}

export interface IFraudDetectionService {
  analyzeTransaction(
    userId: string,
    amount: number,
    destination: string,
  ): Promise<{ isFraudulent: boolean; riskScore: number; reason?: string }>;
}

