'use client';

import { useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { RawCsvRow } from '@/lib/schemas/raw-csv-row.schema';

interface CsvPreviewTableProps {
  headers: string[];
  rows: RawCsvRow[];
  maxPreviewRows?: number;
}

export function CsvPreviewTable({
  headers,
  rows,
  maxPreviewRows = 100,
}: CsvPreviewTableProps) {
  const previewRows = useMemo(
    () => rows.slice(0, maxPreviewRows),
    [rows, maxPreviewRows]
  );

  const columns = useMemo<ColumnDef<RawCsvRow>[]>(
    () =>
      headers.map((header) => ({
        id: header,
        accessorKey: header,
        header: () => header,
        cell: (info) => {
          const value = info.getValue();
          const display =
            value === null || value === undefined || value === ''
              ? '—'
              : String(value);

          return (
            <span
              className={display === '—' ? 'italic text-muted-foreground' : ''}
              title={display}
            >
              {display}
            </span>
          );
        },
      })),
    [headers]
  );

  const table = useReactTable({
    data: previewRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-[480px] overflow-auto rounded-md border">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-background shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="whitespace-nowrap border-b bg-muted px-4 py-2.5 text-left font-semibold text-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {table.getRowModel().rows.map((row, idx) => (
              <tr
                key={row.id}
                className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="max-w-[240px] truncate whitespace-nowrap border-b px-4 py-2 text-foreground/90"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length > maxPreviewRows && (
        <p className="text-xs text-muted-foreground">
          Large file detected. Showing first {maxPreviewRows} preview rows out
          of {rows.length}. The full dataset will still be sent for import.
        </p>
      )}
    </div>
  );
}