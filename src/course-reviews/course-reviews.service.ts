import { Injectable } from '@nestjs/common';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { UpdateCourseReviewDto } from './dto/update-course-review.dto';
import { Prisma, UserReview } from '@prisma/client';
import { PrismaService } from 'src/common/data/prisma.service';
import { ApiParamConfig } from 'src/common/utils/api-param-config';

@Injectable()
export class CourseReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async findCourseReview(courseId: string) {
    const rating = await this.prisma.userReview.aggregate({
      _avg: {
        reviewRating: true,
      },
      where: {
        courseId: courseId,
      },
    });
    if (!rating._avg.reviewRating) {
      return 0;
    }
    return rating._avg.reviewRating;
  }

  async create(
    userId: string,
    createCourseReviewDto: CreateCourseReviewDto,
  ): Promise<Result<UserReview>> {
    try {
      const data = await this.prisma.userReview.create({
        data: {
          userId: userId,
          courseId: createCourseReviewDto.courseId,
          reviewContent: createCourseReviewDto.reviewContent,
          reviewRating: createCourseReviewDto.reviewRating,
        },
        include: {
          user: true,
        },
      });
      // Update rating
      const rating = await this.findCourseReview(
        createCourseReviewDto.courseId,
      );
      await this.prisma.course.update({
        where: {
          id: createCourseReviewDto.courseId,
        },
        data: {
          reviewRating: rating,
        },
      });
      return { data };
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === 'P2002') {
          return { data: null, error: 'You can only submit one review' };
        }
      }
      return { data: null, error: 'Failed to create review' };
    }
  }

  async findAll(
    courseId: string,
    config: ApiParamConfig,
  ): Promise<Result<UserReview[]>> {
    try {
      const data = await this.prisma.userReview.findMany({
        where: {
          courseId: courseId,
        },
        include: {
          user: true,
        },
        orderBy: {
          reviewRating: 'desc',
        },
        take: config.limit ?? undefined,
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to get course review' };
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} courseReview`;
  }

  update(id: number, updateCourseReviewDto: UpdateCourseReviewDto) {
    return `This action updates a #${id} courseReview`;
  }

  remove(id: number) {
    return `This action removes a #${id} courseReview`;
  }
}
