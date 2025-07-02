import { PrismaClient } from '@prisma/client';
import { ExpenseService } from '../src/services/expenseService';

const prisma = new PrismaClient();

async function testExpenses() {
  try {
    console.log('🧪 Testando serviço de despesas...');

    // Buscar primeiro usuário
    const user = await prisma.user.findFirst({
      where: { isActive: true }
    });

    if (!user) {
      console.log('❌ Nenhum usuário encontrado');
      process.exit(1);
    }

    console.log(`👤 Usuário: ${user.email}`);

    // Teste 1: Criar despesa
    console.log('\n1. Criando despesa de teste...');
    const expense = await ExpenseService.createExpense(user.id, {
      description: 'Meta Ads - Teste automático',
      amount: 250.00,
      expenseDate: new Date(),
      isRecurring: false,
    });
    console.log(`✅ Despesa criada: ${expense.id} - ${expense.description} - R$ ${expense.amount}`);

    // Teste 2: Buscar despesas
    console.log('\n2. Buscando despesas...');
    const result = await ExpenseService.getExpenses(user.id);
    console.log(`✅ ${result.expenses.length} despesas encontradas`);

    // Teste 3: Resumo
    console.log('\n3. Resumo de despesas...');
    const summary = await ExpenseService.getExpenseSummary(user.id);
    console.log(`✅ Total: R$ ${summary.totalAmount}`);
    console.log('   Por categoria:', summary.byCategory);

    // Teste 4: Análise
    console.log('\n4. Análise por categoria...');
    const analysis = await ExpenseService.getCategoryAnalysis(user.id);
    console.log('✅ Análise:', analysis.map(a => `${a.label}: R$ ${a.amount} (${a.percentage}%)`));

    // Teste 5: Categorias disponíveis
    console.log('\n5. Categorias disponíveis...');
    const categories = ExpenseService.getAvailableCategories();
    console.log('✅ Categorias:', categories.map(c => c.label));

    console.log('\n✅ Todos os testes passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExpenses();