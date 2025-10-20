import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Creating a new user...');
  const user = await prisma.user.create({
    data: {},
  });
  console.log('✅ User created successfully!');
  console.log('📋 Use this ID in your API calls (X-User-Id header):');
  console.log(user.id);
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
