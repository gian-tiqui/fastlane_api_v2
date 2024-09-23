import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { RegisterDto } from '../auth/dto/register.dto';

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const registerDto: RegisterDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        dob: new Date('1990-01-01'),
        gender: 'Male',
        address: '123 Street',
        city: 'City',
        state: 'State',
        zipCode: '12345',
        lastNamePrefix: 'Mr',
        suffix: 'Jr',
        preferredName: 'Johnny',
      };

      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: 1,
        email: registerDto.email,
        password: hashedPassword,
        firstName: registerDto.firstName,
        middleName: registerDto.middleName ?? null,
        lastName: registerDto.lastName,
        lastNamePrefix: registerDto.lastNamePrefix ?? null,
        preferredName: registerDto.preferredName ?? null,
        suffix: registerDto.suffix ?? null,
        address: registerDto.address ?? null,
        city: registerDto.city ?? null,
        state: registerDto.state ?? null,
        zipCode: registerDto.zipCode ?? null,
        dob: registerDto.dob ?? null,
        gender: registerDto.gender ?? null,
        createdAt: new Date(),
        updatedAt: new Date(),
        refreshToken: null,
      };

      jest.spyOn(argon, 'hash').mockResolvedValue(hashedPassword);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(createdUser);

      const result = await authService.register(registerDto);

      expect(argon.hash).toHaveBeenCalledWith(registerDto.password);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...registerDto,
          password: hashedPassword,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw a ConflictException when the user already exists', async () => {
      const registerDto: RegisterDto = {
        email: 'existing@example.com',
        password: 'Password123!',
        firstName: 'John',
        middleName: 'Doe',
        lastName: 'Smith',
        dob: new Date('1990-01-01'),
        gender: 'Male',
      };

      jest.spyOn(argon, 'hash').mockResolvedValue('hashedPassword123');
      jest.spyOn(prismaService.user, 'create').mockRejectedValue(new Error());

      await expect(authService.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
