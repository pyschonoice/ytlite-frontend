// src/components/MessageModal.jsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { XCircle, Info, CheckCircle } from "lucide-react"; // Icons for different variants

export default function MessageModal({
  open,
  title,
  description,
  variant = "info", // 'info', 'success', 'error'
  onClose, // Function to close the modal
  duration = 3000, // How long it stays open (in ms)
}) {
  let headerIcon = null;
  let titleColorClass = "text-card-foreground";
  let borderColorClass = "border-border";
  let bgColorClass = "bg-card";

  // Determine styling based on variant
  if (variant === "error") {
    headerIcon = <XCircle className="mr-2 h-6 w-6 text-destructive" />;
    titleColorClass = "text-destructive";
    borderColorClass = "border-destructive/50";
    bgColorClass = "bg-destructive/10";
  } else if (variant === "success") {
    headerIcon = <CheckCircle className="mr-2 h-6 w-6 text-primary" />;
    titleColorClass = "text-primary";
    borderColorClass = "border-primary/50";
    bgColorClass = "bg-primary/10";
  } else {
    // Default to 'info'
    headerIcon = <Info className="mr-2 h-6 w-6 text-blue-500" />;
    titleColorClass = "text-blue-500";
    borderColorClass = "border-blue-500/50";
    bgColorClass = "bg-blue-500/10";
  }

  // Auto-close functionality
  useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className={`sm:max-w-[400px] rounded-lg shadow-lg overflow-hidden p-0 ${bgColorClass} ${borderColorClass}`}
      >
        <DialogHeader
          className={`px-6 py-4 border-b ${borderColorClass} flex flex-row items-center bg-background`}
        >
          {headerIcon}
          <DialogTitle className={`text-xl font-bold ${titleColorClass}`}>
            {title}
          </DialogTitle>
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