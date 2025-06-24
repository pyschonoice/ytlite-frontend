import { Link } from "react-router-dom";
import { Home, User, TrendingUp, Clock, Heart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { cn } from "../../lib/utils";

export default function Sidebar({ collapsed, isMobileOpen, onCloseMobile }) {
  const { user } = useAuth();
  const navigationItems = [
    { icon: Home, label: "Home", path: "/", always: true },
    { icon: TrendingUp, label: "Trending", path: "/trending", always: true },
    { icon: Clock, label: "History", path: "/history", auth: true },
    { icon: Heart, label: "Liked", path: "/liked", auth: true },
    { icon: User, label: "Profile", path: "/profile", auth: true },
  ];

  return (
    <>
      {/* Overlay for mobile when sidebar is open */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      <aside
        className={cn(
          "flex flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-all duration-200 z-40",
          // Desktop behavior (sticky, pushes content)
          "hidden lg:flex sticky top-16 h-[calc(100vh-4rem)]", // Fixed height, starts below header
          collapsed ? "w-20" : "w-64",
          // Mobile behavior (fixed, overlays content)
          isMobileOpen
            ? "left-0 fixed top-0 h-full" // Visible fixed overlay
            : "-left-full lg:left-auto" // Hidden on mobile, auto-position on desktop
        )}
      >
        <nav className="space-y-2 flex-1 p-2 mt-0 overflow-y-auto custom-scrollbar">
          {navigationItems.map((item) => {
            if (item.auth && !user) return null;
            if (!item.auth && !item.always) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMobile} // Close sidebar on navigation for mobile
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors",
                  collapsed && "justify-center px-0"
                )}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}