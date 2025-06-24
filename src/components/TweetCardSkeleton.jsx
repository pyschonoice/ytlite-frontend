export default function TweetCardSkeleton() {
  return (
    <div className="bg-muted border border-border rounded-lg p-3 mb-2 animate-pulse">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-full bg-muted" />
        <div className="h-3 w-1/4 bg-muted rounded" />
      </div>
      <div className="h-4 w-2/3 bg-muted rounded mb-2" />
      <div className="h-3 w-1/3 bg-muted rounded" />
    </div>
  );
} 