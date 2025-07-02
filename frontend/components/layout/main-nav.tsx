'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Smartphone, 
  DollarSign, 
  CreditCard, 
  FileText, 
  TrendingUp, 
  Target,
  Settings,
  Home
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
    description: "Visão geral"
  },
  {
    title: "Anúncios",
    href: "/ads",
    icon: Smartphone,
    description: "Import CSV Meta Ads"
  },
  {
    title: "Receitas",
    href: "/revenue",
    icon: DollarSign,
    description: "Vendas via Kirvano"
  },
  {
    title: "Despesas",
    href: "/expenses",
    icon: CreditCard,
    description: "Controle de gastos"
  },
  {
    title: "Tributário",
    href: "/tax",
    icon: FileText,
    description: "Impostos e DAS"
  },
  {
    title: "Fluxo de Caixa",
    href: "/cashflow",
    icon: TrendingUp,
    description: "Projeções"
  },
  {
    title: "Produtos",
    href: "/products",
    icon: Target,
    description: "Gestão de produtos"
  },
  {
    title: "Configurações",
    href: "/settings",
    icon: Settings,
    description: "Conta e integrações"
  }
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-2 px-2 py-4">
      <div className="mb-4 px-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Home className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">FinanceInfo Pro</span>
        </Link>
      </div>
      
      {navigationItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href);
        const Icon = item.icon;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
              isActive 
                ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                : "text-muted-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            <div className="flex flex-col">
              <span>{item.title}</span>
              {!isActive && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}