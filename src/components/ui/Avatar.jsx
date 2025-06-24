import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AVATAR_PLACEHOLDER = "https://ui-avatars.com/api/?name=User&background=888&color=fff&rounded=true";

export default function Avatar({ user, size = "md", className = "", onClick, style = {}, ...props }) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const avatarUrl = user?.avatar?.url || AVATAR_PLACEHOLDER;
  const isOwn = currentUser && user?.username === currentUser.username;
  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) return onClick();
    if (isOwn) navigate("/profile");
    else if (user?.username) navigate(`/channel/${user.username}`);
  };
  let sizeClass = "w-10 h-10";
  if (size === "sm") sizeClass = "w-7 h-7";
  if (size === "lg") sizeClass = "w-16 h-16";
  if (size === "xl") sizeClass = "w-32 h-32";
  return (
    <img
      src={avatarUrl}
      alt={user?.fullName || user?.username || "User"}
      className={`rounded-full object-cover border border-border bg-muted cursor-pointer ${sizeClass} ${className}`}
      style={style}
      onClick={handleClick}
      tabIndex={0}
      onKeyDown={e => (e.key === "Enter" ? handleClick(e) : undefined)}
      loading="lazy"
      {...props}
    />
  );
} 