import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CourseReviewsService } from './course-reviews.service';
import { CreateCourseReviewDto } from './dto/create-course-review.dto';
import { UpdateCourseReviewDto } from './dto/update-course-review.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { ParseOptionalStringPipe } from 'src/common/pipes/optional-string.pipe';
import { ParseOptionalIntPipe } from 'src/common/pipes/optional-int.pipe';

@Controller('course-reviews')
export class CourseReviewsController {
  constructor(private readonly courseReviewsService: CourseReviewsService) {}

  @Post()
  @UseGuards(AccessTokenGuard)
  async create(
    @GetCurrentUserId() userId: string,
    @Body() createCourseReviewDto: CreateCourseReviewDto,
  ) {
    const { data, error } = await this.courseReviewsService.create(
      userId,
      createCourseReviewDto,
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get('/course/:id')
  async findAll(
    @Param('id') courseId: string,
    @Query('limit', ParseOptionalIntPipe) limit?: number,
  ) {
    const { data, error } = await this.courseReviewsService.findAll(courseId, { limit });
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseReviewsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourseReviewDto: UpdateCourseReviewDto,
  ) {
    return this.courseReviewsService.update(+id, updateCourseReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseReviewsService.remove(+id);
  }
}
