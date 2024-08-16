import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisConfig from './config/redis.config';
import { AlsModule } from './als.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './common/data/prisma.module';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-yet';
import { UsersModule } from './users/users.module';
import { StripeModule } from './payment/stripe.module';
import { PaymentWebhookModule } from './webhooks/payments/payment-webhook.module';
import { VouchersWebhookModule } from './webhooks/vouchers/vouchers-webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [redisConfig] }),
    AlsModule,
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('redis.host');
        const redisPort = configService.get('redis.port');
        const redisPassword = configService.get('redis.password');
        return {
          store: await redisStore.redisStore({
            socket: {
              host: redisHost,
              port: redisPort,
            },
            password: redisPassword,
          }),
        };
      },
    }),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('redis.host');
        const redisPort = configService.get('redis.port');
        const redisPassword = configService.get('redis.password');
        return {
          redis: {
            host: redisHost,
            port: redisPort,
            password: redisPassword,
          }
        }
      }
    }),
    AuthModule,
    PrismaModule,
    StripeModule.forRootAsync(),
    UsersModule,
    PaymentWebhookModule,
    VouchersWebhookModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
