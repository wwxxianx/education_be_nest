import { UserVoucher } from "@prisma/client";

export type CreateUserVoucherDto = Pick<UserVoucher, "voucherId">;
export type UpdateUserVoucherDto = {};