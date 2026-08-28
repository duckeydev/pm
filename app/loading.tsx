import { BoardSkeleton } from "@/components/board-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex h-14 items-center justify-between border-b border-border px-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-32" />
      </div>
      <BoardSkeleton />
    </div>
  )
}
