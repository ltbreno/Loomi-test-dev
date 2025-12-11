import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaConsumerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID') || 'transactions-service',
      brokers: this.configService.get('KAFKA_BROKERS')?.split(',') || ['localhost:9092'],
    });

    this.consumer = this.kafka.consumer({
      groupId: this.configService.get('KAFKA_GROUP_ID') || 'transactions-service-group',
    });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topics: ['user-events'], fromBeginning: false });

    await this.consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        await this.handleMessage(payload);
      },
    });

    console.log('✅ Kafka Consumer connected and listening');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    console.log('🔌 Kafka Consumer disconnected');
  }

  private async handleMessage({ topic, partition, message }: EachMessagePayload) {
    const event = JSON.parse(message.value?.toString() || '{}');

    console.log(`📨 Received event from ${topic}:`, {
      eventType: event.eventType,
      partition,
      offset: message.offset,
    });

    // Handle different event types
    switch (event.eventType) {
      case 'user.banking-details.updated':
        await this.handleBankingDetailsUpdated(event);
        break;
      case 'user.balance.updated':
        await this.handleBalanceUpdated(event);
        break;
      default:
        console.log(`Unhandled event type: ${event.eventType}`);
    }
  }

  private async handleBankingDetailsUpdated(event: any) {
    // Log the event for audit purposes
    console.log(`User ${event.payload.userId} updated banking details`);
    // In a real scenario, you might want to validate pending transactions
  }

  private async handleBalanceUpdated(event: any) {
    // Log the event for monitoring
    console.log(
      `User ${event.payload.userId} balance updated: ${event.payload.oldBalance} -> ${event.payload.newBalance}`,
    );
  }
}
