import {
  BadRequestException,
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
import {
  CoursePaymentIntentDto,
  CoursePaymentMetadata,
} from './dto/course-payment-intent.dto';
import { PaymentIntentPayload } from './dto/payment-intent.payload';

@Controller('payment')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('intent/course')
  @UseGuards(AccessTokenGuard)
  async createCoursePaymentIntent(
    @GetCurrentUserId() userId: string,
    @Body() dto: CoursePaymentIntentDto,
  ) {
    let amount: number;
    const course = await this.prisma.course.findUnique({
      where: {
        id: dto.courseId,
      },
      include: {
        instructor: {
          include: {
            bankAccount: true,
          },
        },
      },
    });
    if (dto.appliedVoucherId) {
      const voucher = await this.prisma.userVoucher.findUnique({
        where: {
          userId_voucherId: {
            voucherId: dto.appliedVoucherId,
            userId: userId,
          },
        },
        include: {
          voucher: true,
        },
      });
      if (voucher.usedAt || voucher.appliedCourseId) {
        throw new BadRequestException("Voucher already used");
      }
      amount = voucher.voucher.afterDiscountValue;
    } else {
      amount = course.price;
    }
    const paymentIntentPayload: PaymentIntentPayload = {
      amount: amount,
      stripeConnectAccountId:
        course.instructor.bankAccount.stripeConnectAccountId,
    };
    const metadata: CoursePaymentMetadata = {
      courseId: dto.courseId,
      userId: userId,
      paymentEntity: 'purchase_course',
      appliedVoucherId: dto.appliedVoucherId,
    };
    return await this.stripeService.createPaymentIntent(userId, paymentIntentPayload, metadata);
  }

  @Get('connected-account')
  @UseGuards(AccessTokenGuard)
  async getConnectAccountDetails(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.stripeService.getConnectAccountDetails(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  // @Post('onboard-account')
  // async onboardConnectAccount(@Body() onboardAccountDto: OnboardAccountDto) {
  //   const { data, error } = await this.stripeService.onboardConnectAccount(
  //     onboardAccountDto.accountId,
  //   );
  //   if (error) {
  //   }
  //   return data;
  // }

  @Post('onboard-update')
  @UseGuards(AccessTokenGuard)
  async createOnboardUpdateLink(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.stripeService.onboardUpdateAccount(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Post('connect-account')
  async createConnectAccount(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.stripeService.onboardConnectAccount(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  async handleStripeWebhook(
    eventObjectIdentifier: string,
    paymentIntentMetadata,
  ) {
    switch (paymentIntentMetadata.paymentEntity) {
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
