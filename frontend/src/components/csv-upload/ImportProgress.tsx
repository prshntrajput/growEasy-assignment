import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { JobStatus } from '@/lib/api.client';

interface ImportProgressProps {
  jobStatus: JobStatus | null;
}

export function ImportProgress({ jobStatus }: ImportProgressProps) {
  const progress = jobStatus?.progress ?? 0;
  const completed = jobStatus?.completedBatches ?? 0;
  const total = jobStatus?.totalBatches ?? 0;

  return (
    <div className="flex flex-col gap-3 rounded-md border bg-muted/30 p-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        AI is mapping your CRM fields...
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {total > 0
          ? `Processed ${completed} of ${total} batches (${progress}%)`
          : 'Starting import job...'}
      </p>
    </div>
  );
}
