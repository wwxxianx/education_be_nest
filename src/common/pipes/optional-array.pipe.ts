import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOptionalArrayPipe implements PipeTransform {
  transform(value: any) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (Array.isArray(value)) {
      return value;
    }
    if (value) {
      return [value];
    }
  }
}
