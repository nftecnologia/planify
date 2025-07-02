'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { useCsvUpload } from '@/hooks/use-csv-upload';
import { AdCampaign } from '@/types';

interface CsvUploadProps {
  onUploadComplete?: (campaignsCount: number) => void;
  onCampaignsImported?: (campaigns: AdCampaign[]) => void;
}

export function CsvUpload({ onUploadComplete, onCampaignsImported }: CsvUploadProps) {
  const {
    file,
    isProcessing,
    previewData,
    processedCampaigns,
    errors,
    progress,
    handleFileSelect,
    processFile,
    importCampaigns,
    resetUpload,
  } = useCsvUpload();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type === 'text/csv') {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  const handleProcessFile = async () => {
    await processFile();
  };

  const handleImportCampaigns = async () => {
    await importCampaigns();
    if (processedCampaigns.length > 0) {
      onCampaignsImported?.(processedCampaigns);
      onUploadComplete?.(processedCampaigns.length);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import CSV Meta Ads
          </CardTitle>
          <CardDescription>
            Importe relatórios do Meta Ads Manager para análise
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!file ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive
                  ? 'Solte o arquivo aqui'
                  : 'Arraste seu arquivo CSV aqui'}
              </h3>
              <p className="text-muted-foreground mb-4">
                Ou clique para selecionar o relatório do Meta Ads Manager
              </p>
              <Button type="button">
                Selecionar Arquivo
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={resetUpload}>
                  Remover
                </Button>
              </div>

              {!previewData && !isProcessing && (
                <Button onClick={handleProcessFile} className="w-full">
                  Processar Arquivo
                </Button>
              )}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Processando...</span>
                    <span className="text-sm">{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
          )}

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">💡 Dica:</h4>
            <p className="text-sm text-blue-800">
              Exporte o relatório com as colunas: Campaign name, Ad set name, Amount spent, Impressions, Clicks, Results
            </p>
          </div>
        </CardContent>
      </Card>

      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc list-inside space-y-1">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {previewData && !processedCampaigns.length && (
        <Card>
          <CardHeader>
            <CardTitle>Preview dos Dados</CardTitle>
            <CardDescription>
              Visualização dos primeiros registros - {previewData.totalRows} total
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      {previewData.headers.map((header) => (
                        <th
                          key={header}
                          className="border border-gray-300 px-4 py-2 text-left text-sm font-medium"
                        >
                          {header}
                          {Object.keys(previewData.mappedFields).includes(header) && (
                            <CheckCircle className="inline h-4 w-4 text-green-600 ml-2" />
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.map((row, index) => (
                      <tr key={index}>
                        {previewData.headers.map((header) => (
                          <td
                            key={header}
                            className="border border-gray-300 px-4 py-2 text-sm"
                          >
                            {row[header] || ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {Object.keys(previewData.mappedFields).length} de{' '}
                  {previewData.headers.length} colunas mapeadas
                </div>
                <Button onClick={handleImportCampaigns}>
                  Importar {previewData.totalRows} Campanhas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}