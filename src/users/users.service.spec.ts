import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BadRequestException, NotFoundException } from '@nestjs/common';

const mockUsersRepository: Partial<Record<keyof Repository<User>, jest.Mock>> = {
  create: jest.fn(dto => dto),
  save: jest.fn(user => Promise.resolve({ id: 'mock-uuid-1', ...user })),
  find: jest.fn(() => Promise.resolve([])),
  findOne: jest.fn(() => Promise.resolve(null)),
  delete: jest.fn(() => Promise.resolve({ affected: 1 })),
};

jest.mock('bcrypt', () => ({
  hash: jest.fn(password => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hash) => Promise.resolve(password === hash.replace('hashed_', ''))),
}));

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>; // Mantenha a tipagem real aqui

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUsersRepository, // Usa o mock tipado
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    Object.values(mockUsersRepository).forEach(mockFn => {
      if (jest.isMockFunction(mockFn)) {
        mockFn.mockClear();
      }
    });
    bcrypt.hash.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user and hash the password', async () => {
      const createUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        active: true,
      };
      (mockUsersRepository.save as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-1',
        ...createUserDto,
        password: 'hashed_password123', // Retorna a senha já hashada
      });


      const result = await service.create(createUserDto);

      expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }));
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(repository.save).toHaveBeenCalledWith(expect.objectContaining({
        password: 'hashed_password123',
      }));
      expect(result).toEqual(expect.objectContaining({
        id: 'mock-uuid-1',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashed_password123',
        active: true,
      }));
    });

    it('should throw BadRequestException if email already in use', async () => {

      (mockUsersRepository.findOne as jest.Mock).mockResolvedValueOnce({
        id: 'existing-uuid',
        email: 'existing@example.com'
      });

      const createUserDto = {
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123',
        active: true,
      };

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createUserDto)).rejects.toThrow('Email already in use.');
      expect(repository.findOne).toHaveBeenCalledWith({ where: { email: 'existing@example.com' } });
      expect(repository.save).not.toHaveBeenCalled();
    });
  });
});

