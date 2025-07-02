import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hash da senha de teste
    const passwordHash = await bcrypt.hash('123456', 12);

    // Criar usuário de teste
    const user = await prisma.user.create({
      data: {
        email: 'test@financeinfo.com',
        name: 'Usuário Teste',
        password: passwordHash,
        plan: 'PRO'
      }
    });

    // Criar configurações do usuário
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        taxSettings: {
          regime: 'SIMPLES_NACIONAL',
          cnpj: '12345678000190',
          startDate: '2024-01-01',
          isServiceProvider: true,
          mensalReservePercentage: 15
        },
        notificationPreferences: {
          emailOnSale: true,
          taxReminders: true,
          monthlyReports: true
        },
        integrationsConfig: {
          kirvano: {
            enabled: true,
            webhookUrl: 'https://api.financeinfo.com/webhooks/kirvano'
          }
        }
      }
    });

    console.log('✅ Usuário de teste criado com sucesso!');
    console.log('📧 Email: test@financeinfo.com');
    console.log('🔑 Senha: 123456');
    console.log('🆔 ID:', user.id);

  } catch (error) {
    console.error('❌ Erro ao criar usuário de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();