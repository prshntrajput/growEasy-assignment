import { SkippedRecord } from '@/lib/api.client';

interface SkippedRecordsTableProps {
  records: SkippedRecord[];
}

export function SkippedRecordsTable({ records }: SkippedRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        No records were skipped — every row had usable contact info.
      </div>
    );
  }

  return (
    <div className="max-h-[420px] overflow-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-background shadow-sm">
          <tr>
            <th className="whitespace-nowrap border-b bg-muted px-4 py-2.5 text-left font-semibold">
              Original Row
            </th>
            <th className="whitespace-nowrap border-b bg-muted px-4 py-2.5 text-left font-semibold">
              Reason Skipped
            </th>
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}>
              <td className="max-w-[420px] truncate whitespace-nowrap border-b px-4 py-2 text-foreground/90">
                {JSON.stringify(record.originalRow)}
              </td>
              <td className="whitespace-nowrap border-b px-4 py-2 text-destructive">
                {record.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}