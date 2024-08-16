import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { PaymentWebhookController } from './payment-webhook.controller';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'donation-challenge-reward',
    }),
  ],
  controllers: [PaymentWebhookController],
  providers: [],
})
export class PaymentWebhookModule {}
