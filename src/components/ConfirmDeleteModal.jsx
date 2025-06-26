// src/components/ConfirmDeleteModal.jsx
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";

export default function ConfirmDeleteModal({
  open,
  onClose, // Just for the "Cancel" button, or external close
  onConfirm, // Triggers the mutation in parent, then parent opens ProgressModal
  isLoading, // Used only to disable its own buttons
  videoTitle // Video title for initial confirmation
}) {
  // Resetting these states to null as they are no longer managed by this modal
  // (removed deleteError, deleteSuccess from props - they're not used here anymore)

  return (
    <Dialog open={open} onOpenChange={onClose}> {/* Pass through onOpenChange */}
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        <DialogHeader className="px-8 py-6 border-b border-border bg-background flex flex-row items-center">
          {/* No icons here, it's just a confirmation */}
          <DialogTitle className="text-2xl font-bold text-card-foreground">Delete Video</DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6">
          <DialogDescription className="text-muted-foreground">
            {`Are you sure you want to delete "${videoTitle}"? This action cannot be undone and the video will be permanently removed.`}
          </DialogDescription>
        </div>

        <DialogFooter className="flex justify-end gap-2 px-8 py-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}