'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Target, 
  Search, 
  Edit, 
  Trash2, 
  BarChart3, 
  Filter,
  ImageIcon,
  Tag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { Product } from "@/types";

// Interface para regras de vinculação
interface LinkingRule {
  id: string;
  name: string;
  condition: string;
  value: string;
  productId: string;
  productName: string;
  active: boolean;
}

// Dados mock para fallback inteligente
const mockProducts: Product[] = [
  {
    id: '1',
    name: "Curso Marketing Digital",
    price: 497,
    monthlyGoal: 15000,
    tags: ['marketing', 'digital', 'curso', 'online'],
    salesCount: 63,
    revenue: 31311,
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: "Ebook Copywriting Avançado",
    price: 67,
    monthlyGoal: 10000,
    tags: ['copywriting', 'ebook', 'vendas', 'persuasão'],
    salesCount: 210,
    revenue: 14070,
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: "Mentoria Estratégia Digital",
    price: 1997,
    monthlyGoal: 25000,
    tags: ['mentoria', 'estratégia', 'consultoria', 'premium'],
    salesCount: 8,
    revenue: 15976,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockLinkingRules: LinkingRule[] = [
  {
    id: '1',
    name: 'Regra Marketing Digital',
    condition: 'contains',
    value: 'marketing',
    productId: '1',
    productName: 'Curso Marketing Digital',
    active: true
  },
  {
    id: '2',
    name: 'Regra Copywriting',
    condition: 'utm_campaign',
    value: 'copy-ebook',
    productId: '2',
    productName: 'Ebook Copywriting Avançado',
    active: true
  },
  {
    id: '3',
    name: 'Regra Mentoria',
    condition: 'contains',
    value: 'mentoria',
    productId: '3',
    productName: 'Mentoria Estratégia Digital',
    active: false
  }
];

export default function ProductsPage() {
  // Estados principais
  const [products, setProducts] = useState<Product[]>([]);
  const [linkingRules, setLinkingRules] = useState<LinkingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApiAvailable, setIsApiAvailable] = useState(true);
  
  // Estados de UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false);
  
  // Estados do produto sendo editado
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    monthlyGoal: '',
    tags: '',
    description: ''
  });
  
  // Estados das regras
  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    condition: 'contains',
    value: '',
    productId: ''
  });
  
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      // Tentar carregar dados da API
      const [productsData, rulesData] = await Promise.all([
        api.get<Product[]>('/products'),
        api.get<LinkingRule[]>('/products/linking-rules')
      ]);
      
      setProducts(productsData);
      setLinkingRules(rulesData);
      setIsApiAvailable(true);
      
      toast({
        title: "Dados carregados",
        description: "Produtos e regras carregados com sucesso",
      });
    } catch (error) {
      console.warn('API não disponível, usando dados mock:', error);
      
      // Fallback para dados mock
      setProducts(mockProducts);
      setLinkingRules(mockLinkingRules);
      setIsApiAvailable(false);
      
      toast({
        title: "Modo Offline",
        description: "Usando dados de demonstração. Conecte-se à API para dados reais.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (selectedCategory === 'all') return matchesSearch;
    if (selectedCategory === 'high-performance') return matchesSearch && (product.revenue / product.monthlyGoal) > 0.8;
    if (selectedCategory === 'low-performance') return matchesSearch && (product.revenue / product.monthlyGoal) < 0.5;
    if (selectedCategory === 'premium') return matchesSearch && product.price > 500;
    
    return matchesSearch;
  });

  // Funções CRUD
  const createProduct = async () => {
    if (!formData.name || !formData.price || !formData.monthlyGoal) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const newProduct: Omit<Product, 'id' | 'salesCount' | 'revenue' | 'createdAt' | 'updatedAt'> = {
        name: formData.name,
        price: parseFloat(formData.price),
        monthlyGoal: parseFloat(formData.monthlyGoal),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (isApiAvailable) {
        const created = await api.post<Product>('/products', newProduct);
        setProducts(prev => [...prev, created]);
      } else {
        // Mock creation
        const created: Product = {
          ...newProduct,
          id: Math.random().toString(36).substr(2, 9),
          salesCount: 0,
          revenue: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setProducts(prev => [...prev, created]);
      }

      resetForm();
      setIsCreateDialogOpen(false);
      
      toast({
        title: "Produto criado",
        description: `${formData.name} foi adicionado com sucesso`,
      });
    } catch {
      toast({
        title: "Erro ao criar produto",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const updateProduct = async () => {
    if (!editingProduct || !formData.name || !formData.price || !formData.monthlyGoal) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const updatedData = {
        name: formData.name,
        price: parseFloat(formData.price),
        monthlyGoal: parseFloat(formData.monthlyGoal),
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      };

      if (isApiAvailable) {
        const updated = await api.put<Product>(`/products/${editingProduct.id}`, updatedData);
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      } else {
        // Mock update
        const updated: Product = {
          ...editingProduct,
          ...updatedData,
          updatedAt: new Date().toISOString()
        };
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? updated : p));
      }

      resetForm();
      setIsEditDialogOpen(false);
      setEditingProduct(null);
      
      toast({
        title: "Produto atualizado",
        description: `${formData.name} foi atualizado com sucesso`,
      });
    } catch {
      toast({
        title: "Erro ao atualizar produto",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const deleteProduct = async () => {
    if (!productToDelete) return;

    setProcessing(true);
    try {
      if (isApiAvailable) {
        await api.delete(`/products/${productToDelete.id}`);
      }
      
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
      
      toast({
        title: "Produto excluído",
        description: `${productToDelete.name} foi removido com sucesso`,
      });
    } catch {
      toast({
        title: "Erro ao excluir produto",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Função para criar regra de vinculação
  const createLinkingRule = async () => {
    if (!ruleFormData.name || !ruleFormData.value || !ruleFormData.productId) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos da regra",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const product = products.find(p => p.id === ruleFormData.productId);
      if (!product) return;

      const newRule: LinkingRule = {
        id: Math.random().toString(36).substr(2, 9),
        name: ruleFormData.name,
        condition: ruleFormData.condition,
        value: ruleFormData.value,
        productId: ruleFormData.productId,
        productName: product.name,
        active: true
      };

      if (isApiAvailable) {
        const created = await api.post<LinkingRule>('/products/linking-rules', newRule);
        setLinkingRules(prev => [...prev, created]);
      } else {
        setLinkingRules(prev => [...prev, newRule]);
      }

      setRuleFormData({ name: '', condition: 'contains', value: '', productId: '' });
      setIsRuleDialogOpen(false);
      
      toast({
        title: "Regra criada",
        description: `Regra "${ruleFormData.name}" foi adicionada com sucesso`,
      });
    } catch {
      toast({
        title: "Erro ao criar regra",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  // Funções auxiliares
  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      monthlyGoal: '',
      tags: '',
      description: ''
    });
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price.toString(),
      monthlyGoal: product.monthlyGoal.toString(),
      tags: product.tags.join(', '),
      description: ''
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const calculateGoalPercentage = (revenue: number, goal: number) => {
    return Math.round((revenue / goal) * 100);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-100 text-green-800';
    if (percentage >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };


  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-semibold">Carregando produtos...</h2>
          <p className="text-muted-foreground">Aguarde enquanto carregamos seus dados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header com indicador de status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Produtos</h1>
          <div className="flex items-center gap-2 mt-2">
            {isApiAvailable ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600">Conectado à API</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600">Modo demonstração</span>
              </>
            )}
          </div>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      {/* Métricas resumidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Produtos</p>
                <p className="text-2xl font-bold">{products.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(products.reduce((sum, p) => sum + p.revenue, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Meta Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(products.reduce((sum, p) => sum + p.monthlyGoal, 0))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vendas Totais</p>
                <p className="text-2xl font-bold">
                  {products.reduce((sum, p) => sum + p.salesCount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produtos por nome ou tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                <SelectItem value="high-performance">Alto desempenho (80%+)</SelectItem>
                <SelectItem value="low-performance">Baixo desempenho (-50%)</SelectItem>
                <SelectItem value="premium">Premium (R$ 500+)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Grid com produtos e regras */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Lista de produtos */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Produtos Cadastrados</CardTitle>
              <CardDescription>
                {filteredProducts.length} de {products.length} produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Nenhum produto encontrado</h3>
                  <p className="text-muted-foreground">
                    {products.length === 0 
                      ? "Comece criando seu primeiro produto"
                      : "Tente ajustar os filtros de busca"
                    }
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => {
                    const goalPercentage = calculateGoalPercentage(product.revenue, product.monthlyGoal);
                    return (
                      <div key={product.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{product.name}</h3>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Preço: {formatCurrency(product.price)}</span>
                              <span>Meta: {formatCurrency(product.monthlyGoal)}</span>
                              <span>Vendas: {product.salesCount}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mt-3">
                              <span className="text-sm font-medium">Receita:</span>
                              <span className="text-lg font-bold text-green-600">
                                {formatCurrency(product.revenue)}
                              </span>
                              <Badge className={getPerformanceColor(goalPercentage)}>
                                {goalPercentage}% da meta
                              </Badge>
                            </div>
                            
                            {product.tags.length > 0 && (
                              <div className="flex items-center gap-1 mt-2">
                                <Tag className="h-3 w-3 text-muted-foreground" />
                                <div className="flex flex-wrap gap-1">
                                  {product.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(product)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDeleteDialog(product)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button size="sm">
                              <BarChart3 className="h-4 w-4 mr-2" />
                              Relatório
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Regras de vinculação */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Regras de Vinculação
              </CardTitle>
              <CardDescription>
                Configure regras automáticas para vincular campanhas aos produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {linkingRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{rule.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {rule.condition === 'contains' ? 'Contém' : 'UTM Campaign'}: &quot;{rule.value}&quot;
                        </div>
                        <div className="text-xs text-blue-600">
                          → {rule.productName}
                        </div>
                      </div>
                      <Badge variant={rule.active ? "default" : "secondary"}>
                        {rule.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsRuleDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Nova Regra
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog para criar produto */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Criar Novo Produto</DialogTitle>
            <DialogDescription>
              Adicione um novo produto ao seu catálogo com informações detalhadas
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto *</Label>
                <Input
                  placeholder="Ex: Curso Marketing Digital"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Preço de Venda *</Label>
                <Input
                  type="number"
                  placeholder="497.00"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Meta de Faturamento Mensal *</Label>
              <Input
                type="number"
                placeholder="15000.00"
                value={formData.monthlyGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyGoal: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Tags para Vinculação</Label>
              <Input
                placeholder="marketing, digital, curso (separado por vírgulas)"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descrição detalhada do produto..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button onClick={createProduct} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Produto
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar produto */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Altere as informações do produto selecionado
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome do Produto *</Label>
                <Input
                  placeholder="Ex: Curso Marketing Digital"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label>Preço de Venda *</Label>
                <Input
                  type="number"
                  placeholder="497.00"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Meta de Faturamento Mensal *</Label>
              <Input
                type="number"
                placeholder="15000.00"
                value={formData.monthlyGoal}
                onChange={(e) => setFormData(prev => ({ ...prev, monthlyGoal: e.target.value }))}
              />
            </div>
            
            <div>
              <Label>Tags para Vinculação</Label>
              <Input
                placeholder="marketing, digital, curso (separado por vírgulas)"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              />
            </div>

            <div>
              <Label>Descrição (opcional)</Label>
              <Textarea
                placeholder="Descrição detalhada do produto..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button onClick={updateProduct} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para excluir produto */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto &quot;{productToDelete?.name}&quot;?
              Esta ação não pode ser desfeita e todas as regras de vinculação 
              relacionadas também serão removidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={deleteProduct} 
              disabled={processing}
              className="bg-red-600 hover:bg-red-700"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                'Excluir Produto'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog para criar regra */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Regra de Vinculação</DialogTitle>
            <DialogDescription>
              Configure uma regra para vincular campanhas automaticamente a produtos
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div>
              <Label>Nome da Regra *</Label>
              <Input
                placeholder="Ex: Regra Marketing Digital"
                value={ruleFormData.name}
                onChange={(e) => setRuleFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Condição</Label>
                <Select value={ruleFormData.condition} onValueChange={(value) => 
                  setRuleFormData(prev => ({ ...prev, condition: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contains">Nome contém</SelectItem>
                    <SelectItem value="utm_campaign">UTM Campaign</SelectItem>
                    <SelectItem value="utm_source">UTM Source</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Valor *</Label>
                <Input
                  placeholder="marketing"
                  value={ruleFormData.value}
                  onChange={(e) => setRuleFormData(prev => ({ ...prev, value: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label>Produto de Destino *</Label>
              <Select value={ruleFormData.productId} onValueChange={(value) => 
                setRuleFormData(prev => ({ ...prev, productId: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsRuleDialogOpen(false)}
              disabled={processing}
            >
              Cancelar
            </Button>
            <Button onClick={createLinkingRule} disabled={processing}>
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Criar Regra
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}