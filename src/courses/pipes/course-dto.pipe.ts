import {
    ArgumentMetadata,
    Injectable,
    PipeTransform
} from '@nestjs/common';
import { CreateCourseDto } from '../dto/course.dto';
  
  @Injectable()
  export class ParseCourseDtoPipe implements PipeTransform {
    transform(value: CreateCourseDto, metadata: ArgumentMetadata) {
      if (typeof value !== 'object' || !value) {
        // TODO: handle unknown value
        return value;
      }
  
      const result = {};
      for (const [key, val] of Object.entries(value)) {
        // Data transformation logic:
        // convert FormData to its corresponding type
        // as FormData value is all string
        result[key] = this.transformValue(val, key as keyof CreateCourseDto);
      }
      return result;
    }
  
    private transformValue(value: any, key: keyof CreateCourseDto): any {
      if (key === 'requirements' || key === 'subcategoryIds' || key === 'topics') {
        return this.parseArray(value);
      }
      return value;
    }
  
    private parseArray(value: string): string[] {
      if (Array.isArray(value)) {
        return value;
      }
      // Assuming the values are comma-separated
      return value.split(',').map((item) => item.trim());
    }
  }
  