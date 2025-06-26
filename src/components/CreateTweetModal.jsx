// src/components/CreateTweetModal.jsx
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export default function CreateTweetModal({
  open,
  onClose,
  onSubmit, // Function to call on form submission: onSubmit({ content })
  isLoading, // From mutation
  error, // From mutation
}) {
  const [content, setContent] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(""); // Clear content when modal opens
      setTouched(false);
    }
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!content.trim()) return; // Prevent empty tweets
    onSubmit({ content: content.trim() });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        <DialogHeader className="px-8 py-6 border-b border-border bg-background">
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            Create New Post
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-8 py-6 flex flex-col gap-4">
          <div>
            <textarea
              placeholder="What's on your mind?"
              className="bg-muted px-3 py-2 rounded border border-border text-base outline-none w-full min-h-[120px] resize-none text-card-foreground placeholder:text-muted-foreground"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={200} // Standard tweet length limit
              disabled={isLoading}
              autoFocus
            />
            {touched && !content.trim() && (
              <p className="mt-1 text-sm text-destructive">
                Post content cannot be empty.
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
              {isLoading ? "Posting..." : "Post"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}