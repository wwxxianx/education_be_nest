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
import { UserVouchersService } from './user-vouchers.service';
import { CreateUserVoucherDto, UpdateUserVoucherDto } from './dto/user-voucher.dto';
import { AccessTokenGuard } from 'src/common/guards/auth/access-token.guard';
import { GetCurrentUserId } from 'src/common/decorators/get-current-user-id.decorator';
import { ParseOptionalBoolPipe } from 'src/common/pipes/optional-bool.pipe';

@Controller('user-vouchers')
export class UserVouchersController {
  constructor(private readonly userVouchersService: UserVouchersService) {}

  @UseGuards(AccessTokenGuard)
  @Post()
  async create(@GetCurrentUserId() userId: string, @Body() createUserVoucherDto: CreateUserVoucherDto) {
    const { data, error } = await this.userVouchersService.create(userId, createUserVoucherDto);
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get()
  @UseGuards(AccessTokenGuard)
  async findUserVouchers(
    @GetCurrentUserId() userId: string,
    @Query('isExpired', ParseOptionalBoolPipe) isExpired?: boolean,
  ) {
    const { data, error } = await this.userVouchersService.findUserVouchers(
      userId,
      { isExpired },
    );
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userVouchersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserVoucherDto: UpdateUserVoucherDto,
  ) {
    return this.userVouchersService.update(+id, updateUserVoucherDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userVouchersService.remove(+id);
  }
}
