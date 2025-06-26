// src/components/EditTweetModal.jsx
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function EditTweetModal({
  open,
  onClose,
  tweet, // The tweet object to be edited
  onSubmit, // Function to call on form submission: onSubmit({ content })
  isLoading, // From mutation
  error, // From mutation
}) {
  const [content, setContent] = useState(tweet?.content || "");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open && tweet) {
      setContent(tweet.content || "");
      setTouched(false); // Reset touched when modal opens
    } else if (!open) {
      // Reset state when modal closes
      setContent("");
      setTouched(false);
    }
  }, [open, tweet]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!content.trim()) return;
    onSubmit({ content: content.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        <DialogHeader className="px-8 py-6 border-b border-border bg-background">
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            Edit Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          <div>
            <textarea
              placeholder="What's on your mind?"
              className="bg-muted px-3 py-2 rounded border border-border text-base outline-none w-full min-h-[100px] resize-none text-card-foreground placeholder:text-muted-foreground"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={200} // Assuming a reasonable tweet length
              disabled={isLoading}
              autoFocus
            />
            {touched && !content.trim() && (
              <p className="mt-1 text-sm text-destructive">
                Content cannot be empty.
              </p>
            )}
            {error && (
              <p className="mt-1 text-sm text-destructive">{error}</p>
            )}
          </div>

          <DialogFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !content.trim()}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}