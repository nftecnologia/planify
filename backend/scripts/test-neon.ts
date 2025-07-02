import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testNeonConnection() {
  try {
    console.log('🔗 Testando conexão com Neon PostgreSQL...');
    
    // Testar conexão básica
    await prisma.$connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    // Verificar se usuário de teste já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: 'teste@financeinfo.pro' }
    });
    
    if (existingUser) {
      console.log('👤 Usuário de teste já existe:', existingUser.name);
      return;
    }
    
    // Criar usuário de teste
    const passwordHash = await bcrypt.hash('123456', 12);
    
    const testUser = await prisma.user.create({
      data: {
        email: 'teste@financeinfo.pro',
        password: passwordHash,
        name: 'Usuário Teste',
        plan: 'PRO',
        emailVerified: true,
        isActive: true
      }
    });
    
    console.log('👤 Usuário de teste criado:', testUser.name);
    console.log('📧 Email:', testUser.email);
    console.log('🔑 Senha: 123456');
    
    // Verificar total de usuários
    const userCount = await prisma.user.count();
    console.log('📊 Total de usuários no banco:', userCount);
    
  } catch (error) {
    console.error('❌ Erro ao conectar com Neon:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNeonConnection();