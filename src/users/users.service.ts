import { Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/data/prisma.service';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userName?: string, email?: string) {
    return await this.prisma.user.findMany({
      where: {
        OR: [
          {
            fullName: userName
              ? {
                  contains: userName,
                  mode: 'insensitive',
                }
              : undefined,
          },
          {
            email: email
              ? {
                  contains: email,
                  mode: 'insensitive',
                }
              : undefined,
          },
        ],
      },
    });
  }

  async findOne(id: string): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: {
          id: id,
        },
      });
      return { data: user, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to fetch user details' };
    }
  }

  async updateProfile(id: string, updateUserDto: Prisma.UserUpdateInput): Promise<Result<User>> {
    try {
      const user = await this.prisma.user.update({
        where: {
          id: id,
        },
        data: updateUserDto,
      });
      return { data: user, error: null };
    } catch (e) {
      return { data: null, error: 'Failed to update user' };
    } 
    
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
