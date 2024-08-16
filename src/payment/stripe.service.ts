import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateStripeCustomerPayload } from './dto/create-stripe-customer.payload';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateTransferPayload } from './dto/create-transfer.payload';
import { PaymentIntentPayload } from './dto/payment-intent.payload';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(
    @Inject('STRIPE_SECRET_KEY') private readonly apiKey: string,
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.stripe = new Stripe(this.apiKey, {
      apiVersion: '2024-04-10', // Use whatever API latest version
    });
  }

  async createTransfer(
    payload: CreateTransferPayload,
    metadata: any,
  ): Promise<Result<boolean>> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: payload.amount * 100,
        currency: 'myr',
        destination: payload.destinationAccountId,
        transfer_group: payload.transferGroupId,
        metadata,
      });
      return { data: true, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to create Stripe transfer' };
    }
  }

  async getConnectAccountDetails(
    userId: string,
  ): Promise<Result<Stripe.Response<Stripe.Account>>> {
    try {
      const userBankAccount = await this.prisma.bankAccount.findUnique({
        where: {
          userId: userId,
        },
      });
      if (!userBankAccount) {
        return { data: null };
      }
      const account = await this.stripe.accounts.retrieve(
        userBankAccount?.stripeConnectAccountId,
      );
      return { data: account };
    } catch (e) {
      if (e?.raw?.code === 'account_invalid') {
        return { error: 'Failed to fetch connected account', data: null };
      }
      return { error: 'Failed to fetch connected account', data: null };
    }
  }

  async testPayment() {
    const connectAccountId = 'acct_1PMlpIIer2iU8p47';
    const customer = await this.stripe.customers.create({
      stripeAccount: connectAccountId,
    });

    const ephemeralKey = await this.stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: '2024-04-10', stripeAccount: connectAccountId },
    );
    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        amount: 1099,
        currency: 'myr',
        customer: customer.id,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        stripeAccount: connectAccountId,
      },
    );
    return {
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
    };
  }

  async onboardUpdateAccount(
    userId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      const userBankAccount = await this.prisma.bankAccount.findUnique({
        where: {
          userId: userId,
        },
      });
      if (userBankAccount == null) {
        return await this.onboardConnectAccount(userId);
      }
      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create({
          account: userBankAccount.stripeConnectAccountId,
          // Provide Flutter app URL
          return_url: `${this.configService.get('APP_LINK_DOMAIN')}/home`,
          refresh_url: `${this.configService.get('APP_LINK_DOMAIN')}/stripe-onboard-refresh`,
          type: 'account_onboarding',
        });

      return { data: { onboardLink: onboardLink.url } };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account link:',
        error,
      );
      return {
        error:
          'An error occurred when calling the Stripe API to create an account link',
        data: null,
      };
    }
  }

  async onboardConnectAccount(
    userId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      const { data, error } = await this._createConnectAccount(userId);
      if (error) {
        return { data: null, error: 'Failed to create stripe account' };
      }
      // Save to user record
      await this.prisma.bankAccount.upsert({
        where: {
          userId: userId,
        },
        create: {
          stripeConnectAccountId: data.account,
          userId: userId,
        },
        update: {
          stripeConnectAccountId: data.account,
        },
      });

      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create({
          account: data.account,
          // Provide Flutter app URL
          return_url: `${this.configService.get('APP_LINK_DOMAIN')}/home`,
          refresh_url: `${this.configService.get('APP_LINK_DOMAIN')}/stripe-onboard-refresh`,
          type: 'account_onboarding',
        });

      return { data: { onboardLink: onboardLink.url } };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account link:',
        error,
      );
      return {
        error:
          'An error occurred when calling the Stripe API to create an account link',
        data: null,
      };
    }
  }

  async _createConnectAccount(
    userId: string,
  ): Promise<Result<{ account: string }>> {
    try {
      const account = await this.stripe.accounts.create({
        controller: {
          fees: {
            payer: 'account',
          },
        },
        metadata: {
          userId: userId,
        },
      });

      return {
        data: { account: account.id },
        error: null,
      };
    } catch (error) {
      console.error(
        'An error occurred when calling the Stripe API to create an account',
        error,
      );
      return { data: null, error: 'Failed to create account on Stripe' };
    }
  }

  async getCustomers() {
    const customers = await this.stripe.customers.list({});
    return customers.data;
  }

  async createCustomer(
    userId: string,
    customer: CreateStripeCustomerPayload,
    stripeConnectedAccountId?: string,
  ) {
    const stripeConnectAccount = stripeConnectedAccountId
      ? {
          stripeAccount: stripeConnectedAccountId,
        }
      : null;
    const stripeCustomer = await this.stripe.customers.create(
      {
        name: customer.name,
        email: customer.email,
      },
      stripeConnectAccount,
    );
    return stripeCustomer;
  }

  async createPaymentIntent(
    userId: string,
    createPaymentIntentPayload: PaymentIntentPayload,
    metadata?: any,
  ) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
    const stripeConnectAccount =
      createPaymentIntentPayload.stripeConnectAccountId
        ? {
            stripeAccount: createPaymentIntentPayload.stripeConnectAccountId,
          }
        : null;
    const customer = await this.stripe.customers.create(
      {
        email: user.email,
        name: user.fullName,
      },
      stripeConnectAccount,
    );
    const ephemeralKey = await this.stripe.ephemeralKeys.create(
      { customer: customer.id },
      {
        apiVersion: '2024-04-10',
        stripeAccount:
          createPaymentIntentPayload.stripeConnectAccountId ?? null,
      },
    );
    const paymentIntent = await this.stripe.paymentIntents.create(
      {
        // For Stripe MYR currency standard
        amount: createPaymentIntentPayload.amount,
        currency: 'myr',
        customer: customer.id,
        // In the latest version of the API, specifying the `automatic_payment_methods` parameter
        // is optional because Stripe enables its functionality by default.
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: metadata,
        transfer_group: createPaymentIntentPayload.transferGroupId,
      },
      stripeConnectAccount,
    );
    return {
      customer: customer.id,
      clientSecret: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
      stripeAccountId: createPaymentIntentPayload.stripeConnectAccountId,
    };
  }
}
