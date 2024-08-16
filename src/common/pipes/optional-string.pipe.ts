import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseOptionalStringPipe implements PipeTransform {
  transform(value: any) {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value;
  }
}
