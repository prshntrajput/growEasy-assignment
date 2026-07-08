'use client';

import { useCallback, useRef, useState } from 'react';
import { UploadCloud, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { parseCsvFile } from '@/lib/api.client';
import { CsvFileSchema } from '@/lib/schemas/csv-upload.schema';
import { ParsedCsv } from '@/lib/schemas/raw-csv-row.schema';
import { cn } from '@/lib/utils';

interface CsvDropzoneProps {
  onParsed: (data: ParsedCsv, file: File) => void;
}

export function CsvDropzone({ onParsed }: CsvDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;

      const validation = CsvFileSchema.safeParse(file);
      if (!validation.success) {
        toast.error(validation.error.issues[0]?.message ?? 'Invalid file');
        return;
      }

      setIsParsing(true);

      try {
        const parsed = await parseCsvFile(file);
        toast.success(`Parsed ${parsed.rows.length} rows successfully`);
        onParsed(parsed, file);
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to parse CSV file'
        );
      } finally {
        setIsParsing(false);
      }
    },
    [onParsed]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFile(file);
    e.target.value = '';
  };

  return (
    <div
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors flex flex-col items-center justify-center gap-3',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
        isParsing && 'pointer-events-none opacity-60'
      )}
      role="button"
      tabIndex={0}
      aria-label="Upload CSV file"
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={onFilePicked}
      />

      {isParsing ? (
        <>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Uploading and parsing CSV...
          </p>
        </>
      ) : (
        <>
          <UploadCloud className="h-10 w-10 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Drag & drop your CSV file here, or{' '}
              <span className="text-primary underline">browse</span>
            </p>
            <p className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <FileText className="h-3 w-3" />
              Supports .csv files up to 10MB
            </p>
            <p className="mt-1 text-xs text-muted-foreground"></p>
          </div>
        </>
      )}
    </div>
  );
}
