const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function seedIfEmpty() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Verificando si la base de datos tiene datos...');
    const userCount = await prisma.user.count();
    
    if (userCount === 0) {
      console.log('Base de datos vacía detectada. Ejecutando seed...');
      execSync('npx tsx prisma/seed.ts', { 
        stdio: 'inherit',
        cwd: process.cwd()
      });
      console.log('Seed completado exitosamente.');
    } else {
      console.log(`Base de datos ya tiene ${userCount} usuarios. Saltando seed.`);
    }
  } catch (error) {
    console.error('Error durante el seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedIfEmpty();
