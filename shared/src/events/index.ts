import { BankingDetails } from '../types';

export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  version: string;
}

export interface UserBankingDetailsUpdatedEvent extends BaseEvent {
  eventType: 'user.banking-details.updated';
  payload: {
    userId: string;
    oldBankingDetails: BankingDetails;
    newBankingDetails: BankingDetails;
  };
}

export interface UserBalanceUpdatedEvent extends BaseEvent {
  eventType: 'user.balance.updated';
  payload: {
    userId: string;
    oldBalance: number;
    newBalance: number;
    reason: string;
  };
}

export interface TransactionCompletedEvent extends BaseEvent {
  eventType: 'transaction.completed';
  payload: {
    transactionId: string;
    senderUserId: string;
    receiverUserId: string;
    amount: number;
    description: string;
  };
}

export interface TransactionFailedEvent extends BaseEvent {
  eventType: 'transaction.failed';
  payload: {
    transactionId: string;
    senderUserId: string;
    receiverUserId: string;
    amount: number;
    reason: string;
  };
}

export interface NotificationRequestedEvent extends BaseEvent {
  eventType: 'notification.requested';
  payload: {
    userId: string;
    type: 'EMAIL' | 'SMS' | 'PUSH';
    template: string;
    data: Record<string, any>;
  };
}

export type DomainEvent =
  | UserBankingDetailsUpdatedEvent
  | UserBalanceUpdatedEvent
  | TransactionCompletedEvent
  | TransactionFailedEvent
  | NotificationRequestedEvent;

