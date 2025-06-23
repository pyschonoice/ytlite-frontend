import { Link } from "react-router-dom";
import { Home, User, TrendingUp, Clock, Heart } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar() {
  const { user } = useAuth();
  const navigationItems = [
    { icon: Home, label: "Home", path: "/", always: true },
    { icon: TrendingUp, label: "Trending", path: "/trending", always: true },
    { icon: Clock, label: "History", path: "/history", auth: true },
    { icon: Heart, label: "Liked", path: "/liked", auth: true },
    { icon: User, label: "Profile", path: "/profile", auth: true },
  ];

  return (
    <aside className="hidden lg:block w-64 min-h-screen border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
            if (item.auth && !user) return null;
            if (!item.auth && !item.always) return null;
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
} 