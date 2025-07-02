const { PrismaClient } = require('@prisma/client');

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

    // Teste 1: Buscar despesas
    console.log('\n1. Buscando despesas...');
    const expenses = await prisma.expense.findMany({
      where: { userId: user.id },
      orderBy: { expenseDate: 'desc' }
    });
    console.log(`✅ ${expenses.length} despesas encontradas`);

    // Teste 2: Resumo por categoria
    console.log('\n2. Resumo por categoria...');
    const summary = {};
    let totalAmount = 0;

    expenses.forEach(expense => {
      if (!summary[expense.category]) {
        summary[expense.category] = { count: 0, total: 0 };
      }
      summary[expense.category].count++;
      summary[expense.category].total += Number(expense.amount);
      totalAmount += Number(expense.amount);
    });

    console.log('✅ Resumo:', summary);
    console.log(`💰 Total: R$ ${totalAmount.toFixed(2)}`);

    // Teste 3: Despesas recorrentes
    console.log('\n3. Despesas recorrentes...');
    const recurringExpenses = await prisma.expense.findMany({
      where: { 
        userId: user.id,
        isRecurring: true 
      }
    });
    console.log(`✅ ${recurringExpenses.length} despesas recorrentes encontradas`);

    // Teste 4: Despesas por categoria
    console.log('\n4. Despesas de marketing...');
    const marketingExpenses = await prisma.expense.findMany({
      where: { 
        userId: user.id,
        category: 'marketing'
      }
    });
    console.log(`✅ ${marketingExpenses.length} despesas de marketing`);
    marketingExpenses.forEach(expense => {
      console.log(`   - ${expense.description}: R$ ${Number(expense.amount).toFixed(2)}`);
    });

    // Teste 5: Criar nova despesa
    console.log('\n5. Criando nova despesa...');
    const newExpense = await prisma.expense.create({
      data: {
        userId: user.id,
        description: 'Teste - Despesa criada via API',
        amount: 123.45,
        category: 'operational',
        expenseDate: new Date(),
        isRecurring: false,
        recurrenceType: null,
        dueDate: null,
        invoiceUrl: null,
        invoiceData: null,
      }
    });
    console.log(`✅ Nova despesa criada: ${newExpense.id}`);

    console.log('\n🎉 Todos os testes passaram!');

  } catch (error) {
    console.error('❌ Erro nos testes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testExpenses();