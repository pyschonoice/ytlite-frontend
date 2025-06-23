import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import ThemeToggle from "../ui/ThemeToggle";
import { Menu, X, Plus } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="w-full h-16 flex items-center px-4 sm:px-6 border-b border-border bg-card text-card-foreground sticky top-0 z-50 overscroll-none">
      <div className="flex items-center justify-between w-full">
        {/* Logo */}
        <Link to="/" className="font-bold text-lg sm:text-xl tracking-tight hover:text-primary transition-colors">
          ytlite
        </Link>

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
              <Link to="/profile" className="text-sm hover:text-primary transition-colors">
                {user.fullName}
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

        {/* Mobile Menu Button */}
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
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 hover:bg-accent rounded-md transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-card border-b border-border md:hidden">
          <div className="px-4 py-4 space-y-4">
            {user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
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
                  to="/profile"
                  className="block text-sm hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {user.fullName}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
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
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm hover:bg-primary/90 transition-colors text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
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