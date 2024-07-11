import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import {
  FileFieldsInterceptor,
  FilesInterceptor,
} from '@nestjs/platform-express';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'courseImages', maxCount: 5 },
      { name: 'courseResourceFiles' },
      { name: 'courseVideo', maxCount: 1 },
    ]),
  )
  create(
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
    // return this.coursesService.create(createCourseDto);
  }

  @Get()
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.coursesService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coursesService.remove(+id);
  }
}
