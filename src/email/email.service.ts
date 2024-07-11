import { Injectable } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';

export type CreateEmailPayload = {
  receiverEmail: string | string[];
  html: any;
  subject: string;
};

@Injectable()
export class EmailService {
  constructor(private readonly resendService: ResendService) {}

  async sendEmail(payload: CreateEmailPayload) {
    const { id } = await this.resendService.send({
      from: 'onboarding@resend.dev',
      to: payload.receiverEmail,
      subject: payload.subject,
      html: payload.html,
    });

    if (!id) {
      return { emailId: null, error: 'Failed to send mail' };
    }
    return { emailId: id ?? '', error: null };
  }
}
