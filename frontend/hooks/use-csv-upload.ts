import { useState, useCallback } from 'react';
import { CsvPreviewData, MetaAdsCsvRow, AdCampaign } from '@/types';

export interface CsvUploadState {
  file: File | null;
  isUploading: boolean;
  isProcessing: boolean;
  previewData: CsvPreviewData | null;
  processedCampaigns: AdCampaign[];
  errors: string[];
  progress: number;
}

export interface CsvUploadActions {
  handleFileSelect: (file: File) => void;
  processFile: () => Promise<void>;
  resetUpload: () => void;
  importCampaigns: () => Promise<void>;
}

const META_ADS_FIELD_MAPPINGS = {
  'Campaign name': 'campaignName',
  'Ad set name': 'adSetName',
  'Amount spent (BRL)': 'amountSpent',
  'Amount spent': 'amountSpent',
  'Impressions': 'impressions',
  'Clicks (all)': 'clicks',
  'Clicks': 'clicks',
  'Results': 'results',
  'Conversions': 'results',
  'Reporting starts': 'dateStart',
  'Reporting ends': 'dateEnd',
};

function parseCSV(csvText: string): { headers: string[]; rows: string[][] } {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = lines.slice(1).map(line => 
    line.split(',').map(cell => cell.trim().replace(/"/g, ''))
  );
  return { headers, rows };
}

function mapCsvRowToMetaAds(row: Record<string, string>): MetaAdsCsvRow | null {
  try {
    const mapped: any = {};
    
    // Mapear campos obrigatórios
    for (const [csvField, objectField] of Object.entries(META_ADS_FIELD_MAPPINGS)) {
      if (row[csvField] !== undefined) {
        mapped[objectField] = row[csvField];
      }
    }

    // Validar campos obrigatórios
    if (!mapped.campaignName || !mapped.amountSpent || !mapped.impressions) {
      return null;
    }

    // Converter valores numéricos
    mapped.amountSpent = parseFloat(mapped.amountSpent.replace(/[^0-9.-]/g, '')) || 0;
    mapped.impressions = parseInt(mapped.impressions.replace(/[^0-9]/g, '')) || 0;
    mapped.clicks = parseInt(mapped.clicks?.replace(/[^0-9]/g, '') || '0') || 0;
    mapped.results = parseInt(mapped.results?.replace(/[^0-9]/g, '') || '0') || 0;

    return mapped as MetaAdsCsvRow;
  } catch (error) {
    return null;
  }
}

function calculateMetrics(data: MetaAdsCsvRow): {
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
} {
  const ctr = data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0;
  const cpc = data.clicks > 0 ? data.amountSpent / data.clicks : 0;
  const cpm = data.impressions > 0 ? (data.amountSpent / data.impressions) * 1000 : 0;
  
  // ROAS simulado (seria calculado com base nas vendas reais)
  const roas = data.results && data.results > 0 ? (data.results * 100) / data.amountSpent : 0;

  return {
    ctr: Math.round(ctr * 100) / 100,
    cpc: Math.round(cpc * 100) / 100,
    cpm: Math.round(cpm * 100) / 100,
    roas: Math.round(roas * 100) / 100,
  };
}

export function useCsvUpload(): CsvUploadState & CsvUploadActions {
  const [state, setState] = useState<CsvUploadState>({
    file: null,
    isUploading: false,
    isProcessing: false,
    previewData: null,
    processedCampaigns: [],
    errors: [],
    progress: 0,
  });

  const handleFileSelect = useCallback((file: File) => {
    setState(prev => ({
      ...prev,
      file,
      errors: [],
      previewData: null,
      processedCampaigns: [],
    }));
  }, []);

  const processFile = useCallback(async () => {
    if (!state.file) return;

    setState(prev => ({ ...prev, isProcessing: true, errors: [], progress: 0 }));

    try {
      const text = await state.file.text();
      const { headers, rows } = parseCSV(text);

      // Criar preview dos dados
      const previewRows = rows.slice(0, 5).map(row => {
        const obj: Record<string, any> = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });

      // Identificar mapeamento de campos
      const mappedFields: Record<string, string> = {};
      Object.keys(META_ADS_FIELD_MAPPINGS).forEach(field => {
        if (headers.includes(field)) {
          mappedFields[field] = field;
        }
      });

      const previewData: CsvPreviewData = {
        headers,
        rows: previewRows,
        totalRows: rows.length,
        mappedFields,
      };

      setState(prev => ({ 
        ...prev, 
        previewData, 
        isProcessing: false,
        progress: 100 
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        errors: ['Erro ao processar arquivo: ' + (error as Error).message],
      }));
    }
  }, [state.file]);

  const importCampaigns = useCallback(async () => {
    if (!state.file || !state.previewData) return;

    setState(prev => ({ ...prev, isProcessing: true, errors: [], progress: 0 }));

    try {
      const text = await state.file.text();
      const { headers, rows } = parseCSV(text);
      
      const campaigns: AdCampaign[] = [];
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row: Record<string, string> = {};
        headers.forEach((header, index) => {
          row[header] = rows[i][index] || '';
        });

        const mappedRow = mapCsvRowToMetaAds(row);
        if (mappedRow) {
          const metrics = calculateMetrics(mappedRow);
          
          const campaign: AdCampaign = {
            id: `csv_${Date.now()}_${i}`,
            name: mappedRow.campaignName,
            adSetName: mappedRow.adSetName,
            spent: mappedRow.amountSpent,
            impressions: mappedRow.impressions,
            clicks: mappedRow.clicks,
            conversions: mappedRow.results || 0,
            results: mappedRow.results,
            ctr: metrics.ctr,
            cpc: metrics.cpc,
            cpm: metrics.cpm,
            roi: metrics.roas,
            roas: metrics.roas,
            dateStart: mappedRow.dateStart || '',
            dateEnd: mappedRow.dateEnd || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          campaigns.push(campaign);
        } else {
          errors.push(`Linha ${i + 2}: Dados insuficientes ou inválidos`);
        }

        // Atualizar progresso
        setState(prev => ({ 
          ...prev, 
          progress: Math.round(((i + 1) / rows.length) * 100) 
        }));
      }

      setState(prev => ({
        ...prev,
        processedCampaigns: campaigns,
        errors,
        isProcessing: false,
        progress: 100,
      }));

    } catch (error) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        errors: ['Erro ao importar campanhas: ' + (error as Error).message],
      }));
    }
  }, [state.file, state.previewData]);

  const resetUpload = useCallback(() => {
    setState({
      file: null,
      isUploading: false,
      isProcessing: false,
      previewData: null,
      processedCampaigns: [],
      errors: [],
      progress: 0,
    });
  }, []);

  return {
    ...state,
    handleFileSelect,
    processFile,
    resetUpload,
    importCampaigns,
  };
}