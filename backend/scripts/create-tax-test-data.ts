// Script para criar dados de teste para o módulo tributário
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTaxTestData() {
  try {
    console.log('🔄 Criando dados de teste para módulo tributário...');

    // 1. Busca o usuário de teste
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@financeinfo.com' }
    });

    if (!testUser) {
      console.error('❌ Usuário de teste não encontrado. Execute primeiro create-test-user.ts');
      return;
    }

    console.log('✅ Usuário de teste encontrado:', testUser.email);

    // 2. Configurações tributárias - Simples Nacional
    const taxSettings = {
      regime: 'SIMPLES_NACIONAL',
      cnpj: '12345678000190',
      startDate: '2024-01-01',
      isServiceProvider: true,
      mensalReservePercentage: 15
    };

    // 3. Cria/atualiza configurações do usuário
    await prisma.userSettings.upsert({
      where: { userId: testUser.id },
      create: {
        userId: testUser.id,
        taxSettings: taxSettings,
        kirvanoWebhookToken: 'test-webhook-token-12345',
        notificationPreferences: {
          email: true,
          taxReminders: true,
          monthlyReports: true
        },
        integrationsConfig: {
          kirvano: {
            enabled: true,
            webhookUrl: 'https://api.financeinfo.com/webhooks/kirvano'
          }
        }
      },
      update: {
        taxSettings: taxSettings
      }
    });

    console.log('✅ Configurações tributárias criadas (Simples Nacional)');

    // 4. Cria vendas de exemplo para 2025 (distribuídas ao longo do ano)
    const currentYear = 2025;
    const salesData = [
      // Janeiro
      { month: 0, amount: 45000, count: 15 },
      // Fevereiro
      { month: 1, amount: 52000, count: 18 },
      // Março
      { month: 2, amount: 61000, count: 22 },
      // Abril
      { month: 3, amount: 58000, count: 20 },
      // Maio
      { month: 4, amount: 67000, count: 25 },
      // Junho
      { month: 5, amount: 72000, count: 28 }
    ];

    let totalCreatedSales = 0;

    for (const monthData of salesData) {
      const salesInMonth = [];
      const avgSaleValue = monthData.amount / monthData.count;

      for (let i = 0; i < monthData.count; i++) {
        // Varia o valor da venda (±30%)
        const variation = (Math.random() - 0.5) * 0.6;
        const saleValue = avgSaleValue * (1 + variation);
        
        // Data aleatória no mês
        const day = Math.floor(Math.random() * 28) + 1;
        const saleDate = new Date(currentYear, monthData.month, day);

        salesInMonth.push({
          userId: testUser.id,
          kirvanoSaleId: `test-sale-${currentYear}-${monthData.month}-${i}`,
          customerName: `Cliente Exemplo ${i + 1}`,
          customerEmail: `cliente${i + 1}@exemplo.com`,
          totalPrice: Math.round(saleValue * 100) / 100, // arredonda para 2 casas
          saleType: 'ONE_TIME' as const,
          status: 'APPROVED' as const,
          paymentMethod: Math.random() > 0.5 ? 'CREDIT_CARD' : 'PIX',
          saleDate: saleDate,
          finishedAt: saleDate,
          utmSource: Math.random() > 0.5 ? 'facebook' : 'google',
          utmMedium: 'cpc',
          utmCampaign: `campanha-${monthData.month + 1}-2025`
        });
      }

      // Insere vendas do mês
      await prisma.sale.createMany({
        data: salesInMonth
      });

      totalCreatedSales += salesInMonth.length;
      console.log(`✅ Criadas ${salesInMonth.length} vendas para ${getMonthName(monthData.month)}/${currentYear}`);
    }

    console.log(`✅ Total de vendas criadas: ${totalCreatedSales}`);

    // 5. Cria despesas tributárias (DAS pagos)
    const taxExpenses = [
      { month: 0, amount: 6975.00, description: 'DAS Simples Nacional - Janeiro/2025' },
      { month: 1, amount: 8060.00, description: 'DAS Simples Nacional - Fevereiro/2025' },
      { month: 2, amount: 9455.00, description: 'DAS Simples Nacional - Março/2025' }
    ];

    for (const expense of taxExpenses) {
      const dueDate = new Date(currentYear, expense.month + 1, 20); // DAS vence dia 20

      await prisma.expense.create({
        data: {
          userId: testUser.id,
          description: expense.description,
          amount: expense.amount,
          category: 'taxes' as const,
          expenseDate: dueDate,
          dueDate: dueDate,
          isRecurring: false
        }
      });
    }

    console.log('✅ Despesas tributárias criadas (DAS pagos)');

    // 6. Resumo dos dados criados
    const totalRevenue = salesData.reduce((sum, month) => sum + month.amount, 0);
    const totalTaxesPaid = taxExpenses.reduce((sum, expense) => sum + expense.amount, 0);

    console.log('\n📊 RESUMO DOS DADOS CRIADOS:');
    console.log(`💰 Receita total (Jan-Jun 2025): R$ ${totalRevenue.toLocaleString('pt-BR')}`);
    console.log(`🧾 Impostos pagos: R$ ${totalTaxesPaid.toLocaleString('pt-BR')}`);
    console.log(`📈 Regime: ${taxSettings.regime}`);
    console.log(`🏢 CNPJ: ${taxSettings.cnpj || 'N/A'}`);
    console.log(`💼 Tipo: ${taxSettings.isServiceProvider ? 'Serviços' : 'Comércio'}`);
    console.log(`🏦 Reserva mensal: ${taxSettings.mensalReservePercentage}%`);

    console.log('\n✅ Dados de teste criados com sucesso!');
    console.log('🔗 Acesse http://localhost:3000/tax para testar o módulo');

  } catch (error) {
    console.error('❌ Erro ao criar dados de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getMonthName(month: number): string {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[month] || 'Mês Inválido';
}

// Executa o script
createTaxTestData();