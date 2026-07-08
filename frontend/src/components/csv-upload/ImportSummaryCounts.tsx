import { CheckCircle2, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImportSummaryCountsProps {
  totalImported: number;
  totalSkipped: number;
}

export function ImportSummaryCounts({
  totalImported,
  totalSkipped,
}: ImportSummaryCountsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <Badge
        variant="secondary"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
      >
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        {totalImported} Imported
      </Badge>
      <Badge
        variant="secondary"
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm"
      >
        <XCircle className="h-4 w-4 text-destructive" />
        {totalSkipped} Skipped
      </Badge>
    </div>
  );
}
