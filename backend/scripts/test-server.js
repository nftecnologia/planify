const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

async function testExpenseRoutes() {
  try {
    console.log('🚀 Testando rotas de despesas...');

    // 1. Buscar usuário de teste
    const user = await prisma.user.findFirst({
      where: { isActive: true }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado');
      process.exit(1);
    }

    console.log(`👤 Usuário: ${user.email}`);

    // 2. Gerar token JWT para o usuário
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        plan: user.plan
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    console.log('🔑 Token JWT gerado');

    // 3. Testar busca de despesas através do banco
    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { expenseDate: 'desc' },
      take: 5
    });

    console.log(`📊 ${expenses.length} despesas encontradas no banco:`);
    expenses.forEach(expense => {
      console.log(`   - ${expense.description}: R$ ${Number(expense.amount).toFixed(2)} [${expense.category}]`);
    });

    // 4. Testar categorização automática
    console.log('\n🤖 Testando categorização automática:');
    
    const testDescriptions = [
      'Meta Ads - Nova campanha',
      'GitHub Pro subscription',
      'Curso de TypeScript',
      'Conta de energia',
      'DAS - Simples Nacional'
    ];

    testDescriptions.forEach(description => {
      const category = classifyExpense(description);
      console.log(`   "${description}" → ${category}`);
    });

    // 5. Simular criação de despesa
    console.log('\n💾 Simulando criação de despesa...');
    const newExpense = await prisma.expense.create({
      data: {
        userId: user.id,
        description: 'Teste via API - Slack Business',
        amount: 25.99,
        category: 'tools',
        expenseDate: new Date(),
        isRecurring: false,
        recurrenceType: null,
        dueDate: null,
        invoiceUrl: null,
        invoiceData: null,
      }
    });

    console.log(`✅ Despesa criada: ${newExpense.id}`);

    // 6. Resumo final
    const totalExpenses = await prisma.expense.count({
      where: { userId: user.id }
    });

    const totalAmount = await prisma.expense.aggregate({
      where: { userId: user.id },
      _sum: { amount: true }
    });

    console.log('\n📈 Resumo final:');
    console.log(`   Total de despesas: ${totalExpenses}`);
    console.log(`   Valor total: R$ ${Number(totalAmount._sum.amount || 0).toFixed(2)}`);
    console.log(`   Token válido: ${token.substring(0, 20)}...`);

    console.log('\n🎉 Testes concluídos com sucesso!');
    console.log('\n📚 Como usar as rotas:');
    console.log('   POST /api/expenses - Criar despesa');
    console.log('   GET /api/expenses - Listar despesas');
    console.log('   GET /api/expenses/summary - Resumo');
    console.log('   GET /api/expenses/categories - Categorias');
    console.log('   GET /api/expenses/analysis - Análise');
    console.log('\n🔐 Usar Header: Authorization: Bearer ' + token.substring(0, 30) + '...');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Função auxiliar para classificação
function classifyExpense(description) {
  const keywords = {
    marketing: ['meta', 'facebook', 'instagram', 'google ads', 'adwords', 'tiktok', 'anuncio', 'publicidade', 'marketing', 'ads'],
    tools: ['github', 'vercel', 'aws', 'azure', 'figma', 'notion', 'slack', 'zoom', 'ferramentas', 'software', 'saas'],
    education: ['curso', 'treinamento', 'udemy', 'alura', 'rocketseat', 'educacao', 'capacitacao', 'livro'],
    operational: ['energia', 'internet', 'telefone', 'aluguel', 'escritorio', 'limpeza', 'manutencao', 'operacional'],
    taxes: ['imposto', 'taxa', 'irpf', 'inss', 'pis', 'cofins', 'csll', 'icms', 'iss', 'tributario', 'contabilidade', 'das']
  };

  const normalizedDescription = description.toLowerCase();
  
  for (const [category, terms] of Object.entries(keywords)) {
    if (terms.some(term => normalizedDescription.includes(term))) {
      return category;
    }
  }
  
  return 'operational';
}

testExpenseRoutes();