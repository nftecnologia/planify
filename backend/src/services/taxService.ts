// Tax Service - Cálculos Tributários Brasil
// Especializado para infoprodutores: MEI, Simples Nacional, Lucro Presumido

export interface TaxSettings {
  regime: 'MEI' | 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO';
  cnpj: string;
  startDate: Date;
  isServiceProvider: boolean; // MEI serviços = 11%, comércio = 6%
  mensalReservePercentage?: number; // % automático para reserva
}

export interface MonthlyRevenue {
  month: number;
  year: number;
  revenue: number;
}

export interface TaxCalculation {
  regime: string;
  period: string;
  grossRevenue: number;
  taxableRevenue: number;
  taxRate: number;
  taxAmount: number;
  dueDate: Date;
  breakdown: {
    irpj?: number;
    csll?: number;
    pis?: number;
    cofins?: number;
    icms?: number;
    iss?: number;
  };
}

export interface DASSchedule {
  month: number;
  year: number;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  reference: string; // Ex: "DAS MEI Janeiro/2025"
}

export interface TaxReserve {
  totalReserved: number;
  totalRequired: number;
  monthlyReserve: number;
  insufficientFunds: boolean;
  nextPaymentAmount: number;
  nextPaymentDate: Date;
}

export class TaxService {
  
  // Tabela Simples Nacional - Anexo V (Serviços)
  // Atualizada para 2025
  private static SIMPLES_NACIONAL_ANEXO_V = [
    { min: 0, max: 180000, rate: 0.155, deduction: 0 },
    { min: 180000.01, max: 360000, rate: 0.18, deduction: 4500 },
    { min: 360000.01, max: 720000, rate: 0.195, deduction: 9900 },
    { min: 720000.01, max: 1800000, rate: 0.205, deduction: 17100 },
    { min: 1800000.01, max: 3600000, rate: 0.23, deduction: 62100 },
    { min: 3600000.01, max: 4800000, rate: 0.305, deduction: 540000 }
  ];

  // MEI - Valores 2025
  private static MEI_LIMITS = {
    ANNUAL_LIMIT: 81000, // R$ 81.000/ano
    SERVICE_RATE: 0.11, // 11% para serviços
    COMMERCE_RATE: 0.06, // 6% para comércio
    MONTHLY_DAS: {
      SERVICE: 68.00, // INSS + ISS
      COMMERCE: 63.00 // INSS + ICMS
    }
  };

  // Lucro Presumido - Alíquotas 2025
  private static LUCRO_PRESUMIDO = {
    PRESUMED_PROFIT_RATE: 0.32, // 32% da receita bruta
    IRPJ_RATE: 0.15, // 15% sobre lucro presumido
    CSLL_RATE: 0.09, // 9% sobre lucro presumido
    PIS_RATE: 0.0065, // 0,65% sobre receita bruta
    COFINS_RATE: 0.03, // 3% sobre receita bruta
    ISS_RATE: 0.05 // 5% sobre receita de serviços (varia por município)
  };

  /**
   * Calcula imposto MEI
   */
  static calculateMEI(revenue: number, isServiceProvider: boolean): TaxCalculation {
    const annualLimit = this.MEI_LIMITS.ANNUAL_LIMIT;
    
    if (revenue > annualLimit) {
      throw new Error(`MEI: Faturamento anual (R$ ${revenue.toFixed(2)}) excede limite de R$ ${annualLimit.toFixed(2)}`);
    }

    const monthlyDAS = isServiceProvider 
      ? this.MEI_LIMITS.MONTHLY_DAS.SERVICE
      : this.MEI_LIMITS.MONTHLY_DAS.COMMERCE;

    const taxRate = isServiceProvider 
      ? this.MEI_LIMITS.SERVICE_RATE 
      : this.MEI_LIMITS.COMMERCE_RATE;

    return {
      regime: 'MEI',
      period: 'monthly',
      grossRevenue: revenue,
      taxableRevenue: revenue,
      taxRate: taxRate,
      taxAmount: monthlyDAS,
      dueDate: this.getNextDASDate(),
      breakdown: {
        iss: isServiceProvider ? 5.00 : 0,
        icms: !isServiceProvider ? 1.00 : 0
      }
    };
  }

