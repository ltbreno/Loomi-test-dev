import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { UsersProxyController } from './users-proxy.controller';
import { TransactionsProxyController } from './transactions-proxy.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [UsersProxyController, TransactionsProxyController],
})
export class ProxyModule {}
