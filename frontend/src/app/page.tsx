'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CsvDropzone } from '@/components/csv-upload/CsvDropzone';
import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';

export default function HomePage() {
  const [parsedCsv, setParsedCsv] = useState<ParsedCsv | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleParsed = (data: ParsedCsv, file: File) => {
    setParsedCsv(data);
    setFileName(file.name);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
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

      {parsedCsv && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Loaded: {fileName} ({parsedCsv.rows.length} rows,{' '}
              {parsedCsv.headers.length} columns)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Preview table comes in Phase 3 — this confirms parsing works
              end-to-end.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
