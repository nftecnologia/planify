import dotenv from 'dotenv';

// Carrega variáveis de ambiente para testes
dotenv.config({ path: '.env.test' });

// Mock do Prisma para testes
export const prismaMock = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  product: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  sale: {
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  expense: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  adSpend: {
    findMany: jest.fn(),
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  $disconnect: jest.fn(),
  $connect: jest.fn(),
};

// Mock do Redis para testes
export const redisMock = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  ping: jest.fn().mockResolvedValue('PONG'),
  disconnect: jest.fn(),
};

// Setup global antes de todos os testes
beforeAll(async () => {
  // Mock do Prisma Client
  jest.mock('../src/lib/prisma', () => ({
    prisma: prismaMock,
  }));

  // Mock do Redis
  jest.mock('redis', () => ({
    createClient: jest.fn(() => redisMock),
  }));
});

// Cleanup após cada teste
afterEach(() => {
  jest.clearAllMocks();
});

// Cleanup após todos os testes
afterAll(async () => {
  jest.restoreAllMocks();
});

// Helper para criar usuário de teste
export const createTestUser = () => ({
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  plan: 'FREE',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
});

// Helper para criar produto de teste
export const createTestProduct = () => ({
  id: 'test-product-id',
  userId: 'test-user-id',
  name: 'Produto Teste',
  description: 'Descrição do produto teste',
  price: 197.00,
  monthlyGoal: 10000.00,
  category: 'curso',
  tags: '["marketing", "vendas"]',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
});

// Helper para criar venda de teste
export const createTestSale = () => ({
  id: 'test-sale-id',
  userId: 'test-user-id',
  kirvanoSaleId: 'kirvano-123',
  customerName: 'Cliente Teste',
  customerEmail: 'cliente@teste.com',
  totalPrice: 197.00,
  saleType: 'ONE_TIME',
  status: 'APPROVED',
  utmCampaign: 'campanha-teste',
  saleDate: new Date(),
  createdAt: new Date(),
});

// Helper para criar despesa de teste
export const createTestExpense = () => ({
  id: 'test-expense-id',
  userId: 'test-user-id',
  description: 'Despesa Teste',
  amount: 100.00,
  category: 'marketing',
  isRecurring: false,
  expenseDate: new Date(),
  createdAt: new Date(),
});
