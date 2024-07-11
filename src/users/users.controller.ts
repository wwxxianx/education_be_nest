import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  Patch,
  Query,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
  UsePipes
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { storageConstants } from 'src/common/constants/constants';
import { PrismaService } from 'src/common/data/prisma.service';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { HttpExceptionFilter } from 'src/common/error/http-exception.filter';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { StorageService } from 'src/storage/storage.service';
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
    let profileImageUrl: string | undefined = undefined;
    if (profileImageFile != null) {
      const profileImageFilePath = `profile-image/${userId}/${profileImageFile.originalname}`;
      const { data, error } = await this.storageService.uploadFile(
        storageConstants.USER_BUCKET,
        profileImageFilePath,
        profileImageFile.buffer,
        profileImageFile.mimetype,
      );
      if (error == null) {
        profileImageUrl = data.publicUrl;
      }
    }
    const { data, error } = await this.usersService.updateProfile(userId, {
      fullName: updateUserDto.fullName?.length
        ? updateUserDto.fullName
        : undefined,
      isOnboardingCompleted:
        updateUserDto?.isOnboardingCompleted == null
          ? undefined
          : updateUserDto.isOnboardingCompleted,
    });
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
