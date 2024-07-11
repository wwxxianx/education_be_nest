import {
  Controller,
  Get,
  InternalServerErrorException
} from '@nestjs/common';
import { LanguagesService } from './languages.service';

@Controller('languages')
export class LanguagesController {
  constructor(private readonly languagesService: LanguagesService) {}

  @Get()
  async findAll() {
    const { data, error } = await this.languagesService.findAll();
    if (error) {
      throw new InternalServerErrorException(error);
    }
    return data;
  }
}
