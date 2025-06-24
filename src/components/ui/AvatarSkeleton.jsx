export default function AvatarSkeleton({ size = "md", className = "" }) {
  let sizeClass = "w-10 h-10";
  if (size === "sm") sizeClass = "w-7 h-7";
  if (size === "lg") sizeClass = "w-16 h-16";
  if (size === "xl") sizeClass = "w-32 h-32";
  return (
    <div className={`rounded-full bg-muted animate-pulse border border-border ${sizeClass} ${className}`}></div>
  );
} 