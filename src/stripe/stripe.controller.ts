import {
  Body,
  Controller,
  Get,
  HttpCode,
  InternalServerErrorException,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'src/common/data/prisma.service';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { CreateOnboardUpdateLinkDto } from './dto/create-onboard-update-link.dto';
import { StripeService } from './stripe.service';

@Controller('payment')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('connected-account/:id')
  async getConnectAccountDetails(@Param('id') connectAccountId: string) {
    const account =
      await this.stripeService.getConnectAccountDetails(connectAccountId);
    return account;
  }

  @Post('onboard-account')
  async onboardConnectAccount(@Body() onboardAccountDto: OnboardAccountDto) {
    const { data, error } = await this.stripeService.onboardConnectAccount(
      onboardAccountDto.accountId,
    );
    if (error) {
    }
    return data;
  }

  @Post('onboard-update')
  async createOnboardUpdateLink(
    @Body() createOnboardUpdateLink: CreateOnboardUpdateLinkDto,
  ) {
    const { data, error } = await this.stripeService.onboardUpdateAccount(
      createOnboardUpdateLink.stripeConnectAccountId,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('connect-account')
  async createConnectAccount(@GetCurrentUserId() userId: string) {
    const { data: accountRes, error: accountError } =
      await this.stripeService.createConnectAccount(userId);
    if (accountError) {
      throw new InternalServerErrorException(accountError);
    }
    // Save to user record
    // await this.prisma.user.update({
    //   where: {
    //     id: userId,
    //   },
    //   data: {
    //     stripeConnectId: accountRes.account,
    //   },
    // });
    const { data: onboardRes, error: onboardError } =
      await this.stripeService.onboardConnectAccount(accountRes.account);
    if (onboardError) {
      throw new InternalServerErrorException(accountError);
    }
    return onboardRes;
  }

  async handleStripeWebhook(
    eventObjectIdentifier: string,
    paymentIntentMetadata
  ) {
    switch (paymentIntentMetadata.paymentEntity) {
      
    }
  }

  @Post('stripe-webhook')
  @HttpCode(200)
  async paymentWebhook(@Req() request: Request) {
    console.log('webhook request: ', request);
    console.log('webhook body: ', request.body);
    const event = request.body;
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const metadata = paymentIntent.metadata as any;
        await this.handleStripeWebhook(paymentIntent?.id ?? '', metadata);
        break;
      case 'transfer.created':
        const transferObj = event.data.object;
        const transferMetadata = transferObj.metadata as any;
        await this.handleStripeWebhook(transferObj?.id ?? '', transferMetadata);
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
        await this._hanleConnectAccountUpdatedEvent(
          accountUpdatedData,
          accountMetadata,
        );
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  }

  async _hanleConnectAccountUpdatedEvent(accountUpdatedData, accountMetadata) {
    const {
      id,
      charges_enabled,
      details_submitted,
      email,
      payouts_enabled,
      requirements,
    } = accountUpdatedData;
    let errorMessage;
    if (requirements?.errors) {
      const errors = requirements.errors;
      errorMessage = errors
        ?.map((error) => error?.reason ?? 'Unknown error')
        ?.join(',');
    } else {
      errorMessage = 'Bank account information not completed';
    }
    if (details_submitted && charges_enabled && payouts_enabled) {
      // Account no error
      errorMessage = null;
    }
    // await this.prisma.bankAccount.upsert({
    //   where: {
    //     id: id,
    //   },
    //   update: {
    //     error: errorMessage,
    //     detailsSubmitted: details_submitted,
    //     chargesEnabled: charges_enabled,
    //     email: email,
    //     payoutsEnabled: payouts_enabled,
    //   },
    //   create: {
    //     id: id,
    //     error: errorMessage ?? undefined,
    //     detailsSubmitted: details_submitted,
    //     chargesEnabled: charges_enabled,
    //     email: email,
    //     payoutsEnabled: payouts_enabled,
    //     user: {
    //       connect: {
    //         id: accountMetadata.userId,
    //       },
    //     },
    //   },
    // });
  }
}