  /**
   * Calcula Simples Nacional (Anexo V - Serviços)
   */
  static calculateSimplesNacional(annualRevenue: number): TaxCalculation {
    const bracket = this.SIMPLES_NACIONAL_ANEXO_V.find(
      b => annualRevenue >= b.min && annualRevenue <= b.max
    );

    if (!bracket) {
      throw new Error(`Simples Nacional: Faturamento anual (R$ ${annualRevenue.toFixed(2)}) excede limite`);
    }

    // Cálculo progressivo
    const effectiveRate = (annualRevenue * bracket.rate - bracket.deduction) / annualRevenue;
    const monthlyTax = (annualRevenue * effectiveRate) / 12;

    return {
      regime: 'SIMPLES_NACIONAL',
      period: 'monthly',
      grossRevenue: annualRevenue,
      taxableRevenue: annualRevenue,
      taxRate: effectiveRate,
      taxAmount: monthlyTax,
      dueDate: this.getNextDASDate(),
      breakdown: {
        irpj: monthlyTax * 0.15,
        csll: monthlyTax * 0.09,
        pis: monthlyTax * 0.0065,
        cofins: monthlyTax * 0.03,
        iss: monthlyTax * 0.05
      }
    };
  }

  /**
   * Calcula Lucro Presumido
   */
  static calculateLucroPresumido(revenue: number): TaxCalculation {
    const presumedProfit = revenue * this.LUCRO_PRESUMIDO.PRESUMED_PROFIT_RATE;
    
    const irpj = presumedProfit * this.LUCRO_PRESUMIDO.IRPJ_RATE;
    const csll = presumedProfit * this.LUCRO_PRESUMIDO.CSLL_RATE;
    const pis = revenue * this.LUCRO_PRESUMIDO.PIS_RATE;
    const cofins = revenue * this.LUCRO_PRESUMIDO.COFINS_RATE;
    const iss = revenue * this.LUCRO_PRESUMIDO.ISS_RATE;
    
    const totalTax = irpj + csll + pis + cofins + iss;
    const effectiveRate = totalTax / revenue;

    return {
      regime: 'LUCRO_PRESUMIDO',
      period: 'monthly',
      grossRevenue: revenue,
      taxableRevenue: presumedProfit,
      taxRate: effectiveRate,
      taxAmount: totalTax,
      dueDate: this.getNextDARFDate(),
      breakdown: {
        irpj,
        csll,
        pis,
        cofins,
        iss
      }
    };
  }

  /**
   * Simulador comparativo de regimes
   */
  static compareRegimes(annualRevenue: number, isServiceProvider: boolean = true) {
    const results = [];

    // MEI (se dentro do limite)
    try {
      const mei = this.calculateMEI(annualRevenue, isServiceProvider);
      results.push({
        regime: 'MEI',
        annualTax: mei.taxAmount * 12,
        effectiveRate: mei.taxRate,
        monthlyPayment: mei.taxAmount,
        pros: ['Simplicidade', 'Menor custo contábil', 'Aposentadoria por idade'],
        cons: annualRevenue > 81000 ? ['Faturamento excede limite'] : ['Limite de faturamento', 'Não deduz despesas']
      });
    } catch (error) {
      results.push({
        regime: 'MEI',
        annualTax: null,
        effectiveRate: null,
        monthlyPayment: null,
        pros: [],
        cons: ['Faturamento excede limite de R$ 81.000']
      });
    }

    // Simples Nacional
    try {
      const simples = this.calculateSimplesNacional(annualRevenue);
      results.push({
        regime: 'Simples Nacional',
        annualTax: simples.taxAmount * 12,
        effectiveRate: simples.taxRate,
        monthlyPayment: simples.taxAmount,
        pros: ['Unifica vários impostos', 'Tributação progressiva', 'Boa para crescimento'],
        cons: ['Maior complexidade que MEI', 'Limitações de atividades']
      });
    } catch (error) {
      results.push({
        regime: 'Simples Nacional',
        annualTax: null,
        effectiveRate: null,
        monthlyPayment: null,
        pros: [],
        cons: ['Faturamento excede limite do Simples Nacional']
      });
    }

    // Lucro Presumido
    const presumido = this.calculateLucroPresumido(annualRevenue / 12);
    results.push({
      regime: 'Lucro Presumido',
      annualTax: presumido.taxAmount * 12,
      effectiveRate: presumido.taxRate,
      monthlyPayment: presumido.taxAmount,
      pros: ['Permite deduções', 'Sem limite de faturamento', 'Flexibilidade'],
      cons: ['Maior complexidade', 'Tributação fixa sobre receita presumida']
    });

    // Ordena por menor custo
    return results
      .filter(r => r.annualTax !== null)
      .sort((a, b) => (a.annualTax || 0) - (b.annualTax || 0));
  }

