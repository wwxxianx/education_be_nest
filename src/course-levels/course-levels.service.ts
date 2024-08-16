import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CourseLevel } from '@prisma/client';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class CourseLevelsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Result<CourseLevel[]>> {
    try {
      const cachedData = await this.cacheService.get(redisConstants.COURSE_LEVEL_KEY);
      if (cachedData) {
        return { data: cachedData as CourseLevel[], error: null };
      }
      const data = await this.prisma.courseLevel.findMany();
      await this.cacheService.set(redisConstants.COURSE_LEVEL_KEY, data, redisConstants.COURSE_LEVEL_TTL);
      return { data };
    } catch (e) {
      return { error: 'Failed to fetch categories', data: null };
    }
  }
}
