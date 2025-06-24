import { useState, useEffect } from "react";
import { Button } from "./ui/button";

export default function CreateEditPlaylistModal({
  open,
  onClose,
  onSubmit,
  initialName = "",
  initialDescription = "",
  loading = false,
  error = "",
  mode = "create", // or 'edit'
}) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (open) {
      setName(initialName);
      setDescription(initialDescription);
      setTouched(false);
    }
  }, [open, initialName, initialDescription]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched(true);
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        className="bg-card border border-border rounded-xl p-6 max-w-sm w-full shadow-xl flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <div className="text-lg font-semibold mb-2 text-card-foreground">
          {mode === "edit" ? "Edit Playlist" : "Create Playlist"}
        </div>
        <input
          type="text"
          placeholder="Playlist name"
          className="bg-muted px-3 py-2 rounded border border-border text-base outline-none"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={50}
          disabled={loading}
          autoFocus
        />
        <textarea
          placeholder="Description"
          className="bg-muted px-3 py-2 rounded border border-border text-base outline-none min-h-[60px] resize-none"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={200}
          disabled={loading}
        />
        {touched && !name.trim() && (
          <div className="text-destructive text-xs">Name is required.</div>
        )}
        {error && <div className="text-destructive text-xs">{error}</div>}
        <div className="flex gap-2 mt-2">
          <Button type="submit" disabled={loading || !name.trim()} className="flex-1">
            {loading ? (mode === "edit" ? "Saving..." : "Creating...") : (mode === "edit" ? "Save Changes" : "Create Playlist")}
          </Button>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
} 