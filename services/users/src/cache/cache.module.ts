import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'CACHE_MANAGER',
      useFactory: async (configService: ConfigService) => {
        const { caching } = await import('cache-manager');

        const ttl = parseInt(configService.get('REDIS_TTL') || '3600', 10);

        // Usando cache em memória por enquanto devido a incompatibilidades
        // do cache-manager-redis-store com cache-manager v5
        // TODO: Migrar para Redis quando atualizar cache-manager para v6
        console.log('📦 Usando cache em memória (TTL: ' + ttl + 's)');
        return caching('memory', {
          ttl: ttl > 0 ? ttl : 3600,
          max: 1000,
        });
      },
      inject: [ConfigService],
    },
    CacheService,
  ],
  exports: ['CACHE_MANAGER', CacheService],
})
export class CacheModule {}
