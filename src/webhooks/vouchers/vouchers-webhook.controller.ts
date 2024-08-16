import { InjectQueue } from '@nestjs/bull';
import { Controller, Post, Req } from '@nestjs/common';
import { Queue } from 'bull';
import { Request } from 'express';

type VoucherJobPayload = {
  voucherId: string;
};

@Controller('webhooks/vouchers')
export class VouchersWebhookController {
  constructor(@InjectQueue('vouchers') private readonly vouchersQueue: Queue) {}

  @Post('')
  async handleVoucherTask(@Req() request: Request) {
    console.log('webhook voucher req', request);
    if (request.body.type !== 'INSERT') {
      return;
    }
    const dbRecord = request.body.record as any;
    const { id: voucherId } = dbRecord;
    const jobPayload: VoucherJobPayload = {
      voucherId,
    };
    console.log('voucher webhook jobPayload:', jobPayload);
    await this.vouchersQueue.add('voucher-notification', jobPayload);
  }
}
