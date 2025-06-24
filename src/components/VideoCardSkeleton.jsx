export default function VideoCardSkeleton() {
  return (
    <div className="block rounded-lg overflow-hidden bg-card border border-border shadow animate-pulse">
      <div className="aspect-video bg-muted" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 w-3/4 bg-muted rounded mb-2" />
        <div className="flex items-center gap-2 mt-1">
          <div className="w-7 h-7 rounded-full bg-muted" />
          <div className="h-3 w-1/3 bg-muted rounded" />
        </div>
        <div className="h-3 w-1/2 bg-muted rounded mt-2" />
      </div>
    </div>
  );
} 