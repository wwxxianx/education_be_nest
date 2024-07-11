import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CourseCategory } from '@prisma/client';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class CourseCategoriesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Result<CourseCategory[]>> {
    try {
      const cacheKey = 'categories';
      const cachedData: CourseCategory[] = await this.cacheService.get(cacheKey);
      if (cachedData && cachedData.length) {
        return { data: cachedData, error: null };
      }
      const data = await this.prisma.courseCategory.findMany({
        include: {
          subcategories: true,
        },
      });
      await this.cacheService.set(cacheKey, data);
      return { data };
    } catch (e) {
      return { error: 'Failed to fetch categories', data: null };
    }
  }
}
