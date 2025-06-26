// src/components/TweetListDisplay.jsx
import TweetCard from "./TweetCard";
import TweetCardSkeleton from "./TweetCardSkeleton";
import { Link } from "react-router-dom";
import { Button } from "./ui/button"; // Assuming you have this
import { Pencil, Trash2 } from "lucide-react"; // Icons for edit/delete

export default function TweetListDisplay({
  tweets = [],
  isLoading,
  isError,
  emptyText = "No tweets found.",
  onEditTweet, // New prop for editing a tweet
  onDeleteTweet, // New prop for deleting a tweet
  isOwner = false, // Prop to determine if edit/delete buttons should show
}) {
  return (
    <div className="flex flex-col h-full">
      {isLoading && (
        <div className="flex flex-col gap-4 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <TweetCardSkeleton key={i} />
          ))}
        </div>
      )}
      {isError && (
        <div className="text-destructive mt-8">Failed to load tweets.</div>
      )}
      {!isLoading && !isError && tweets.length === 0 && (
        <div className="text-muted-foreground mt-8">{emptyText}</div>
      )}

      {!isLoading && !isError && tweets.length > 0 && (
        <div className="flex flex-col gap-4 mt-4">
          {tweets.map((tweet) => (
            <div
              key={tweet._id}
              className="relative flex items-center bg-card border border-border rounded-lg p-3 shadow hover:shadow-lg transition-all duration-200"
            >
              {/* This is a wrapper for the clickable TweetCard */}
              <Link to={`/tweet/${tweet._id}`} className="flex-1 min-w-0">
                <TweetCard tweet={tweet} />
              </Link>
              {isOwner && (
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-card/80 hover:bg-primary/10 hover:text-primary"
                    onClick={() => onEditTweet(tweet)}
                    aria-label="Edit tweet"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-card/80 hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => onDeleteTweet(tweet)}
                    aria-label="Delete tweet"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}