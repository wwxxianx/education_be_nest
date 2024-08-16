import { InjectQueue } from '@nestjs/bull';
import { Controller, HttpCode, Post, Req } from '@nestjs/common';
import { Queue } from 'bull';
import { Request } from 'express';
import { PaymentEntity } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { CoursePaymentMetadataAsStrings } from 'src/payment/dto/course-payment-intent.dto';

export type ChallengeRewardJobPayload = {
  donationId: string;
};

@Controller('webhooks/payment')
export class PaymentWebhookController {
  constructor(
    @InjectQueue('donation-challenge-reward')
    private readonly donationChallengeRewardQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  @Post('challenge-rewards')
  async handleDonationChallengeTask(@Req() request: Request) {
    if (request.body.type !== 'INSERT') {
      return;
    }
    /**
     * {
     *  id
     *  userId
     *  campaignId
     *  amount
     *  isAnonymous
     * }
     */
    const dbRecord = request.body.record as any;
    const { id: donationId } = dbRecord;
    const jobPayload: ChallengeRewardJobPayload = {
      donationId,
    };
    await this.donationChallengeRewardQueue.add('challenge-reward', jobPayload);
  }

  @Post()
  @HttpCode(200)
  async paymentWebhook(@Req() request: Request) {
    console.log('webhook request: ', request);
    console.log('webhook body: ', request.body);
    const event = request.body;
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata as any;
        await this._handleStripeWebhook(paymentIntent?.id ?? '', metadata);
        break;
      case 'transfer.created':
        const transferObj = event.data.object;
        const transferMetadata = transferObj.metadata as any;
        await this._handleStripeWebhook(
          transferObj?.id ?? '',
          transferMetadata,
        );
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        break;
      case 'payout.paid':
        const payoutIntent = event.data.object;
        const payoutMetadata = payoutIntent.metadata as any;
        break;
      // ... handle other event types
      case 'account.updated':
        const accountUpdatedData = event.data.object;
        const accountMetadata = accountUpdatedData.metadata as any;
        // await this._hanleConnectAccountUpdatedEvent(
        //   accountUpdatedData,
        //   accountMetadata,
        // );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  async _handleStripeWebhook(
    eventObjectIdentifier: string,
    paymentIntentMetadata: CoursePaymentMetadataAsStrings,
  ) {
    switch (paymentIntentMetadata.paymentEntity as PaymentEntity) {
      case 'gift_card': {
        break;
      }
      case 'purchase_course': {
        const metadata =
          paymentIntentMetadata as CoursePaymentMetadataAsStrings;
        const userCourse = await this.prisma.userCourse.create({
          data: {
            userId: metadata.userId,
            courseId: metadata.courseId,
          },
        });
        if (metadata.appliedVoucherId) {
          await this.prisma.userVoucher.update({
            where: {
              userId_voucherId: {
                userId: metadata.userId,
                voucherId: metadata.appliedVoucherId,
              },
            },
            data: {
              appliedCourseId: userCourse.id,
              usedAt: new Date(),
            },
          });
        }
        break;
      }
    }
  }
}
