import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users/entities/user.entity';
import { UserRole } from './common/constants/roles';
import { WhitelistEmail } from './admin/entities/whitelist-email.entity';

export async function seedDatabase(dataSource: DataSource) {
  const userRepository = dataSource.getRepository(User);
  const whitelistRepository = dataSource.getRepository(WhitelistEmail);

  // Create admin user if not exists
  const adminEmail = 'admin@admin.com';
  const adminExists = await userRepository.findOne({
    where: { email: adminEmail },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    const admin = userRepository.create({
      email: adminEmail,
      password: hashedPassword,
      username: 'admin',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('Admin user created: admin@admin.com / admin');
  }

  // Add admin email to whitelist if not exists
  const adminWhitelistExists = await whitelistRepository.findOne({
    where: { email: adminEmail },
  });

  if (!adminWhitelistExists) {
    const adminUser = await userRepository.findOne({
      where: { email: adminEmail },
    });
    if (adminUser) {
      const whitelistEntry = whitelistRepository.create({
        email: adminEmail,
        addedBy: adminUser.id,
      });
      await whitelistRepository.save(whitelistEntry);
      console.log('Admin email added to whitelist');
    }
  }
}




