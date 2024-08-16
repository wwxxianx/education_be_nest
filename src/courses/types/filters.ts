import { CoursePublishStatus } from '@prisma/client';

export type CampaignFilters = {
  categoryIds: string[];
  languageIds?: string[];
  searchQuery?: string;
  levelIds: string[];
  isFree: boolean;
  status?: CoursePublishStatus;
  instructorId?: string;
  subcategoryIds?: string[];
};
