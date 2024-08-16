import { Process, Processor } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from 'src/common/data/prisma.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Processor('vouchers')
export class VouchersWebhookProcessor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationService: NotificationsService,
  ) {}

  @Process('voucher-notification')
  async handleVoucherNotification(job: Job) {
    console.log('voucher queue job: ', job);
    const { data: jobData } = job;
    const { voucherId = null } = jobData;
    if (!voucherId) {
      console.log('no voucher id found in job data');
      return;
    }
    const voucher = await this.prisma.voucher.findFirst({
      where: {
        id: voucherId,
      },
      include: {
        course: true,
      },
    });
    await this.notificationService.createVoucherNotification({
      actorId: voucher.course.instructorId,
      courseId: voucher.courseId,
    });
  }
}
