import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { CoursePublishStatus, MimeType } from '@prisma/client';
import { Cache } from 'cache-manager';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { StorageService } from 'src/storage/storage.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheService: Cache,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    userId: string,
    createCourseDto: CreateCourseDto,
    courseImages: Express.Multer.File[],
    courseResourceFiles: Express.Multer.File[],
    courseVideo?: Express.Multer.File,
  ) {
    try {
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
          price: createCourseDto.price,
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
          sections: true,
        },
      });
      for (let i = 0; i <= courseResourceFiles.length; i++) {
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
    } catch (e) {
      return { error: 'Failed to create course', data: null };
    }
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

  findAll() {
    return `This action returns all courses`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
