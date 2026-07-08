'use client';

import { useState } from 'react';
import { CheckCircle2, FileUp, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CsvDropzone } from '@/components/csv-upload/CsvDropzone';
import { CsvPreviewTable } from '@/components/csv-upload/CsvPreviewTable';
import { CsvSummaryBar } from '@/components/csv-upload/CsvSummaryBar';
import { CsvTableSkeleton } from '@/components/csv-upload/CsvTableSkeleton';
import { ImportProgress } from '@/components/csv-upload/ImportProgress';
import { ImportErrorState } from '@/components/csv-upload/ImportErrorState';
import { ImportResultsSection } from '@/components/csv-upload/ImportResultsSection';
import { useImportJob } from '@/lib/hooks/useImportJob';
import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const { phase, jobStatus, errorMessage, startImport, retry, reset } =
    useImportJob();

  const handleParsed = async (data: ParsedCsv, file: File) => {
    setIsLoadingPreview(true);
    reset();

    await new Promise((resolve) => setTimeout(resolve, 300));

    setParsedCsv(data);
    setFileName(file.name);
    setIsLoadingPreview(false);
  };

  const hasValidData = !!parsedCsv && parsedCsv.rows.length > 0;
  const isBusy = phase === 'submitting' || phase === 'processing';

  const handleConfirmImport = () => {
    if (!parsedCsv) return;
    startImport(parsedCsv);
  };

  const handleUploadNew = () => {
    setParsedCsv(null);
    setFileName('');
    reset();
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            GrowEasy CSV Importer
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Upload any CSV format and let AI map the data into your CRM
            automatically.
          </p>
        </div>
        <div className="self-start">
          <ThemeToggle />
        </div>
      </div>

      {!hasValidData && !isLoadingPreview && phase === 'idle' && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Upload your CSV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CsvDropzone onParsed={handleParsed} />
          </CardContent>
        </Card>
      )}

      {isLoadingPreview && phase === 'idle' && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Preparing preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CsvTableSkeleton />
          </CardContent>
        </Card>
      )}

      {hasValidData && phase === 'idle' && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg">
                Preview and confirm
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Review the parsed data below before starting the import.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadNew}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Upload another CSV
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {parsedCsv && (
              <>
                <CsvSummaryBar
                  fileName={fileName}
                  rowCount={parsedCsv.rows.length}
                  columnCount={parsedCsv.headers.length}
                />

                <CsvPreviewTable
                  headers={parsedCsv.headers}
                  rows={parsedCsv.rows}
                />

                <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-muted-foreground">
                    This preview is ready. Confirm to start AI-powered CRM field
                    mapping.
                  </p>

                  <Button
                    onClick={handleConfirmImport}
                    className="w-full sm:w-auto sm:min-w-[180px]"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Import
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {isBusy && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Processing import
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImportProgress jobStatus={jobStatus} />
          </CardContent>
        </Card>
      )}

      {phase === 'error' && errorMessage && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Import status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImportErrorState message={errorMessage} onRetry={retry} />
          </CardContent>
        </Card>
      )}

      {phase === 'done' && jobStatus?.result && (
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-base sm:text-lg">
                Import results
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Review imported and skipped records below.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadNew}
              className="w-full sm:w-auto"
            >
              <FileUp className="mr-2 h-4 w-4" />
              Upload another CSV
            </Button>
          </CardHeader>

          <CardContent>
            <ImportResultsSection result={jobStatus.result} />
          </CardContent>
        </Card>
      )}
    </main>
  );
}
