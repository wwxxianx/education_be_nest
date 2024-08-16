import { Voucher } from '@prisma/client';

export type CreateVoucherDto = Pick<
  Voucher,
  'afterDiscountValue' | 'expiredAt' | 'stock' | 'title' | 'courseId'
>;
