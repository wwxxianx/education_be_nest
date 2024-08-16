import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { VouchersWebhookController } from './vouchers-webhook.controller';
import { VouchersWebhookProcessor } from './vouchers-webhook.processor';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'vouchers',
    }),
    NotificationsModule,
  ],
  controllers: [VouchersWebhookController],
  providers: [VouchersWebhookProcessor],
})
export class VouchersWebhookModule {}
