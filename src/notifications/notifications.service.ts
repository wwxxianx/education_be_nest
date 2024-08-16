import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationType } from '@prisma/client';
import { PrismaService } from 'src/common/data/prisma.service';
import { VoucherNotificationDto } from './dto/create-notification.dto';


@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async createVoucherNotification(dto: VoucherNotificationDto) {
    const favoriteUsers = await this.prisma.userFavouriteCourse.findMany({
      where: {
        courseId: dto.courseId,
      },
      include: {
        user: true,
        course: true,
      },
    });
    if (!favoriteUsers) {
      return;
    }
    await this.prisma.notification.createMany({
      data: favoriteUsers.map((favorite) => {
        return {
          actorId: dto.actorId,
          description: `A new voucher applicable to your favorite course - ${favorite.course.title}`,
          title: `NEW Voucher for "${favorite.course.title}"`,
          entityId: favorite.courseId,
          receiverId: favorite.userId,
          type: NotificationType.COURSE_VOUCHER,
        };
      }),
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  async updateAsRead(id: string): Promise<Result<Notification>> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: id,
        },
        data: {
          isRead: true,
        },
      });
      return { data: notification, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update notification' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
