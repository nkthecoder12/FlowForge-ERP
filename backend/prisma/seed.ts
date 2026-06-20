import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding default admin user...');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@flowforge.com' }
  });

  if (existingAdmin) {
    console.log('Admin user already exists!');
    return;
  }

  // Hash the password securely
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@flowforge.com',
      passwordHash: hashedPassword,
      role: 'admin',
      isActive: true,
    },
  });

  console.log('✅ Default Admin created successfully:');
  console.log(`- Email: ${admin.email}`);
  console.log(`- Password: Admin@1234`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
