import { Badge } from '@/components/ui/badge';
import { FileSpreadsheet, Rows3, Columns3 } from 'lucide-react';

interface CsvSummaryBarProps {
  fileName: string;
  rowCount: number;
  columnCount: number;
}

export function CsvSummaryBar({
  fileName,
  rowCount,
  columnCount,
}: CsvSummaryBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border bg-muted/40 px-4 py-3">
      <div className="flex items-center gap-1.5 text-sm font-medium">
        <FileSpreadsheet className="h-4 w-4 text-primary" />
        <span className="max-w-[220px] truncate" title={fileName}>
          {fileName}
        </span>
      </div>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Rows3 className="h-3 w-3" /> {rowCount} rows
      </Badge>
      <Badge variant="secondary" className="flex items-center gap-1">
        <Columns3 className="h-3 w-3" /> {columnCount} columns
      </Badge>
    </div>
  );
}
