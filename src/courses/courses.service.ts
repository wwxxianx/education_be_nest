import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import {
  Course,
  CourseFAQ,
  CoursePart,
  CoursePublishStatus,
  CourseSection,
  CourseSubcategory,
  MimeType,
  Voucher,
} from '@prisma/client';
import { Cache } from 'cache-manager';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { CampaignFilters } from './types/filters';
import { CreateCourseFAQDto } from './dto/course-faq.dto';
import { CreateVoucherDto } from './dto/voucher.dto';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import {
  CreateCourseSectionDto,
  UpdateCourseSectionDto,
} from './dto/course-section.dto';
import { CreateCoursePartDto } from './dto/course-part.dto';
import { toISO8601 } from 'src/common/utils/time';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async update(
    courseId: string,
    dto: UpdateCourseDto,
    courseImages?: Array<Express.Multer.File>,
  ): Promise<Result<Course>> {
    if (dto.status && dto.status == CoursePublishStatus.PUBLISHED) {
      // Check whether instructor already setup bank account
      const course = await this.prisma.course.findUnique({
        where: {
          id: courseId,
        },
        select: {
          instructor: {
            include: {
              bankAccount: true,
            },
          },
        },
      });
      if (!course.instructor.bankAccount) {
        return {
          data: null,
          error: 'Instructor must setup bank account first',
        };
      }
    }
    const data = await this.prisma.course.update({
      where: {
        id: courseId,
      },
      data: {
        categoryId: dto.categoryId ?? undefined,
        description: dto.description ?? undefined,
        levelId: dto.levelId ?? undefined,
        requirements: dto.requirements ?? undefined,
        title: dto.title ?? undefined,
        topics: dto.topics ?? undefined,
        languageId: dto.languageId ?? undefined,
        status: dto.status ?? undefined,
        price: dto.price ? +dto.price : undefined,
      },
      include: {
        level: true,
        category: true,
        instructor: true,
        language: true,
        subcategories: true,
      },
    });
    return { data };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to update course' };
    }
  }

  async create(
    userId: string,
    createCourseDto: CreateCourseDto,
    courseImages: Express.Multer.File[],
    courseResourceFiles: Express.Multer.File[],
    courseVideo?: Express.Multer.File,
  ): Promise<Result<Course>> {
    let imageUrls: string[] = [];
    let videoUrl: string | undefined = undefined;
    let thumbnailUrl: string;

    // Generate thumbnail
    const thumbnailFilePath = `thumbnail/${createCourseDto.title}/${courseImages[0].originalname}`;
    const { data: thumbnailData, error: thumbnailError } =
      await this.storageService.uploadFile(
        storageConstants.COURSE_BUCKET,
        thumbnailFilePath,
        courseImages[0].buffer,
        courseImages[0].mimetype,
      );
    if (thumbnailError) {
      return { error: 'Failed to upload thumbnail image', data: null };
    }
    thumbnailUrl = thumbnailData.publicUrl;

    for (let courseImage of courseImages) {
      const filePath = `image/${createCourseDto.title}/${courseImage.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.COURSE_BUCKET,
        filePath,
        courseImage.buffer,
        courseImage.mimetype,
      );
      if (error) {
        return {
          error: `Failed to upload image ${courseImage.originalname}`,
          data: null,
        };
      }
      imageUrls.push(data.publicUrl);
    }
    const images = imageUrls.map((url) => ({
      imageUrl: url,
    }));
    console.log('dto', createCourseDto);
    const course = await this.prisma.course.create({
      data: {
        description: createCourseDto.description,
        status: CoursePublishStatus.DRAFT,
        title: createCourseDto.title,
        categoryId: createCourseDto.categoryId,
        subcategories: {
          connect: createCourseDto.subcategoryIds.map((id) => ({
            id,
          })),
        },
        instructorId: userId,
        languageId: createCourseDto.languageId,
        levelId: createCourseDto.levelId,
        price: +createCourseDto.price,
        requirements: createCourseDto.requirements,
        topics: createCourseDto.topics,
        sections: {
          create: {
            order: 1,
            title: createCourseDto.sectionOneTitle,
          },
        },
        images: {
          createMany: {
            data: images,
          },
        },
        thumbnailUrl: thumbnailUrl,
        videoUrl: videoUrl,
      },
      include: {
        level: true,
        category: true,
        subcategories: true,
        language: true,
        sections: true,
        instructor: true,
      },
    });
    console.log('courseResourceFiles', courseResourceFiles);
    for (let i = 0; i < courseResourceFiles.length; i++) {
      const resourceFile = courseResourceFiles[i];
      const mimeType = this.getMimeTypeEnum(resourceFile.mimetype);
      const filePath = `resource/${createCourseDto.title}/${resourceFile.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.COURSE_BUCKET,
        filePath,
        resourceFile.buffer,
        resourceFile.mimetype,
      );
      if (error) {
        return {
          error: `Failed to upload resource file ${resourceFile.originalname}`,
          data: null,
        };
      }
      await this.prisma.coursePart.create({
        data: {
          order: i + 1,
          title: createCourseDto.coursePartsTitle[i],
          resource: {
            create: {
              url: data.publicUrl,
              mimeType: mimeType,
            },
          },
          courseSection: {
            connect: {
              id: course.sections[0].id,
            },
          },
        },
      });
    }
    return { data: course, error: null };
    try {
    } catch (e) {
      return { error: 'Failed to create course', data: null };
    }
  }

  async updateSection(
    sectionId: string,
    dto: UpdateCourseSectionDto,
  ): Promise<Result<CourseSection>> {
    try {
      const data = await this.prisma.courseSection.update({
        where: {
          id: sectionId,
        },
        data: {
          title: dto.title,
        },
      });
      return { data };
    } catch (err) {
      return { data: null, error: 'Failed to update section' };
    }
  }

  async createCoursePart(
    dto: CreateCoursePartDto,
    resourceFile: Express.Multer.File,
  ): Promise<Result<CoursePart>> {
    const lastPart = await this.prisma.coursePart.findFirst({
      where: {
        courseSectionId: dto.sectionId,
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });
    const mimeType = this.getMimeTypeEnum(resourceFile.mimetype);
    const filePath = `resource/${dto.title}/${resourceFile.originalname}`;
    const { data: resourceData, error: uploadFileError } =
      await this.storageService.uploadFile(
        storageConstants.COURSE_BUCKET,
        filePath,
        resourceFile.buffer,
        resourceFile.mimetype,
      );
    if (uploadFileError) {
      return { data: null, error: uploadFileError };
    }

    const data = await this.prisma.coursePart.create({
      data: {
        order: lastPart ? lastPart.order + 1 : 1,
        title: dto.title,
        courseSection: {
          connect: {
            id: dto.sectionId,
          },
        },
        resource: {
          create: {
            mimeType: mimeType,
            url: resourceData.publicUrl,
          },
        },
      },
      include: {
        resource: true,
      },
    });
    return { data };
    try {
    } catch (error) {
      return { data: null, error: 'Failed to create course part' };
    }
  }

  async createCourseSection(
    dto: CreateCourseSectionDto,
    courseResourceFiles: Express.Multer.File[],
  ) {
    const lastSection = await this.prisma.courseSection.findFirst({
      where: {
        courseId: dto.courseId,
      },
      orderBy: {
        order: 'desc',
      },
      take: 1,
    });
    let createdSection: any = await this.prisma.courseSection.create({
      data: {
        order: lastSection.order + 1,
        title: dto.title,
        courseId: dto.courseId,
      },
    });

    // Upload part content
    if (courseResourceFiles?.length) {
      createdSection = {
        ...createdSection,
        parts: [],
      };
      for (let i = 0; i < courseResourceFiles.length; i++) {
        const resourceFile = courseResourceFiles[i];
        const filePath = `resource/${dto.title}/${resourceFile.originalname}`;
        const { data, error } = await this.storageService.uploadFile(
          storageConstants.COURSE_BUCKET,
          filePath,
          resourceFile.buffer,
          resourceFile.mimetype,
        );
        if (error) {
          return {
            error: `Failed to upload resource file ${resourceFile.originalname}`,
            data: null,
          };
        }
        const coursePart = await this.prisma.coursePart.create({
          data: {
            order: i + 1,
            title: dto.coursePartsTitle[i],
            courseSection: {
              connect: {
                id: createdSection.id,
              },
            },
            resource: {
              create: {
                mimeType: this.getMimeTypeEnum(resourceFile.mimetype),
                url: data.publicUrl,
              },
            },
          },
          include: {
            resource: true,
          },
        });

        createdSection = {
          ...createdSection,
          parts: [...createdSection.parts, coursePart],
        };
      }
    }
    return { data: createdSection };
  }

  getMimeTypeEnum(fileMime: string): MimeType {
    const mimePrefix = fileMime.split('/')[0];
    if (mimePrefix === 'video') {
      return MimeType.VIDEO;
    }
    if (mimePrefix === 'application') {
      return MimeType.DOCUMENT;
    }
    return MimeType.TEXT;
  }

  async findAll(filters: CampaignFilters): Promise<Result<Course[]>> {
    const {
      categoryIds,
      isFree,
      levelIds,
      languageIds,
      searchQuery,
      status,
      instructorId,
      subcategoryIds,
    } = filters;

    let subcategories: CourseSubcategory[];
    let filteredParentCategoryIds: string[] = categoryIds;
    if (subcategoryIds && subcategoryIds.length > 0) {
      subcategories = await this.prisma.courseSubcategory.findMany({
        where: {
          id: {
            in: subcategoryIds,
          },
        },
      });

      subcategories.forEach((subcategory) => {
        if (filteredParentCategoryIds.includes(subcategory.courseCategoryId)) {
          // Remove the parent, to search only the subcategory
          filteredParentCategoryIds = filteredParentCategoryIds.filter(
            (id) => id !== subcategory.courseCategoryId,
          );
        }
      });
    }
    console.log('subcategoryIds:', subcategoryIds);
    console.log('filteredParentCategoryIds:', filteredParentCategoryIds);
    const data = await this.prisma.course.findMany({
      where: {
        AND: [
          {
            OR: [
              {
                categoryId: filteredParentCategoryIds?.length
                  ? {
                      in: filteredParentCategoryIds,
                    }
                  : undefined,
              },
              {
                subcategories: subcategoryIds?.length
                  ? {
                      some: {
                        id: {
                          in: subcategoryIds,
                        },
                      },
                    }
                  : undefined,
              },
            ],
          },
          {
            instructorId: instructorId ? instructorId : undefined,
          },
          {
            title: searchQuery
              ? {
                  contains: searchQuery,
                  mode: 'insensitive',
                }
              : undefined,
          },
          {
            levelId:
              levelIds && levelIds.length
                ? {
                    in: levelIds,
                  }
                : undefined,
          },
          {
            status: status ? status : undefined,
          },
          {
            languageId:
              languageIds && languageIds.length
                ? {
                    in: languageIds,
                  }
                : undefined,
          },
          {
            price: isFree !== undefined ? (isFree ? 0 : undefined) : undefined,
          },
        ],
      },
      include: {
        category: true,
        images: true,
        instructor: {
          include: {
            instructorProfile: true,
          },
        },
        language: true,
        level: true,
        subcategories: true,
        sections: {
          include: {
            parts: {
              include: {
                resource: true,
              },
            },
          },
        },
      },
    });

    return { data };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to fetch courses' };
    }
  }

  async findOne(id: string): Promise<Result<Course>> {
    try {
      const data = await this.prisma.course.findUnique({
        where: {
          id: id,
        },
        include: {
          category: true,
          images: true,
          instructor: {
            include: {
              instructorProfile: true,
              bankAccount: true,
            },
          },
          language: true,
          level: true,
          subcategories: true,
          sections: {
            orderBy: {
              order: 'asc',
            },
            include: {
              parts: {
                orderBy: {
                  order: 'asc',
                },
                include: {
                  resource: true,
                },
              },
            },
          },
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch course details' };
    }
  }

  async findCourseFAQ(courseId: string): Promise<Result<CourseFAQ[]>> {
    try {
      const data = await this.prisma.courseFAQ.findMany({
        where: {
          courseId: courseId,
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch course FAQ' };
    }
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }

  async updateFAQ(
    courseId: string,
    dto: CreateCourseFAQDto,
  ): Promise<Result<CourseFAQ[]>> {
    try {
      // Remove all faq first
      await this.prisma.courseFAQ.deleteMany({
        where: {
          courseId: courseId,
        },
      });

      // Update
      const faq = await this.prisma.courseFAQ.createManyAndReturn({
        data: dto.map((faq) => {
          return {
            courseId: courseId,
            answer: faq.answer,
            question: faq.question,
          };
        }),
      });
      return { data: faq };
    } catch (e) {
      return { data: null, error: 'Failed to update course FAQ' };
    }
  }

  async createVoucher(dto: CreateVoucherDto): Promise<Result<Voucher>> {
    const course = await this.prisma.course.findUnique({
      where: {
        id: dto.courseId,
      },
      select: {
        price: true,
      },
    });
    if (dto.afterDiscountValue >= course.price) {
      return {
        data: null,
        error: 'Voucher value should be smaller than original price course',
      };
    }
    const data = await this.prisma.voucher.create({
      data: {
        courseId: dto.courseId,
        afterDiscountValue: dto.afterDiscountValue,
        isVoucherAvailable: true,
        expiredAt: dto.expiredAt ? toISO8601(dto.expiredAt) : null,
        stock: dto.stock,
        title: dto.title,
      },
    });
    return { data };
    try {
    } catch (e) {
      return { data: null, error: 'Failed to create course voucher' };
    }
  }

  async findCourseVouchers(courseId: string): Promise<Result<Voucher[]>> {
    try {
      const data = await this.prisma.voucher.findMany({
        where: {
          courseId: courseId,
          AND: [
            {
              OR: [{ stock: null }, { stock: { gt: 0 } }],
            },
            {
              OR: [{ expiredAt: null }, { expiredAt: { gt: new Date() } }],
            },
          ],
        },
      });
      return { data };
    } catch (e) {
      return { data: null, error: 'Failed to fetch course vouchers' };
    }
  }

  async findRecommendedCourses(searchTerm: string): Promise<Result<Course[]>> {
    // const {} = await this.prisma.
    try {
      const recommendedCourse = await this.prisma.recommendedCourse.findFirst({
        where: {
          searchTerm: {
            contains: searchTerm,
            mode: 'insensitive',
          },
        },
        include: {
          courses: true,
        },
      });
      if (!recommendedCourse || !recommendedCourse?.courses?.length) {
        // No courses found
        const courses = await this.prisma.course.findMany({
          where: {
            title: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          include: {
            category: true,
            images: true,
            instructor: {
              include: {
                instructorProfile: true,
              },
            },
            language: true,
            level: true,
            subcategories: true,
            sections: {
              include: {
                parts: {
                  include: {
                    resource: true,
                  },
                },
              },
            },
          },
        });
        if (courses?.length) {
          // found courses
          await this.prisma.recommendedCourse.upsert({
            where: {
              searchTerm: searchTerm,
            },
            create: {
              searchTerm: searchTerm,
              courses: {
                connect: courses.map((course) => {
                  return {
                    id: course.id,
                  };
                }),
              },
            },
            update: {
              courses: {
                connect: courses.map((course) => {
                  return {
                    id: course.id,
                  };
                }),
              },
            },
          });
        }
      }
    } catch (error) {
      return { data: null, error: '' };
    }
  }
}
