import Avatar from "./ui/Avatar";
import { formatTimeAgo } from "../lib/utils";

export default function TweetCard({ tweet, className = "", onClick, children }) {
  if (!tweet) return null;
  return (
    <div className={`bg-muted border border-border rounded-lg p-3 mb-2 ${className}`} onClick={onClick}>
      <div className="flex items-center gap-2 mb-1">
        {tweet.owner && <Avatar user={tweet.owner} size="sm" />}
        <span className="font-medium text-card-foreground">{tweet.ownerDetails?.username || tweet.owner?.username || "User"}</span>
      </div>
      <div className="text-card-foreground mb-1">{tweet.content}</div>
      <div className="text-xs text-muted-foreground">{formatTimeAgo(tweet.createdAt)}</div>
      {children}
    </div>
  );
} 