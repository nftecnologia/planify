import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Criando usuário de teste...');

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'teste@inforoi.com' }
    });

    if (existingUser) {
      console.log('✅ Usuário de teste já existe:', existingUser.email);
      return existingUser;
    }

    // Criar usuário de teste
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const user = await prisma.user.create({
      data: {
        email: 'teste@inforoi.com',
        password: hashedPassword,
        name: 'Usuário Teste InfoROI',
        plan: 'PRO',
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });

    console.log('✅ Usuário criado com sucesso!');
    console.log(`   Email: ${user.email}`);
    console.log(`   Nome: ${user.name}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Plano: ${user.plan}`);

    return user;

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createTestUser();
}

export { createTestUser };