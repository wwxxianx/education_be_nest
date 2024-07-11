import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { CreateStripeCustomerPayload } from './dto/create-stripe-customer.payload';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateTransferPayload } from './dto/create-transfer.payload';

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

  async getConnectAccountDetails(accountId: string) {
    const account = await this.stripe.accounts.retrieve(accountId);
    return account;
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
    accountId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      await this.stripe.subscriptions
      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create(
          {
            account: accountId,
            // Provide Flutter app URL
            return_url: `${this.configService.get('APP_LINK_DOMAIN')}/home`,
            refresh_url: `${this.configService.get('APP_LINK_DOMAIN')}/stripe-onboard-refresh`,
            type: 'account_onboarding',
          },
        );

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
    accountId: string,
  ): Promise<Result<{ onboardLink: string }>> {
    try {
      const onboardLink: Stripe.Response<Stripe.AccountLink> =
        await this.stripe.accountLinks.create({
          account: accountId,
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

  async createConnectAccount(
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
    metadata?: any,
  ) {
    // const user = await this.prisma.user.findUnique({
    //   where: {
    //     id: userId,
    //   },
    // });
    // const stripeCustomerPayload: CreateStripeCustomerPayload = {
    //   email: user.email,
    //   name: user.fullName,
    // };
    // const stripeCustomer = await this.createCustomer(
    //   stripeCustomerPayload,
    //   createPaymentIntentPayload.stripeConnectAccountId,
    // );

    // const stripeConnectAccount =
    //   createPaymentIntentPayload.stripeConnectAccountId
    //     ? {
    //         stripeAccount: createPaymentIntentPayload.stripeConnectAccountId,
    //       }
    //     : null;
    // const ephemeralKey = await this.stripe.ephemeralKeys.create(
    //   { customer: stripeCustomer.id },
    //   {
    //     apiVersion: '2024-04-10',
    //     stripeAccount:
    //       createPaymentIntentPayload.stripeConnectAccountId ?? null,
    //   },
    // );
    // const paymentIntent = await this.stripe.paymentIntents.create(
    //   {
    //     // For Stripe MYR currency standard
    //     amount: createPaymentIntentPayload.amount * 100,
    //     currency: 'myr',
    //     customer: stripeCustomer.id,
    //     // In the latest version of the API, specifying the `automatic_payment_methods` parameter
    //     // is optional because Stripe enables its functionality by default.
    //     automatic_payment_methods: {
    //       enabled: true,
    //     },
    //     metadata: metadata,
    //     transfer_group: createPaymentIntentPayload.transferGroupId,
    //   },
    //   stripeConnectAccount,
    // );

    // return {
    //   clientSecret: paymentIntent.client_secret,
    //   ephemeralKey: ephemeralKey.secret,
    //   customer: stripeCustomer.id,
    //   publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
    //   stripeAccountId: createPaymentIntentPayload.stripeConnectAccountId,
    // };
  }
}
