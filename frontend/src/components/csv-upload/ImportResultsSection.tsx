import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImportResultSummary } from '@/lib/api.client';
import { ImportedRecordsTable } from './ImportedRecordsTable';
import { SkippedRecordsTable } from './SkippedRecordsTable';
import { ImportSummaryCounts } from './ImportSummaryCounts';

interface ImportResultsSectionProps {
  result: ImportResultSummary;
}

export function ImportResultsSection({ result }: ImportResultsSectionProps) {
  return (
    <div className="flex flex-col gap-4">
      <ImportSummaryCounts
        totalImported={result.totalImported}
        totalSkipped={result.totalSkipped}
      />
      <Tabs defaultValue="imported">
        <TabsList>
          <TabsTrigger value="imported">Imported ({result.totalImported})</TabsTrigger>
          <TabsTrigger value="skipped">Skipped ({result.totalSkipped})</TabsTrigger>
        </TabsList>
        <TabsContent value="imported" className="mt-3">
          <ImportedRecordsTable records={result.imported} />
        </TabsContent>
        <TabsContent value="skipped" className="mt-3">
          <SkippedRecordsTable records={result.skipped} />
        </TabsContent>
      </Tabs>
    </div>
  );
}