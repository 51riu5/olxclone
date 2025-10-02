// CommonJS seed script to avoid ts-node requirements
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Mobiles', slug: 'mobiles' },
    { name: 'Electronics', slug: 'electronics' },
    { name: 'Vehicles', slug: 'vehicles' },
    { name: 'Property', slug: 'property' },
    { name: 'Furniture', slug: 'furniture' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Jobs', slug: 'jobs' },
    { name: 'Services', slug: 'services' }
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, create: c, update: {} });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });


