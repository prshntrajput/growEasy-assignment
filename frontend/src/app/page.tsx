'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CsvDropzone } from '@/components/csv-upload/CsvDropzone';
import { CsvPreviewTable } from '@/components/csv-upload/CsvPreviewTable';
import { CsvSummaryBar } from '@/components/csv-upload/CsvSummaryBar';
import { CsvTableSkeleton } from '@/components/csv-upload/CsvTableSkeleton';
import { ImportProgress } from '@/components/csv-upload/ImportProgress';
import { ImportErrorState } from '@/components/csv-upload/ImportErrorState';
import { ImportResultsSection } from '@/components/csv-upload/ImportResultsSection';
import { useImportJob } from '@/lib/hooks/useImportJob';
import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';
import { CheckCircle2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const { phase, jobStatus, errorMessage, startImport, retry, reset } = useImportJob();

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
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">GrowEasy CSV Importer</h1>
        <p className="text-sm text-muted-foreground">
          Upload any CSV format — our AI will map it into your CRM automatically.
        </p>
       <ThemeToggle/>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <CsvDropzone onParsed={handleParsed} />
        </CardContent>
      </Card>

      {(isLoadingPreview || hasValidData) && phase === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 2: Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {isLoadingPreview ? (
              <CsvTableSkeleton />
            ) : (
              parsedCsv && (
                <>
                  <CsvSummaryBar
                    fileName={fileName}
                    rowCount={parsedCsv.rows.length}
                    columnCount={parsedCsv.headers.length}
                  />
                  <CsvPreviewTable headers={parsedCsv.headers} rows={parsedCsv.rows} />
                </>
              )
            )}
          </CardContent>
        </Card>
      )}

      {hasValidData && phase === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 3: Confirm Import</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Review the preview above, then confirm to send this data for AI-powered CRM field mapping.
            </p>
            <Separator />
            <Button onClick={handleConfirmImport} className="w-fit">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Import
            </Button>
          </CardContent>
        </Card>
      )}

      {isBusy && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Processing Import</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportProgress jobStatus={jobStatus} />
          </CardContent>
        </Card>
      )}

      {phase === 'error' && errorMessage && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Import Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ImportErrorState message={errorMessage} onRetry={retry} />
          </CardContent>
        </Card>
      )}

      {phase === 'done' && jobStatus?.result && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Step 4: Import Results</CardTitle>
            <Button variant="outline" size="sm" onClick={handleUploadNew}>
              Upload New CSV
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