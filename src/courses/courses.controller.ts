import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseArrayPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { CoursePublishStatus } from '@prisma/client';
import { ParseOptionalBoolPipe } from 'src/common/pipes/optional-bool.pipe';
import { ParseOptionalEnumPipe } from 'src/common/pipes/optional-enum.pipe';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { CampaignFilters } from './types/filters';
import { CreateVoucherDto } from './dto/voucher.dto';
import { CreateCourseFAQDto } from './dto/course-faq.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { ParseOptionalArrayPipe } from 'src/common/pipes/optional-array.pipe';
import { ParseOptionalStringPipe } from 'src/common/pipes/optional-string.pipe';
import { ParseCourseDtoPipe } from './pipes/course-dto.pipe';
import {
  CreateCourseSectionDto,
  UpdateCourseSectionDto,
} from './dto/course-section.dto';
import { CreateCoursePartDto } from './dto/course-part.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get(':id/vouchers')
  async findCourseVouchers(@Param('id') courseId: string) {
    const { data, error } =
      await this.coursesService.findCourseVouchers(courseId);

    if (error) {
      throw new InternalServerErrorException(error);
    }

    return data;
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'courseImages', maxCount: 5 },
      { name: 'courseResourceFiles' },
      { name: 'courseVideo', maxCount: 1 },
    ]),
  )
  @UseGuards(AccessTokenGuard)
  @UsePipes(new ParseCourseDtoPipe())
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createCourseDto: CreateCourseDto,
    @UploadedFiles()
    files: {
      courseImages: Express.Multer.File[];
      courseResourceFiles: Express.Multer.File[];
      courseVideo?: Express.Multer.File;
    },
  ) {
    const {
      courseImages = null,
      courseResourceFiles = null,
      courseVideo = null,
    } = files;
    console.log(createCourseDto);
    const { data, error } = await this.coursesService.create(
      userId,
      createCourseDto,
      courseImages,
      courseResourceFiles,
      courseVideo,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }

    return data;
  }

  @Get()
  async findAll(
    @Query('searchQuery') searchQuery?: string,
    @Query('categoryIds', ParseOptionalArrayPipe) categoryIds?: string[],
    @Query('subcategoryIds', ParseOptionalArrayPipe) subcategoryIds?: string[],
    @Query('languageIds', ParseOptionalArrayPipe) languageIds?: string[],
    @Query('levelIds', ParseOptionalArrayPipe) levelIds?: string[],
    @Query('isPublished', ParseOptionalBoolPipe) isFree?: boolean,
    @Query('instructorId', ParseOptionalStringPipe) instructorId?: string,
    @Query('status', new ParseOptionalEnumPipe(CoursePublishStatus))
    status?: CoursePublishStatus,
  ) {
    const filters: CampaignFilters = {
      categoryIds,
      languageIds,
      searchQuery,
      levelIds,
      isFree,
      status,
      instructorId,
      subcategoryIds,
    };

    const { data, error } = await this.coursesService.findAll(filters);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const { data, error } = await this.coursesService.findOne(id);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get(':id/faq')
  async findCourseFAQ(@Param('id') id: string) {
    const { data, error } = await this.coursesService.findCourseFAQ(id);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch(':id')
  @UseInterceptors(FilesInterceptor('courseImages'))
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @UploadedFiles() courseImages?: Array<Express.Multer.File>,
  ) {
    const { data, error } = await this.coursesService.update(
      id,
      dto,
      courseImages,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch('sections/:id')
  @UseGuards(AccessTokenGuard)
  async updateSection(
    @Param('id') sectionId: string,
    @GetCurrentUserId() userId: string,
    @Body() dto: UpdateCourseSectionDto,
  ) {
    const { data, error } = await this.coursesService.updateSection(
      sectionId,
      dto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Post('parts')
  @UseInterceptors(FileInterceptor('resourceFile'))
  async createCoursePart(
    @Body() dto: CreateCoursePartDto,
    @UploadedFile() resourceFile: Express.Multer.File,
  ) {
    const { data, error } = await this.coursesService.createCoursePart(
      dto,
      resourceFile,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Post('sections')
  @UseInterceptors(FilesInterceptor('resourceFiles'))
  async createCourseSection(
    @Body() dto: CreateCourseSectionDto,
    @UploadedFiles() resourceFiles: Express.Multer.File[],
  ) {
    const { data, error } = await this.coursesService.createCourseSection(
      dto,
      resourceFiles,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }

  @Post('vouchers')
  async createVoucher(@Body() createVoucherDto: CreateVoucherDto) {
    const { data, error } =
      await this.coursesService.createVoucher(createVoucherDto);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch(':id/faq')
  async createAndUpdateFaq(
    @Param('id') id: string,
    @Body() faqDto: CreateCourseFAQDto,
  ) {
    const { data, error } = await this.coursesService.updateFAQ(id, faqDto);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('recommended')
  async findRecommendedCourses(@Query('searchTerm') searchTerm: string) {}
}
