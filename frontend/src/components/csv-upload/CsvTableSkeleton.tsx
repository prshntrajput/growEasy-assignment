import { Skeleton } from '@/components/ui/skeleton';

export function CsvTableSkeleton() {
  return (
    <div className="flex flex-col gap-2 rounded-md border p-4">
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={`head-${i}`} className="h-6 w-28" />
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="flex gap-4">
            {Array.from({ length: 6 }).map((_, colIdx) => (
              <Skeleton key={`cell-${rowIdx}-${colIdx}`} className="h-5 w-28" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
