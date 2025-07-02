'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Link, 
  Search, 
  CheckCircle, 
  AlertCircle, 
  Sparkles,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { AdCampaign, Product } from '@/types';

interface CampaignProductLinkingProps {
  campaigns: AdCampaign[];
  products: Product[];
  onLinkingComplete?: (linkedCampaigns: AdCampaign[]) => void;
}

interface LinkingSuggestion {
  campaignId: string;
  productId: string;
  productName: string;
  confidence: number;
  reason: string;
}

export function CampaignProductLinking({ 
  campaigns, 
  products, 
  onLinkingComplete 
}: CampaignProductLinkingProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [linkings, setLinkings] = useState<Record<string, string>>({});
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Gerar sugestões automáticas baseadas em similaridade de nomes
  const suggestions = useMemo(() => {
    const sug: LinkingSuggestion[] = [];
    
    campaigns.forEach(campaign => {
      if (linkings[campaign.id]) return; // Já vinculado
      
      products.forEach(product => {
        const campaignName = campaign.name.toLowerCase();
        const productName = product.name.toLowerCase();
        const productTags = product.tags.map(tag => tag.toLowerCase());
        
        let confidence = 0;
        const reasons: string[] = [];
        
        // Verificar similaridade de nome
        const commonWords = campaignName.split(' ').filter(word => 
          productName.includes(word) || productTags.some(tag => tag.includes(word))
        );
        
        if (commonWords.length > 0) {
          confidence += commonWords.length * 20;
          reasons.push(`Palavras em comum: ${commonWords.join(', ')}`);
        }
        
        // Verificar se o nome do produto está na campanha
        if (campaignName.includes(productName)) {
          confidence += 40;
          reasons.push('Nome do produto encontrado na campanha');
        }
        
        // Verificar tags do produto
        const matchingTags = productTags.filter(tag => campaignName.includes(tag));
        if (matchingTags.length > 0) {
          confidence += matchingTags.length * 15;
          reasons.push(`Tags relacionadas: ${matchingTags.join(', ')}`);
        }
        
        if (confidence > 30) {
          sug.push({
            campaignId: campaign.id,
            productId: product.id,
            productName: product.name,
            confidence: Math.min(confidence, 100),
            reason: reasons.join('; ')
          });
        }
      });
    });
    
    return sug.sort((a, b) => b.confidence - a.confidence);
  }, [campaigns, products, linkings]);

  // const unlinkedCampaigns = useMemo(() => {
  //   return campaigns.filter(campaign => !linkings[campaign.id]);
  // }, [campaigns, linkings]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [products, searchTerm]);

  const handleLink = (campaignId: string, productId: string) => {
    setLinkings(prev => ({
      ...prev,
      [campaignId]: productId
    }));
  };

  const handleUnlink = (campaignId: string) => {
    setLinkings(prev => {
      const newLinkings = { ...prev };
      delete newLinkings[campaignId];
      return newLinkings;
    });
  };

  const applySuggestion = (suggestion: LinkingSuggestion) => {
    handleLink(suggestion.campaignId, suggestion.productId);
  };

  const applyAllSuggestions = () => {
    const newLinkings = { ...linkings };
    suggestions.forEach(suggestion => {
      if (suggestion.confidence > 70) {
        newLinkings[suggestion.campaignId] = suggestion.productId;
      }
    });
    setLinkings(newLinkings);
  };

  const completeLinking = () => {
    const linkedCampaigns = campaigns.map(campaign => ({
      ...campaign,
      productId: linkings[campaign.id] || undefined,
      productName: linkings[campaign.id] 
        ? products.find(p => p.id === linkings[campaign.id])?.name 
        : undefined
    }));
    
    onLinkingComplete?.(linkedCampaigns);
  };

  const getProductById = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const linkedCount = Object.keys(linkings).length;
  const totalCampaigns = campaigns.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Vincular Campanhas aos Produtos
          </CardTitle>
          <CardDescription>
            Associe suas campanhas do Meta Ads aos produtos correspondentes para análises mais precisas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="font-medium">{linkedCount}</span> de{' '}
                <span className="font-medium">{totalCampaigns}</span> campanhas vinculadas
              </div>
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${(linkedCount / totalCampaigns) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {suggestions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {suggestions.length} Sugestões
                </Button>
              )}
              
              <Button
                onClick={completeLinking}
                disabled={linkedCount === 0}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Finalizar Vinculação
              </Button>
            </div>
          </div>

          {showSuggestions && suggestions.length > 0 && (
            <Alert className="mb-4">
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Encontramos {suggestions.length} sugestões automáticas de vinculação
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={applyAllSuggestions}
                  >
                    Aplicar Sugestões Confiáveis
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Sugestões Automáticas */}
      {showSuggestions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Sugestões Automáticas
            </CardTitle>
            <CardDescription>
              Baseado na similaridade entre nomes de campanhas e produtos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suggestions.map((suggestion) => {
                const campaign = campaigns.find(c => c.id === suggestion.campaignId);
                if (!campaign) return null;
                
                return (
                  <div
                    key={`${suggestion.campaignId}-${suggestion.productId}`}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{campaign.name}</span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-primary">{suggestion.productName}</span>
                        <Badge 
                          variant={
                            suggestion.confidence > 80 ? 'default' : 
                            suggestion.confidence > 60 ? 'secondary' : 
                            'outline'
                          }
                        >
                          {suggestion.confidence}% confiança
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.reason}
                      </p>
                    </div>
                    
                    <Button
                      size="sm"
                      onClick={() => applySuggestion(suggestion)}
                      disabled={!!linkings[suggestion.campaignId]}
                    >
                      {linkings[suggestion.campaignId] ? 'Vinculado' : 'Aplicar'}
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Campanhas */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>
            Clique em uma campanha para vinculá-la a um produto
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign) => {
              const linkedProduct = linkings[campaign.id] 
                ? getProductById(linkings[campaign.id])
                : null;
              
              return (
                <div
                  key={campaign.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    linkedProduct ? 'bg-green-50 dark:bg-green-950' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{campaign.name}</h3>
                        {linkedProduct ? (
                          <Badge variant="default" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {linkedProduct.name}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Não vinculado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Gasto: R$ {campaign.spent.toFixed(2)}</span>
                        <span>CTR: {campaign.ctr}%</span>
                        <span>ROAS: {campaign.roas}x</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {linkedProduct && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlink(campaign.id)}
                        >
                          Desvincular
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={linkedProduct ? "outline" : "default"}
                            size="sm"
                            onClick={() => setSelectedCampaign(campaign)}
                          >
                            {linkedProduct ? 'Alterar' : 'Vincular'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>
                              Vincular: {campaign.name}
                            </DialogTitle>
                            <DialogDescription>
                              Selecione o produto correspondente a esta campanha
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="search">Buscar Produto</Label>
                              <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input
                                  id="search"
                                  placeholder="Digite o nome do produto ou tag..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="pl-10"
                                />
                              </div>
                            </div>
                            
                            <div className="max-h-60 overflow-y-auto space-y-2">
                              {filteredProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                                  onClick={() => {
                                    handleLink(campaign.id, product.id);
                                    setSearchTerm('');
                                  }}
                                >
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <ShoppingCart className="h-4 w-4" />
                                      <span className="font-medium">{product.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-sm text-muted-foreground">
                                        R$ {product.price.toFixed(2)}
                                      </span>
                                      <div className="flex gap-1">
                                        {product.tags.map((tag) => (
                                          <Badge key={tag} variant="outline" className="text-xs">
                                            {tag}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <Button size="sm">
                                    Vincular
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}