// src/components/layout/Header.jsx
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
// Imported SettingsIcon (already there)
// Added LogOut icon for consistency with logout functionality
import { Menu, X, Plus, User, Settings as SettingsIcon, LogOut as LogoutIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";

const AVATAR_PLACEHOLDER = "https://ui-avatars.com/api/?name=User&background=888&color=fff&rounded=true";

export default function Header({
  onToggleSidebar,
  onToggleMobileSidebar,
  sidebarCollapsed,
  isSidebarToggleDisabled = false,
}) {
  const { user, logout } = useAuth();
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setIsMobileDropdownOpen(false);
  }, [location.pathname]);

  const avatarUrl = user?.avatar?.url || AVATAR_PLACEHOLDER;
  const avatarLink = user ? "/profile" : "/login";

  return (
    <header className="w-full h-16 flex items-center px-4 sm:px-6 border-b border-border bg-card text-card-foreground sticky top-0 z-50 overscroll-none">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {/* Mobile Sidebar Toggle Button (visible below lg breakpoint) */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Toggle mobile sidebar"
              onClick={onToggleMobileSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Desktop Sidebar Toggle Button (visible only on lg breakpoint and above) */}
          <div className="hidden lg:block">
            <Button
              variant="ghost"
              size="icon"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              onClick={onToggleSidebar}
              disabled={isSidebarToggleDisabled}
              className={isSidebarToggleDisabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo */}
          <Link
            to="/"
            className="font-bold text-lg sm:text-xl tracking-tight hover:text-primary transition-colors"
          >
            ytlite
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {user && (
            <button
              onClick={() => navigate("/upload")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Upload
            </button>
          )}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-2">
             
              {/* Logout Icon (size h-5 w-5, consistent with ThemeToggle) */}
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full size-9 flex items-center justify-center" // Ensure actual button size is consistent
                onClick={logout}
                aria-label="Logout"
                title="Logout"
              >
                <LogoutIcon className="h-6 w-6" /> {/* Explicitly setting icon size to h-5 w-5 */}
              </Button>
             {/* Settings Icon (size h-5 w-5, consistent with ThemeToggle) */}
             <Button
                variant="ghost"
                size="icon" // size="icon" makes button size 9 (h-9 w-9 by default), and inner icon size 4 (h-4 w-4)
                className="rounded-full size-9 flex items-center justify-center" // Ensure actual button size is consistent
                onClick={() => navigate("/settings")}
                aria-label="Account settings"
                title="Account settings"
              >
                <SettingsIcon className="h-6 w-6" /> {/* Explicitly setting icon size to h-5 w-5 */}
              </Button>

              {/* Profile Avatar */}
              <Link
                to={avatarLink}
                className="flex items-center"
              >
                <img
                  src={avatarUrl}
                  alt={user.fullName || user.username || "User"}
                  className="w-10 h-10 rounded-full object-cover border border-border bg-muted"
                />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-sm hover:text-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button (for the dropdown) */}
        <div className="md:hidden flex items-center gap-2">
          {user && (
            <button
              onClick={() => navigate("/upload")}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
          <ThemeToggle />
          <button
            onClick={() => setIsMobileDropdownOpen((open) => !open)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            {isMobileDropdownOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileDropdownOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border md:hidden animate-in slide-in-from-top-2 fade-in-80">
          <div className="px-4 py-4 space-y-4">
            {user && (
              <>
                <button
                  onClick={() => {
                    setIsMobileDropdownOpen(false);
                    navigate("/upload");
                  }}
                  className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors w-full justify-center"
                >
                  <Plus className="h-4 w-4" />
                  Create
                </button>
                {/* Settings Link for Mobile */}
                <Link
                  to="/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMobileDropdownOpen(false)}
                >
                  <SettingsIcon className="h-5 w-5" />
                  Account Settings
                </Link>
                {/* Profile Link for Mobile */}
                <Link
                  to={avatarLink}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-card-foreground hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsMobileDropdownOpen(false)}
                >
                  <img
                    src={avatarUrl}
                    alt={user.fullName || user.username || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-border bg-muted"
                  />
                  <span className="font-medium">{user.fullName || user.username}</span>
                </Link>
                {/* Logout Link/Button for Mobile */}
                <button
                  onClick={() => {
                    logout();
                    setIsMobileDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 rounded-md transition-colors w-full"
                >
                  <LogoutIcon className="h-5 w-5" /> {/* Consistent icon size */}
                  Logout
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="block text-sm hover:text-primary transition-colors"
                  onClick={() => setIsMobileDropdownOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors text-center"
                  onClick={() => setIsMobileDropdownOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}