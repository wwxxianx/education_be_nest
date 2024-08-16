import { Voucher } from '@prisma/client';

export class CreateNotificationDto {}

export type VoucherNotificationDto = Pick<Voucher, 'courseId'> & {
  actorId: string;
};
