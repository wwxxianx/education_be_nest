import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CourseLevel } from '@prisma/client';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class CourseLevelsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Result<CourseLevel[]>> {
    try {
      const cacheKey = 'course-levels';
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        return { data: cachedData as CourseLevel[], error: null };
      }
      const data = await this.prisma.courseLevel.findMany();
      await this.cacheService.set(cacheKey, data);
      return { data };
    } catch (e) {
      return { error: 'Failed to fetch categories', data: null };
    }
  }
}
