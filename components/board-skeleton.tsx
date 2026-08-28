import { Skeleton } from "@/components/ui/skeleton"

export function BoardSkeleton() {
  return (
    <div className="flex min-h-0 flex-1 gap-3 overflow-hidden p-4">
      {Array.from({ length: 4 }).map((_, column) => (
        <div
          key={column}
          className="flex min-w-[18rem] flex-1 flex-col rounded-xl border border-border bg-muted/30 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}
