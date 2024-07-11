import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Language } from '@prisma/client';
import { Cache } from 'cache-manager';
import { PrismaService } from 'src/common/data/prisma.service';

@Injectable()
export class LanguagesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(): Promise<Result<Language[]>> {
    try {
      const cacheKey = 'categories';
      const cachedData = await this.cacheService.get(cacheKey);
      if (cachedData) {
        return { data: cachedData as Language[], error: null };
      }
      const data = await this.prisma.language.findMany();
      await this.cacheService.set(cacheKey, data);
      return { data };
    } catch (e) {
      return { error: 'Failed to fetch languages', data: null };
    }
  }
}
