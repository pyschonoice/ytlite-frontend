export default function TweetCard({ tweet }) {
  return (
    <div className="bg-muted border border-border rounded-lg p-3 mb-2">
      <div className="text-card-foreground mb-1">{tweet.content}</div>
      <div className="text-xs text-muted-foreground">{new Date(tweet.createdAt).toLocaleString()}</div>
    </div>
  );
} 