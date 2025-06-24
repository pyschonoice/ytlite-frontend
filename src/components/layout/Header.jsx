import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import { Menu, X, Plus, User } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";

const AVATAR_PLACEHOLDER = "https://ui-avatars.com/api/?name=User&background=888&color=fff&rounded=true";

export default function Header({
  onToggleSidebar,
  onToggleMobileSidebar,
  sidebarCollapsed,
  isSidebarToggleDisabled = false, // New prop with default value
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
              disabled={isSidebarToggleDisabled} // Disable the button here
              className={isSidebarToggleDisabled ? "opacity-50 cursor-not-allowed" : ""} // Visual feedback
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
              Create
            </button>
          )}
          <ThemeToggle />
          {user ? (
            <div className="flex items-center gap-4">
              <Link
                to={avatarLink}
                className="flex items-center"
              >
                <img
                  src={avatarUrl}
                  alt={user.fullName || user.username || "User"}
                  className="w-9 h-9 rounded-full object-cover border border-border bg-muted"
                />
              </Link>
              <button
                onClick={logout}
                className="text-sm hover:text-destructive transition-colors"
              >
                Logout
              </button>
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
            )}
            {user ? (
              <>
                <Link
                  to={avatarLink}
                  className="flex items-center gap-2"
                  onClick={() => setIsMobileDropdownOpen(false)}
                >
                  <img
                    src={avatarUrl}
                    alt={user.fullName || user.username || "User"}
                    className="w-8 h-8 rounded-full object-cover border border-border bg-muted"
                  />
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileDropdownOpen(false);
                  }}
                  className="block text-sm hover:text-destructive transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
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