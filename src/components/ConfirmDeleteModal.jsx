
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export default function ConfirmDeleteModal({
  open,
  onClose, // Function to call when modal needs to close (e.g., Cancel button, overlay click)
  onConfirm, // Function to call when the user confirms the action
  isLoading, // Boolean indicating if the action is in progress (to disable buttons)
  title, // New prop: The main title of the confirmation (e.g., "Delete Playlist", "Remove Video")
  description, // New prop: The detailed description/question (e.g., "Are you sure you want to delete X?")
  confirmText = "Confirm", // Optional prop: Text for the confirm button (default "Confirm")
  cancelText = "Cancel", // Optional prop: Text for the cancel button (default "Cancel")
  confirmVariant = "destructive", // Optional prop: Variant for the confirm button (default "destructive")
}) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        <DialogHeader className="px-8 py-6 border-b border-border bg-background flex flex-row items-center">
          <DialogTitle className="text-2xl font-bold text-card-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="px-8 py-6">
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </div>

        <DialogFooter className="flex justify-end gap-2 px-8 py-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : confirmText} {/* Show loading state */}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}