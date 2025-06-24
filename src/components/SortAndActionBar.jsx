import { Button } from "./ui/button";

export default function SortAndActionBar({
  sortOrder = "desc",
  onSortChange,
  actionLabel,
  onAction,
  actionIcon,
  className = "",
}) {
  return (
    <div className={`flex items-center justify-between gap-4 mb-6 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          variant={sortOrder === "desc" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange && onSortChange("desc")}
          className="rounded-full px-4"
        >
          Latest
        </Button>
        <Button
          variant={sortOrder === "asc" ? "default" : "outline"}
          size="sm"
          onClick={() => onSortChange && onSortChange("asc")}
          className="rounded-full px-4"
        >
          Oldest
        </Button>
      </div>
      {actionLabel && (
        <Button onClick={onAction} className="rounded-full px-5 font-semibold flex items-center gap-2">
          {actionIcon && <span className="text-lg">{actionIcon}</span>}
          {actionLabel}
        </Button>
      )}
    </div>
  );
} 