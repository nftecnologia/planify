'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  CreditCard, 
  FileText, 
  Eye,
  Edit3,
  Trash2,
  Upload,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { api } from '@/lib/api';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  dueDate?: string;
  isRecurring: boolean;
  recurrenceType?: 'monthly' | 'yearly';
  invoiceUrl?: string;
  invoiceData?: any;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseSummary {
  total: number;
  monthly: number;
  percentOfRevenue: number;
  byCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
    count: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  growth: number;
}

interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  expenseDate: string;
  dueDate?: string;
  isRecurring: boolean;
  recurrenceType?: 'monthly' | 'yearly';
  invoiceUrl?: string;
}

// Mock data para fallback
const mockExpenses: Expense[] = [
  {
    id: '1',
    description: 'Meta Ads - Campanha Q4',
    amount: 2500,
    category: 'Marketing',
    expenseDate: '2025-06-25T10:00:00Z',
    isRecurring: true,
    recurrenceType: 'monthly',
    createdAt: '2025-06-25T10:00:00Z',
    updatedAt: '2025-06-25T10:00:00Z'
  },
  {
    id: '2',
    description: 'Notion - Workspace Pro',
    amount: 45,
    category: 'Ferramentas',
    expenseDate: '2025-06-20T14:30:00Z',
    isRecurring: true,
    recurrenceType: 'monthly',
    createdAt: '2025-06-20T14:30:00Z',
    updatedAt: '2025-06-20T14:30:00Z'
  },
  {
    id: '3',
    description: 'Consultoria Jurídica',
    amount: 800,
    category: 'Tributário',
    expenseDate: '2025-06-18T09:15:00Z',
    isRecurring: false,
    createdAt: '2025-06-18T09:15:00Z',
    updatedAt: '2025-06-18T09:15:00Z'
  },
  {
    id: '4',
    description: 'Hospedagem Digital Ocean',
    amount: 120,
    category: 'Infraestrutura',
    expenseDate: '2025-06-15T16:45:00Z',
    isRecurring: true,
    recurrenceType: 'monthly',
    createdAt: '2025-06-15T16:45:00Z',
    updatedAt: '2025-06-15T16:45:00Z'
  },
  {
    id: '5',
    description: 'Curso de Marketing Digital',
    amount: 497,
    category: 'Educação',
    expenseDate: '2025-06-10T11:20:00Z',
    isRecurring: false,
    createdAt: '2025-06-10T11:20:00Z',
    updatedAt: '2025-06-10T11:20:00Z'
  }
];

const mockSummary: ExpenseSummary = {
  total: 87650,
  monthly: 16630,
  percentOfRevenue: 35.7,
  byCategory: [
    { category: 'Marketing', amount: 58800, percentage: 67.1, count: 24 },
    { category: 'Ferramentas', amount: 14200, percentage: 16.2, count: 12 },
    { category: 'Operacional', amount: 8900, percentage: 10.2, count: 8 },
    { category: 'Educação', amount: 3500, percentage: 4.0, count: 5 },
    { category: 'Tributário', amount: 2250, percentage: 2.5, count: 3 }
  ],
  trend: 'up',
  growth: 12.5
};

