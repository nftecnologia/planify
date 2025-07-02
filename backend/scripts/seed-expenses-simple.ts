import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedExpenses() {
  try {
    console.log('🌱 Iniciando seed de despesas...');

    // Buscar o primeiro usuário ativo
    const user = await prisma.user.findFirst({
      where: { isActive: true }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado. Execute primeiro o script de criação de usuário teste.');
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${user.email}`);

    // Limpar despesas existentes
    await prisma.expense.deleteMany({
      where: { userId: user.id }
    });

    console.log('🗑️  Despesas existentes removidas');

    // Criar despesas uma por uma para evitar problemas de tipos
    const expensesToCreate = [
      {
        description: 'Meta Ads - Campanha Black Friday',
        amount: 2500.00,
        category: 'marketing',
        expenseDate: new Date('2024-11-15'),
        isRecurring: false,
      },
      {
        description: 'Google Ads - Palavras-chave premium',
        amount: 1800.00,
        category: 'marketing',
        expenseDate: new Date('2024-12-01'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'Vercel Pro - Hospedagem aplicação',
        amount: 20.00,
        category: 'tools',
        expenseDate: new Date('2024-12-01'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'GitHub Copilot - IA para desenvolvimento',
        amount: 10.00,
        category: 'tools',
        expenseDate: new Date('2024-12-01'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'Curso React Avançado - Rocketseat',
        amount: 497.00,
        category: 'education',
        expenseDate: new Date('2024-11-20'),
        isRecurring: false,
      },
      {
        description: 'Internet fibra óptica 500MB',
        amount: 99.90,
        category: 'operational',
        expenseDate: new Date('2024-12-05'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'Contador - Serviços mensais',
        amount: 350.00,
        category: 'taxes',
        expenseDate: new Date('2024-12-01'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'DAS - Simples Nacional',
        amount: 890.45,
        category: 'taxes',
        expenseDate: new Date('2024-12-20'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'AWS - Infraestrutura cloud',
        amount: 150.00,
        category: 'tools',
        expenseDate: new Date('2024-12-05'),
        isRecurring: true,
        recurrenceType: 'monthly',
      },
      {
        description: 'TikTok Ads - Geração de leads',
        amount: 800.00,
        category: 'marketing',
        expenseDate: new Date('2024-12-10'),
        isRecurring: false,
      },
    ];

    let createdCount = 0;

    for (const expenseData of expensesToCreate) {
      await prisma.expense.create({
        data: {
          userId: user.id,
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          expenseDate: expenseData.expenseDate,
          isRecurring: expenseData.isRecurring,
          recurrenceType: expenseData.recurrenceType || null,
          dueDate: null,
          invoiceUrl: null,
          invoiceData: null,
        },
      });
      createdCount++;
    }

    console.log(`✅ ${createdCount} despesas criadas com sucesso!`);

    // Mostrar resumo
    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
    });

    const summary: { [key: string]: { count: number; total: number } } = {};
    let totalGeral = 0;

    expenses.forEach(expense => {
      if (!summary[expense.category]) {
        summary[expense.category] = { count: 0, total: 0 };
      }
      summary[expense.category].count++;
      summary[expense.category].total += expense.amount;
      totalGeral += expense.amount;
    });

    console.log('\n📊 Resumo por categoria:');
    Object.entries(summary).forEach(([category, data]) => {
      const categoryLabels: { [key: string]: string } = {
        marketing: 'Marketing',
        tools: 'Ferramentas',
        education: 'Educação',
        operational: 'Operacional',
        taxes: 'Tributário'
      };
      
      console.log(`   ${categoryLabels[category] || category}: R$ ${data.total.toFixed(2)} (${data.count} despesas)`);
    });

    console.log(`\n💰 Total geral: R$ ${totalGeral.toFixed(2)}`);
    console.log('\n✅ Seed de despesas concluído!');

  } catch (error) {
    console.error('❌ Erro ao executar seed de despesas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedExpenses();