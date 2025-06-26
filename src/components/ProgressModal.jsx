// src/components/ProgressModal.jsx
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function ProgressModal({
  open,
  title,
  description,
  variant = "loading", // 'loading', 'success', 'error'
}) {
  let headerIcon = null;
  let titleColorClass = "text-card-foreground"; // Default

  if (variant === "loading") {
    headerIcon = <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />;
    titleColorClass = "text-primary";
  } else if (variant === "success") {
    headerIcon = <CheckCircle className="mr-2 h-6 w-6 text-primary" />; // Re-using primary for success
    titleColorClass = "text-primary";
  } else if (variant === "error") {
    headerIcon = <XCircle className="mr-2 h-6 w-6 text-destructive" />;
    titleColorClass = "text-destructive";
  }

  return (
    <Dialog open={open}> {/* No onOpenChange here, parent fully controls */}
      <DialogContent className="sm:max-w-[400px] rounded-lg shadow-lg overflow-hidden bg-card border border-border p-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-background flex flex-row items-center">
          {headerIcon}
          <DialogTitle className={`text-xl font-bold ${titleColorClass}`}>{title}</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4">
          <DialogDescription className="text-muted-foreground">
            {description}
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}