const categories = [
  'Marketing',
  'Ferramentas',
  'Infraestrutura', 
  'Operacional',
  'Educação',
  'Tributário',
  'Contabilidade',
  'Jurídico',
  'Outros'
];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showRecurringOnly, setShowRecurringOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateExpenseData>({
    description: '',
    amount: 0,
    category: '',
    expenseDate: new Date().toISOString().split('T')[0],
    isRecurring: false
  });

  useEffect(() => {
    loadExpensesData();
  }, []);

  const loadExpensesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Tentar API real primeiro, fallback para mock
      try {
        const [expensesResponse, summaryResponse] = await Promise.all([
          api.get<{ data: Expense[] }>('/expenses'),
          api.get<{ data: ExpenseSummary }>('/expenses/summary')
        ]);

        setExpenses(expensesResponse.data);
        setSummary(summaryResponse.data);
      } catch (apiError) {
        console.log('API real não disponível, usando dados mock...');
        
        // Simular delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setExpenses(mockExpenses);
        setSummary(mockSummary);
      }
    } catch (err: any) {
      console.error('Erro ao carregar despesas:', err);
      setError('Erro ao carregar dados das despesas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Tentar API real
      const response = await api.post<{ data: Expense }>('/expenses', formData);
      setExpenses(prev => [response.data, ...prev]);
      
      // Recarregar resumo
      loadExpensesData();
      
      setIsCreateModalOpen(false);
      resetForm();
    } catch (error) {
      // Mock para demonstração
      const newExpense: Expense = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setExpenses(prev => [newExpense, ...prev]);
      setIsCreateModalOpen(false);
      resetForm();
    }
  };

  const handleEditExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingExpense) return;
    
    try {
      // Tentar API real
      const response = await api.put<{ data: Expense }>(`/expenses/${editingExpense.id}`, formData);
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? response.data : exp));
      
      setIsEditModalOpen(false);
      setEditingExpense(null);
      resetForm();
    } catch (error) {
      // Mock para demonstração
      const updatedExpense: Expense = {
        ...editingExpense,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      setExpenses(prev => prev.map(exp => exp.id === editingExpense.id ? updatedExpense : exp));
      setIsEditModalOpen(false);
      setEditingExpense(null);
      resetForm();
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;
    
    try {
      await api.delete(`/expenses/${expenseId}`);
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    } catch (error) {
      // Mock para demonstração
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      category: '',
      expenseDate: new Date().toISOString().split('T')[0],
      isRecurring: false
    });
  };

  const openEditModal = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      expenseDate: expense.expenseDate.split('T')[0],
      isRecurring: expense.isRecurring,
      recurrenceType: expense.recurrenceType
    });
    setIsEditModalOpen(true);
  };

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    const matchesRecurring = !showRecurringOnly || expense.isRecurring;
    
    return matchesSearch && matchesCategory && matchesRecurring;
  });

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Despesas</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Despesas</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Despesas</h1>
        <div className="flex items-center space-x-2">
          <Button onClick={loadExpensesData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Despesa</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Ex: Meta Ads - Campanha Q4"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expenseDate">Data da Despesa</Label>
                  <Input
                    id="expenseDate"
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  />
                  <Label htmlFor="isRecurring">Despesa recorrente</Label>
                </div>
                {formData.isRecurring && (
                  <div>
                    <Label htmlFor="recurrenceType">Tipo de Recorrência</Label>
                    <Select value={formData.recurrenceType} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceType: value as 'monthly' | 'yearly' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Mensal</SelectItem>
                        <SelectItem value="yearly">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Criar Despesa</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Resumo das Despesas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Despesas</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.total || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.percentOfRevenue || 0}% da receita
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Mensais</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary?.monthly || 0)}</div>
            <div className="flex items-center space-x-1">
              {summary?.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-600" />
              )}
              <p className="text-xs text-muted-foreground">
                {summary?.growth || 0}% vs mês anterior
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Categoria</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.byCategory[0]?.category || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(summary?.byCategory[0]?.amount || 0)} ({summary?.byCategory[0]?.percentage || 0}%)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expenses.length}</div>
            <p className="text-xs text-muted-foreground">
              {expenses.filter(e => e.isRecurring).length} recorrentes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar despesas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="min-w-[160px]">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="recurringFilter"
                checked={showRecurringOnly}
                onChange={(e) => setShowRecurringOnly(e.target.checked)}
              />
              <Label htmlFor="recurringFilter">Apenas recorrentes</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Despesas ({filteredExpenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Badge variant="secondary">{expense.category}</Badge>
                        <span>{formatDate(expense.expenseDate)}</span>
                        {expense.isRecurring && (
                          <Badge variant="outline">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            {expense.recurrenceType === 'monthly' ? 'Mensal' : 'Anual'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(expense)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredExpenses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Nenhuma despesa encontrada</p>
                <p className="text-sm">Tente ajustar os filtros ou adicionar uma nova despesa</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {summary?.byCategory.map((category, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{category.category}</h3>
                  <Badge variant="outline">{category.count} despesas</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-medium">{formatCurrency(category.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">% do Total</span>
                    <span className="font-medium">{category.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${category.percentage}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Despesa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditExpense} className="space-y-4">
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-amount">Valor</Label>
              <Input
                id="edit-amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoria</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-expenseDate">Data da Despesa</Label>
              <Input
                id="edit-expenseDate"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expenseDate: e.target.value }))}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
              />
              <Label htmlFor="edit-isRecurring">Despesa recorrente</Label>
            </div>
            {formData.isRecurring && (
              <div>
                <Label htmlFor="edit-recurrenceType">Tipo de Recorrência</Label>
                <Select value={formData.recurrenceType} onValueChange={(value) => setFormData(prev => ({ ...prev, recurrenceType: value as 'monthly' | 'yearly' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}