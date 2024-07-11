import { User } from '@prisma/client';

export type UpdateUserDto = Partial<Pick<
User,
"fullName" | "isOnboardingCompleted"
>>;
