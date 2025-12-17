import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../common/constants/roles';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WhitelistEmail } from '../admin/entities/whitelist-email.entity';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectRepository(WhitelistEmail)
    private whitelistRepository: Repository<WhitelistEmail>,
    @InjectRepository(TeacherProfile)
    private teacherProfileRepository: Repository<TeacherProfile>,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if email is in whitelist
    const isWhitelisted = await this.checkEmailWhitelist(registerDto.email);
    if (!isWhitelisted) {
      throw new BadRequestException(
        'Email is not in the whitelist. Please contact admin @AleksRukhman on Telegram to be added.',
      );
    }

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUsername = await this.usersService.findByUsername(
      registerDto.username,
    );
    if (existingUsername) {
      throw new ConflictException('Username is already taken');
    }

    // Create user
    const user = await this.usersService.create({
      ...registerDto,
      role: UserRole.TEACHER,
    });

    // Create teacher profile
    const profile = this.teacherProfileRepository.create({
      userId: user.id,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
    });
    await this.teacherProfileRepository.save(profile);

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login(loginDto: LoginDto) {
    // Try to find user by email or username
    let user = await this.usersService.findByEmail(loginDto.emailOrUsername);
    if (!user) {
      user = await this.usersService.findByUsername(loginDto.emailOrUsername);
    }
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async checkEmailWhitelist(email: string): Promise<boolean> {
    const whitelistEntry = await this.whitelistRepository.findOne({
      where: { email },
    });
    return !!whitelistEntry;
  }
}


