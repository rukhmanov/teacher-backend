import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User>;
  async findOne(field: { email?: string; username?: string; id?: string }): Promise<User>;
  async findOne(
    idOrField: string | { email?: string; username?: string; id?: string },
  ): Promise<User> {
    if (typeof idOrField === 'string') {
      const user = await this.usersRepository.findOne({
        where: { id: idOrField },
        relations: ['profile'],
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    }

    const user = await this.usersRepository.findOne({
      where: idOrField,
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['profile'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['profile'],
    });
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async delete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepository.remove(user);
  }
}

