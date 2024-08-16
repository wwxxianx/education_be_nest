import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { HttpExceptionFilter } from 'src/common/error/http-exception.filter';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { ParseOptionalStringPipe } from 'src/common/pipes/optional-string.pipe';
import { StorageService } from 'src/storage/storage.service';
import {
  CourseProgressDto,
  CourseProgressPayload,
} from './dto/course-progress.dto';
import { CreateInstructorProfileDto } from './dto/instructor-profile.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParseUserProfileDtoPipe } from './pipes/user-profile-dto.pipe';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly storageService: StorageService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('progress')
  @UseGuards(AccessTokenGuard)
  async findUserCourseProgress(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.usersService.findRecentCourseProgress(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch('progress')
  @UseGuards(AccessTokenGuard)
  async updateUserCourseProgress(
    @GetCurrentUserId() userId: string,
    @Body() dto: CourseProgressDto,
  ) {
    const payload: CourseProgressPayload = {
      courseId: dto.courseId,
      partId: dto.partId,
      userId: userId,
    };
    const { data, error } =
      await this.usersService.updateUserCourseProgress(payload);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('courses')
  @UseGuards(AccessTokenGuard)
  async findUserCourses(
    @GetCurrentUserId() userId: string,
    @Query('courseId', ParseOptionalStringPipe) courseId?: string,
  ) {
    if (courseId) {
      const { data, error } =
        await this.usersService.findUserParticipatedCourse(userId, courseId);
      if (error) {
        throw new InternalServerErrorException(error);
      }
      if (!data) return data;
      return [data];
    }
    const { data, error } =
      await this.usersService.findUserParticipatedCourses(userId);
    if (error) throw new InternalServerErrorException(error);

    return data;
  }

  @Get(':id/instructor-profile')
  async findUserInstructorProfile(@Param('id') userId: string) {
    const { data, error } =
      await this.usersService.findUserInstructorProfile(userId);

    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Post('instructor-profile')
  @UseGuards(AccessTokenGuard)
  @UseInterceptors(FileInterceptor('profileImageFile'))
  async createUserInstructorProfile(
    @GetCurrentUserId() userId: string,
    @Body() createUserInstructorProfileDto: CreateInstructorProfileDto,
    @UploadedFile() profileImageFile?: Express.Multer.File,
  ) {
    const { data, error } = await this.usersService.createInstructorProfile(
      userId,
      createUserInstructorProfileDto,
      profileImageFile,
    );

    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('notifications')
  @UseGuards(AccessTokenGuard)
  async findUserNotifications(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.usersService.findUserNotifications(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Patch('notifications/:id')
  @UseGuards(AccessTokenGuard)
  async updateNotificationAsReaed(
    @Param('id') notificationId: string,
    @Body() dto: { courseId: string },
  ) {
    const { data, error } =
      await this.usersService.updateNotificationAsRead(notificationId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('favourite-courses')
  @UseGuards(AccessTokenGuard)
  async findUserFavouriteCourses(@GetCurrentUserId() userId: string) {
    const { data, error } =
      await this.usersService.findUserFavouriteCourses(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Post('favourite-courses')
  @UseGuards(AccessTokenGuard)
  async updateUserFavouriteCourse(
    @GetCurrentUserId() userId: string,
    @Body() dto: { courseId: string },
  ) {
    const { data, error } = await this.usersService.updateUserFavouriteCourse(
      userId,
      dto.courseId,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  async findAll(
    @Query('userName') userName?: string,
    @Query('email') email?: string,
  ) {
    return await this.usersService.findAll(userName, email);
  }

  @UseGuards(AccessTokenGuard)
  @Get('profile')
  async findOne(@GetCurrentUserId() userId: string) {
    const { data, error } = await this.usersService.findOne(userId);
    if (error) {
      throw new BadRequestException(error);
    }
    return data;
  }

  @UseGuards(AccessTokenGuard)
  @Patch()
  @UseInterceptors(FileInterceptor('profileImageFile'))
  @UsePipes(new ParseUserProfileDtoPipe())
  @UseFilters(HttpExceptionFilter)
  async update(
    @GetCurrentUserId() userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImageFile?: Express.Multer.File,
  ) {
    const { data, error } = await this.usersService.updateProfile(
      userId,
      updateUserDto,
      profileImageFile,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('recommended-course/purchase')
  @UseGuards(AccessTokenGuard)
  async findRecommendedCourseFromPurchaseHistory(@GetCurrentUserId() userId: string) { 
    const { data, error } = await this.usersService.findRecommendedCourseFromPurchaseHistory(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('recommended-course/preference')
  @UseGuards(AccessTokenGuard)
  async findRecommendedCourseFromPreference(@GetCurrentUserId() userId: string) { 
    const { data, error } = await this.usersService.findRecommendedCourseFromPreference(userId);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }
}
