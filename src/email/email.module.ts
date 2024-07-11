import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { BullModule } from '@nestjs/bull';
import { ResendModule } from 'nestjs-resend';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ResendModule.forAsyncRoot({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configServie: ConfigService) => {
        return {
          apiKey: configServie.get('RESEND_API_KEY'),
        }
      },
    }),
  ],
  providers: [EmailService],
})
export class EmailModule {}
