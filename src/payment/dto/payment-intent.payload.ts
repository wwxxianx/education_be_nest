export type PaymentIntentPayload = {
    amount: number;
    stripeConnectAccountId?: string;
    transferGroupId?: string;
  };