  /**
   * Calcula reserva necessária
   */
  static calculateTaxReserve(
    settings: TaxSettings, 
    monthlyRevenues: MonthlyRevenue[],
    currentReserve: number = 0
  ): TaxReserve {
    const totalRevenue = monthlyRevenues.reduce((sum, mr) => sum + mr.revenue, 0);
    let taxCalculation: TaxCalculation;

    // Calcula imposto baseado no regime
    switch (settings.regime) {
      case 'MEI':
        taxCalculation = this.calculateMEI(totalRevenue, settings.isServiceProvider);
        break;
      case 'SIMPLES_NACIONAL':
        taxCalculation = this.calculateSimplesNacional(totalRevenue);
        break;
      case 'LUCRO_PRESUMIDO':
        taxCalculation = this.calculateLucroPresumido(totalRevenue / 12);
        break;
      default:
        throw new Error(`Regime tributário não suportado: ${settings.regime}`);
    }

    const monthlyTaxRequired = taxCalculation.taxAmount;
    const totalRequiredForYear = monthlyTaxRequired * 12;
    const monthlyReserveNeeded = settings.mensalReservePercentage 
      ? (totalRevenue / 12) * (settings.mensalReservePercentage / 100)
      : monthlyTaxRequired;

    return {
      totalReserved: currentReserve,
      totalRequired: totalRequiredForYear,
      monthlyReserve: monthlyReserveNeeded,
      insufficientFunds: currentReserve < monthlyTaxRequired,
      nextPaymentAmount: taxCalculation.taxAmount,
      nextPaymentDate: taxCalculation.dueDate
    };
  }

  /**
   * Gera calendário DAS para o ano
   */
  static generateDASCalendar(year: number, regime: 'MEI' | 'SIMPLES_NACIONAL', monthlyAmount: number): DASSchedule[] {
    const schedule: DASSchedule[] = [];
    
    for (let month = 1; month <= 12; month++) {
      // DAS vence sempre no dia 20 do mês seguinte
      const dueDate = new Date(year, month, 20); // month é 0-indexed, então month = janeiro
      
      schedule.push({
        month,
        year,
        dueDate,
        amount: monthlyAmount,
        status: dueDate < new Date() ? 'overdue' : 'pending',
        reference: `DAS ${regime} ${this.getMonthName(month)}/${year}`
      });
    }
    
    return schedule;
  }

  /**
   * Próxima data de vencimento DAS (dia 20)
   */
  private static getNextDASDate(): Date {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 20);
    return nextMonth;
  }

  /**
   * Próxima data de vencimento DARF (varia por imposto)
   */
  private static getNextDARFDate(): Date {
    const now = new Date();
    // DARF geralmente vence no último dia útil do mês seguinte
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0); // último dia do próximo mês
    return nextMonth;
  }

  /**
   * Nome do mês em português
   */
  private static getMonthName(month: number): string {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1];
  }

  /**
   * Valida configuração tributária
   */
  static validateTaxSettings(settings: TaxSettings): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!settings.cnpj || settings.cnpj.length !== 14) {
      errors.push('CNPJ deve ter 14 dígitos');
    }

    if (!['MEI', 'SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO'].includes(settings.regime)) {
      errors.push('Regime tributário inválido');
    }

    if (settings.startDate > new Date()) {
      errors.push('Data de início não pode ser no futuro');
    }

    if (settings.mensalReservePercentage && (settings.mensalReservePercentage < 0 || settings.mensalReservePercentage > 100)) {
      errors.push('Percentual de reserva deve estar entre 0 e 100%');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}