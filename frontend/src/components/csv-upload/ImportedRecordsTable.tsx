import { CrmRecord } from '@/lib/schemas/crm-record.schema';
import { Badge } from '@/components/ui/badge';

interface ImportedRecordsTableProps {
  records: CrmRecord[];
}

const CRM_COLUMNS: { key: keyof CrmRecord; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'country_code', label: 'Code' },
  { key: 'mobile_without_country_code', label: 'Mobile' },
  { key: 'company', label: 'Company' },
  { key: 'city', label: 'City' },
  { key: 'crm_status', label: 'Status' },
  { key: 'data_source', label: 'Source' },
  { key: 'crm_note', label: 'Note' },
  { key: 'created_at', label: 'Created At' },
];

function sanitizeDisplayText(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value)
    .replace(/\[([^\]]+)\]\(mailto:[^)]+\)/gi, '$1')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gi, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ImportedRecordsTable({ records }: ImportedRecordsTableProps) {
  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border border-dashed py-10 text-center text-sm text-muted-foreground">
        No records were successfully imported.
      </div>
    );
  }

  return (
    <div className="max-h-[420px] overflow-auto rounded-md border">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 bg-background shadow-sm">
          <tr>
            {CRM_COLUMNS.map((col) => (
              <th
                key={col.key}
                className="whitespace-nowrap border-b bg-muted px-4 py-2.5 text-left font-semibold"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((record, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
            >
              {CRM_COLUMNS.map((col) => {
                const value = record[col.key];
                const displayValue = sanitizeDisplayText(value);

                if (col.key === 'crm_status' && displayValue) {
                  return (
                    <td
                      key={col.key}
                      className="whitespace-nowrap border-b px-4 py-2"
                    >
                      <Badge variant="secondary">{displayValue}</Badge>
                    </td>
                  );
                }

                return (
                  <td
                    key={col.key}
                    className="max-w-[220px] truncate whitespace-nowrap border-b px-4 py-2 text-foreground/90"
                    title={displayValue}
                  >
                    {displayValue ? (
                      displayValue
                    ) : (
                      <span className="italic text-muted-foreground">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}