import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ImportErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ImportErrorState({ message, onRetry }: ImportErrorStateProps) {
  return (
    <Alert variant="destructive" className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <AlertTitle>Import failed</AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry} className="w-fit">
        Retry Import
      </Button>
    </Alert>
  );
}
