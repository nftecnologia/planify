import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface MockExpense {
  description: string;
  amount: number;
  category: string;
  expenseDate: Date;
  isRecurring: boolean;
  recurrenceType?: 'monthly' | 'yearly';
  dueDate?: Date;
}

// Despesas mock realistas para InfoROI
const mockExpenses: MockExpense[] = [
  // Marketing
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
    description: 'TikTok Ads - Geração de leads',
    amount: 800.00,
    category: 'marketing',
    expenseDate: new Date('2024-12-10'),
    isRecurring: false,
  },
  {
    description: 'Instagram Ads - Stories promocionais',
    amount: 450.00,
    category: 'marketing',
    expenseDate: new Date('2024-12-20'),
    isRecurring: false,
  },

  // Ferramentas
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
    description: 'Figma Professional',
    amount: 12.00,
    category: 'tools',
    expenseDate: new Date('2024-12-01'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    description: 'Notion Team Plan',
    amount: 8.00,
    category: 'tools',
    expenseDate: new Date('2024-12-01'),
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
    description: 'Slack Business+',
    amount: 7.25,
    category: 'tools',
    expenseDate: new Date('2024-12-01'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    description: 'PostHog Analytics',
    amount: 25.00,
    category: 'tools',
    expenseDate: new Date('2024-12-01'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },

  // Educação
  {
    description: 'Curso React Avançado - Rocketseat',
    amount: 497.00,
    category: 'education',
    expenseDate: new Date('2024-11-20'),
    isRecurring: false,
  },
  {
    description: 'Livros técnicos Amazon',
    amount: 180.00,
    category: 'education',
    expenseDate: new Date('2024-12-15'),
    isRecurring: false,
  },
  {
    description: 'Udemy - Curso Marketing Digital',
    amount: 89.90,
    category: 'education',
    expenseDate: new Date('2024-12-08'),
    isRecurring: false,
  },
  {
    description: 'Alura - Assinatura anual',
    amount: 480.00,
    category: 'education',
    expenseDate: new Date('2024-01-15'),
    isRecurring: true,
    recurrenceType: 'yearly',
  },

  // Operacional
  {
    description: 'Internet fibra óptica 500MB',
    amount: 99.90,
    category: 'operational',
    expenseDate: new Date('2024-12-05'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    description: 'Energia elétrica escritório',
    amount: 280.50,
    category: 'operational',
    expenseDate: new Date('2024-12-10'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    description: 'Material de escritório',
    amount: 125.00,
    category: 'operational',
    expenseDate: new Date('2024-12-12'),
    isRecurring: false,
  },
  {
    description: 'Limpeza escritório',
    amount: 200.00,
    category: 'operational',
    expenseDate: new Date('2024-12-01'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    description: 'Telefone empresarial',
    amount: 45.90,
    category: 'operational',
    expenseDate: new Date('2024-12-05'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },

  // Tributário
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
    description: 'Certidões digitais',
    amount: 75.00,
    category: 'taxes',
    expenseDate: new Date('2024-12-18'),
    isRecurring: false,
  },
  {
    description: 'Taxa de licença municipal',
    amount: 125.50,
    category: 'taxes',
    expenseDate: new Date('2024-01-31'),
    isRecurring: true,
    recurrenceType: 'yearly',
  },

  // Despesas variadas dos meses anteriores
  {
    description: 'Meta Ads - Campanha novembro',
    amount: 1200.00,
    category: 'marketing',
    expenseDate: new Date('2024-11-01'),
    isRecurring: false,
  },
  {
    description: 'Google Ads - Outubro',
    amount: 950.00,
    category: 'marketing',
    expenseDate: new Date('2024-10-15'),
    isRecurring: false,
  },
  {
    description: 'Curso UX/UI Design',
    amount: 299.00,
    category: 'education',
    expenseDate: new Date('2024-10-20'),
    isRecurring: false,
  },
  {
    description: 'Backup automático cloud',
    amount: 35.00,
    category: 'tools',
    expenseDate: new Date('2024-11-01'),
    isRecurring: true,
    recurrenceType: 'monthly',
  },
  {
    description: 'Certificado SSL Premium',
    amount: 120.00,
    category: 'tools',
    expenseDate: new Date('2024-11-15'),
    isRecurring: true,
    recurrenceType: 'yearly',
  },
  {
    description: 'Manutenção equipamentos',
    amount: 180.00,
    category: 'operational',
    expenseDate: new Date('2024-11-25'),
    isRecurring: false,
  }
];

async function seedExpenses() {
  try {
    console.log('🌱 Iniciando seed de despesas...');

    // Buscar o primeiro usuário ativo para vincular as despesas
    const user = await prisma.user.findFirst({
      where: { isActive: true }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado. Execute primeiro o script de criação de usuário teste.');
      process.exit(1);
    }

    console.log(`👤 Usuário encontrado: ${user.email}`);

    // Limpar despesas existentes do usuário (se houver)
    await prisma.expense.deleteMany({
      where: { userId: user.id }
    });

    console.log('🗑️  Despesas existentes removidas');

    // Inserir despesas mock
    const expenses = mockExpenses.map(expense => ({
      userId: user.id,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate,
      isRecurring: expense.isRecurring,
      recurrenceType: expense.recurrenceType || null,
      dueDate: expense.dueDate || null,
      invoiceUrl: null,
      invoiceData: null,
    }));

    await prisma.expense.createMany({
      data: expenses
    });

    console.log(`✅ ${expenses.length} despesas criadas com sucesso!`);

    // Mostrar resumo por categoria
    const summary = await prisma.expense.groupBy({
      by: ['category'],
      where: { userId: user.id },
      _sum: { amount: true },
      _count: { id: true }
    });

    console.log('\n📊 Resumo por categoria:');
    summary.forEach(item => {
      const categoryLabels: { [key: string]: string } = {
        marketing: 'Marketing',
        tools: 'Ferramentas',
        education: 'Educação',
        operational: 'Operacional',
        taxes: 'Tributário'
      };
      
      console.log(`   ${categoryLabels[item.category] || item.category}: R$ ${item._sum.amount?.toFixed(2)} (${item._count.id} despesas)`);
    });

    const totalAmount = summary.reduce((acc, item) => acc + (item._sum.amount || 0), 0);
    console.log(`\n💰 Total geral: R$ ${totalAmount.toFixed(2)}`);

    console.log('\n✅ Seed de despesas concluído!');

  } catch (error) {
    console.error('❌ Erro ao executar seed de despesas:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  seedExpenses();
}

export { seedExpenses };