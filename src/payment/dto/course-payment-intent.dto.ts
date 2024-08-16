import { UserCourse } from '@prisma/client';
import { PaymentEntity } from 'src/common/constants/constants';
import { ConvertToStrings } from 'src/common/utils/convert-type-to-string';

export type CoursePaymentIntentDto = {
  courseId: string;
  appliedVoucherId?: string;
};

export type CoursePaymentMetadata = Pick<UserCourse, 'courseId' | 'userId'> & {
  paymentEntity: PaymentEntity;
  appliedVoucherId?: string;
};
export type CoursePaymentMetadataAsStrings =
  ConvertToStrings<CoursePaymentMetadata>;
