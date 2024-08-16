import { Injectable } from '@nestjs/common';
import {
  CreateUserVoucherDto,
  UpdateUserVoucherDto,
} from './dto/user-voucher.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { Prisma, UserVoucher } from '@prisma/client';
import { VoucherFilters } from 'src/users/types/filters';

@Injectable()
export class UserVouchersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    createUserVoucherDto: CreateUserVoucherDto,
  ): Promise<Result<UserVoucher>> {
    try {
      const { voucherId } = createUserVoucherDto;
      const voucher = await this.prisma.voucher.findUnique({
        where: {
          id: voucherId,
        },
      });
      console.log('Stock: ', voucher.stock);
      if (voucher.stock != null && voucher.stock < 1) {
        console.log('no stock');
        return { error: 'Voucher is already out of stock', data: null };
      }

      const data = await this.prisma.$transaction(async (tx) => {
        const data = await tx.userVoucher.create({
          data: {
            userId: userId,
            voucherId: createUserVoucherDto.voucherId,
          },
          include: {
            voucher: true,
          },
        });

        await tx.voucher.update({
          where: {
            id: voucherId,
          },
          data: {
            stock: voucher.stock - 1,
          },
        });

        return data;
      });

      return { data };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          return {
            error: 'One user cannot take the same voucher twice',
            data: null,
          };
        }
      }
    }
  }

  async findUserVouchers(
    userId: string,
    filters: VoucherFilters,
  ): Promise<Result<UserVoucher[]>> {
    try {
      const data = await this.prisma.userVoucher.findMany({
        where: {
          userId: userId,
          voucher:
            filters.isExpired == null
              ? undefined
              : {
                  OR: [
                    {
                      expiredAt: null,
                    },
                    {
                      expiredAt:
                        filters.isExpired == null
                          ? undefined
                          : filters.isExpired
                            ? {
                                lt: new Date(),
                              }
                            : { gte: new Date() },
                    },
                  ],
                },
        },
        include: {
          voucher: {
            include: {
              course: true,
            },
          },
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user vouchers' };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} userVoucher`;
  }

  update(id: number, updateUserVoucherDto: UpdateUserVoucherDto) {
    return `This action updates a #${id} userVoucher`;
  }

  remove(id: number) {
    return `This action removes a #${id} userVoucher`;
  }
}
