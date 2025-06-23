import { Link } from "react-router-dom";
import { Home, User, Video, TrendingUp, Clock, Heart } from "lucide-react";

export default function Sidebar() {
  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: TrendingUp, label: "Trending", path: "/trending" },
    { icon: Clock, label: "History", path: "/history" },
    { icon: Heart, label: "Liked", path: "/liked" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <aside className="hidden lg:block w-64 min-h-screen border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="p-4">
        <nav className="space-y-2">
          {navigationItems.map((item) => {
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