import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      clientId: this.configService.get('KAFKA_CLIENT_ID') || 'users-service',
      brokers: this.configService.get('KAFKA_BROKERS')?.split(',') || ['localhost:9092'],
    });

    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    console.log('✅ Kafka Producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    console.log('🔌 Kafka Producer disconnected');
  }

  async send(topic: string, message: { key: string; value: string }) {
    try {
      await this.producer.send({
        topic,
        messages: [message],
      });
    } catch (error) {
      console.error('Error sending message to Kafka:', error);
      throw error;
    }
  }
}
