import { Inject, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import {
  CourseInstructorProfile,
  Notification,
  NotificationType,
  Prisma,
  User,
  UserCourse,
  UserFavouriteCourse,
  UserVoucher,
} from '@prisma/client';
import { error, profile } from 'console';
import { CreateInstructorProfileDto } from './dto/instructor-profile.dto';
import { StorageService } from 'src/storage/storage.service';
import { storageConstants } from 'src/common/constants/constants';
import { VoucherFilters } from './types/filters';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { redisConstants } from 'src/common/constants/redis';
import { CourseProgressPayload } from './dto/course-progress.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findUserParticipatedCourse(
    userId: string,
    courseId: string,
  ): Promise<Result<UserCourse>> {
    try {
      const data = await this.prisma.userCourse.findFirst({
        where: {
          userId: userId,
          courseId: courseId,
        },
        include: {
          course: {
            include: {
              language: true,
              category: true,
              level: true,
              images: true,
              subcategories: true,
              instructor: true,
            },
          },
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user course' };
    }
  }

  async findUserParticipatedCourses(
    userId: string,
  ): Promise<Result<UserCourse[]>> {
    try {
      const data = await this.prisma.userCourse.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: {
            include: {
              language: true,
              category: true,
              level: true,
              images: true,
              subcategories: true,
              instructor: true,
            },
          },
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user courses' };
    }
  }

  async findAll(userName?: string, email?: string) {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          {
            fullName: userName
              ? {
                  contains: userName,
                  mode: 'insensitive',
                }
              : undefined,
          },
          {
            email: email
              ? {
                  contains: email,
                  mode: 'insensitive',
                }
              : undefined,
          },
        ],
      },
    });
  }

  async findOne(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: id,
        },
      });
      return { data: user, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user details' };
    }
  }

  async updateProfile(
    userId: string,
    updateUserDto: UpdateUserDto,
    profileImageFile?: Express.Multer.File,
  ): Promise<Result<User>> {
    let profileImageUrl: string | undefined = undefined;
    console.log('profileImageFile', profileImageFile);
    if (profileImageFile != null) {
      const profileImageFilePath = `profile-image/${userId}/${profileImageFile.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.USER_BUCKET,
        profileImageFilePath,
        profileImageFile.buffer,
        profileImageFile.mimetype,
      );
      if (error) {
        return { data: null, error: error };
      }
      profileImageUrl = data.publicUrl;
    }
    console.log(
      'preferenceCourseCategoryIds: ',
      updateUserDto.preferenceCourseCategoryIds,
    );
    const user = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName: updateUserDto.fullName?.length
          ? updateUserDto.fullName
          : undefined,
        isOnboardingCompleted:
          updateUserDto?.isOnboardingCompleted == null
            ? undefined
            : updateUserDto.isOnboardingCompleted,
        preference: updateUserDto?.preferenceCourseCategoryIds?.length
          ? {
              update: {
                favouriteCourseCategories: {
                  set: updateUserDto.preferenceCourseCategoryIds.map((id) => ({
                    id,
                  })),
                },
              },
            }
          : undefined,
        profileImageUrl: profileImageUrl ?? undefined,
      },
      include: {
        preference: {
          include: {
            favouriteCourseCategories: true,
          },
        },
      },
    });
    return { data: user, error: null };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to update user' };
    }
  }

  // Recommende course
  async findRecommendedCourseFromPurchaseHistory(userId: string) {
    const userLatestPurchase = await this.prisma.userCourse.findFirst({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 1,
      include: {
        course: {
          include: {
            subcategories: true,
            category: true,
          },
        },
      },
    });
    if (!userLatestPurchase) {
      return { data: [], error: null };
    }
    const recommendedCourses = await this.prisma.course.findMany({
      where: {
        AND: [
          {
            subcategories: {
              some: {
                id: {
                  in: userLatestPurchase.course.subcategories.map(
                    (category) => category.id,
                  ),
                },
              },
            },
          },
          {
            id: {
              not: userLatestPurchase.course.id,
            },
          },
        ],
      },
      include: {
        category: true,
        language: true,
        level: true,
        instructor: true,
        subcategories: true,
      },
    });
    return {
      data: {
        recommendedCourses: recommendedCourses,
        latestPurchase: userLatestPurchase.course,
      },
    };
  }

  async findRecommendedCourseFromPreference(userId: string) {
    const userPreference = await this.prisma.userPreference.findFirst({
      where: {
        userId: userId,
      },
      include: {
        favouriteCourseCategories: true,
      },
    });
    if (!userPreference) {
      return { data: [], error: null };
    }
    const recommendedCourse = await this.prisma.course.findMany({
      where: {
        categoryId: {
          in: userPreference.favouriteCourseCategories.map(
            (category) => category.id,
          ),
        },
      },
      include: {
        category: true,
        language: true,
        level: true,
        instructor: true,
        subcategories: true,
      },
    });
    return { data: recommendedCourse };
  }

  // Favourite
  async findUserFavouriteCourses(userId: string) {
    try {
      const key = `${redisConstants.USER_FAVOURITE_COURSE_KEY}:${userId}`;
      const cachedData = await this.cacheService.get(key);
      if (cachedData) {
        return { data: cachedData };
      }
      const data = await this.prisma.userFavouriteCourse.findMany({
        where: {
          userId: userId,
        },
        include: {
          course: {
            include: {
              category: true,
              instructor: true,
              level: true,
              language: true,
            },
          },
        },
      });
      await this.cacheService.set(
        key,
        data,
        redisConstants.USER_FAVOURITE_COURSE_TTL,
      );
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch favourite courses' };
    }
  }
  async updateUserFavouriteCourse(userId: string, courseId: string) {
    try {
      const key = `${redisConstants.USER_FAVOURITE_COURSE_KEY}:${userId}`;
      const favouriteCourseExist =
        await this.prisma.userFavouriteCourse.findFirst({
          where: {
            AND: [
              {
                userId: userId,
              },
              { courseId: courseId },
            ],
          },
        });
      let data;
      if (favouriteCourseExist) {
        // Delete
        data = await this.prisma.userFavouriteCourse.delete({
          where: {
            userId_courseId: {
              userId: userId,
              courseId: courseId,
            },
          },
          include: {
            course: {
              include: {
                category: true,
                instructor: true,
                level: true,
                language: true,
              },
            },
          },
        });
      } else {
        // Add new
        data = await this.prisma.userFavouriteCourse.create({
          data: {
            courseId: courseId,
            userId: userId,
          },
          include: {
            course: {
              include: {
                category: true,
                instructor: true,
                level: true,
                language: true,
              },
            },
          },
        });
      }

      return { data };
    } catch (e) {
      return { data: null, error: '' };
    }
  }

  // Instructor Profile
  async findUserInstructorProfile(
    userId,
  ): Promise<Result<CourseInstructorProfile>> {
    try {
      const data = await this.prisma.courseInstructorProfile.findFirst({
        where: {
          userId: userId,
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch insutrctor profile' };
    }
  }

  async createInstructorProfile(
    userId: string,
    dto: CreateInstructorProfileDto,
    profileImage?: Express.Multer.File,
  ): Promise<Result<CourseInstructorProfile>> {
    let profileImageUrl: string | undefined = undefined;
    if (profileImage) {
      const filePath = `${userId}/instructor`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.USER_BUCKET,
        filePath,
        profileImage.buffer,
        profileImage.mimetype,
      );
      if (error) {
        return {
          error: `Failed to upload profile image: ${error}`,
          data: null,
        };
      }
      profileImageUrl = data.publicUrl;
    }
    const data = await this.prisma.courseInstructorProfile.create({
      data: {
        userId: userId,
        fullName: dto.fullName,
        title: dto.title,
        profileImageUrl: profileImageUrl,
      },
    });
    return { data };
    try {
    } catch (e) {
      return { error: 'Failed to create instructor profile', data: null };
    }
  }

  // Notifiaction
  async findUserNotifications(
    userId?: string,
  ): Promise<Result<Notification[]>> {
    try {
      let formattedNotifications: Notification[] = [];
      const notifications = await this.prisma.notification.findMany({
        where: {
          receiverId: userId ?? undefined,
        },
        include: {
          actor: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      for (const notification of notifications) {
        if (
          notification.type === NotificationType.COURSE_UPDATE ||
          notification.type === NotificationType.COURSE_VOUCHER
        ) {
          const course = await this.prisma.course.findUnique({
            where: {
              id: notification.entityId,
            },
            include: {
              category: true,
              instructor: true,
              level: true,
              language: true,
            },
          });
          const formattedNotification = {
            ...notification,
            course: course,
          };
          formattedNotifications.push(formattedNotification);
          continue;
        }
        formattedNotifications.push(notification);
      }
      return { data: formattedNotifications };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user notifications' };
    }
  }

  async updateNotificationAsRead(id: string): Promise<Result<Notification>> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: id,
        },
        data: {
          isRead: true,
        },
        include: {
          actor: true,
        },
      });
      return { data: notification, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update notification' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async updateUserCourseProgress(payload: CourseProgressPayload) {
    try {
      const userCourse = await this.prisma.userCourse.findFirst({
        where: {
          userId: payload.userId,
          courseId: payload.courseId,
        },
      });
      let data: any = await this.prisma.courseProgress.upsert({
        where: {
          userCourseId_partId: {
            partId: payload.partId,
            userCourseId: userCourse.id,
          },
        },
        create: {
          partId: payload.partId,
          userCourseId: userCourse.id,
          startedAt: new Date(),
          userId: payload.userId,
        },
        update: {
          startedAt: new Date(),
          userId: payload.userId,
          userCourseId: userCourse.id,
        },
        include: {
          userCourse: {
            include: {
              course: true,
            },
          },
          part: {
            include: {
              resource: true,
            },
          },
        },
      });
      data = {
        course: data.userCourse.course,
        coursePart: data.part,
        startedAt: data.startedAt,
      };
      return { data };
    } catch (error) {
      return { data: null, error: 'Failed to update progress' };
    }
  }

  async findRecentCourseProgress(userId: string) {
    try {
      let data: any = await this.prisma.courseProgress.findFirst({
        where: {
          userId: userId,
        },
        orderBy: {
          startedAt: 'desc',
        },
        take: 1,
        include: {
          userCourse: {
            include: {
              course: true,
            },
          },
          part: {
            include: {
              resource: true,
            },
          },
        },
      });
      data = {
        course: data.userCourse.course,
        coursePart: data.part,
        startedAt: data.startedAt,
      };
      return { data };
    } catch (error) {
      return { data: null, error: 'Failed to find progress' };
    }
  }
}
