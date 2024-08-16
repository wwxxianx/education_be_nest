import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CourseCategory } from '@prisma/client';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class CourseCategoriesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Result<CourseCategory[]>> {
    const cachedData: CourseCategory[] = await this.cacheService.get(redisConstants.COURSE_CATEGORY_KEY);
    if (cachedData) {
      return { data: cachedData, error: null };
    }
    const data = await this.prisma.courseCategory.findMany({
      include: {
        subcategories: true,
      },
    });
    await this.cacheService.set(redisConstants.COURSE_CATEGORY_KEY, data, redisConstants.COURSE_CATEGORY_TTL);
    return { data };
    try {
    } catch (e) {
      return { error: 'Failed to fetch categories', data: null };
    }
  }
}
