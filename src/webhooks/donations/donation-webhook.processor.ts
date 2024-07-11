import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PrismaService } from 'src/common/data/prisma.service';
import { CreateEmailPayload, EmailService } from 'src/email/email.service';

@Processor('donation-challenge-reward')
export class ChallengeRewardProcessor {
  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
  ) {}

  @Process('challenge-reward')
  async handleChallengeRewardEmail(job: Job) {}
}
