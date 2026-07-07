'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { CsvDropzone } from '@/components/csv-upload/CsvDropzone';
import { CsvPreviewTable } from '@/components/csv-upload/CsvPreviewTable';
import { CsvSummaryBar } from '@/components/csv-upload/CsvSummaryBar';
import { CsvTableSkeleton } from '@/components/csv-upload/CsvTableSkeleton';
import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';
import { CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleParsed = async (data: ParsedCsv, file: File) => {
    setIsLoadingPreview(true);
    setParsedCsv(null);

    await new Promise((resolve) => setTimeout(resolve, 300));

    setParsedCsv(data);
    setFileName(file.name);
    setIsLoadingPreview(false);
  };

  const hasValidData = !!parsedCsv && parsedCsv.rows.length > 0;

  const handleConfirmImport = async () => {
    if (!parsedCsv) return;
    setIsConfirming(true);
    toast.info('Import confirmed — backend processing wires up in Phase 7');
    setTimeout(() => setIsConfirming(false), 800);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold">GrowEasy CSV Importer</h1>
        <p className="text-sm text-muted-foreground">
          Upload any CSV format — our AI will map it into your CRM
          automatically.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Step 1: Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <CsvDropzone onParsed={handleParsed} />
        </CardContent>
      </Card>

      {(isLoadingPreview || hasValidData) && (
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
                  <CsvPreviewTable
                    headers={parsedCsv.headers}
                    rows={parsedCsv.rows}
                  />
                </>
              )
            )}
          </CardContent>
        </Card>
      )}

      {hasValidData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 3: Confirm Import</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Review the preview above, then confirm to send this data for
              AI-powered CRM field mapping.
            </p>
            <Separator />
            <Button
              onClick={handleConfirmImport}
              disabled={!hasValidData || isConfirming}
              className="w-fit"
            >
              {isConfirming ? (
                'Processing...'
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm Import
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
