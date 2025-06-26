// src/components/layout/Sidebar.jsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Home as HomeIcon,
  Video as VideoIcon,
  User as UserIcon,
  List as ListIcon,
  History as HistoryIcon,
  ThumbsUp as ThumbsUpIcon,
  LogOut as LogoutIcon,
  Settings as SettingsIcon,
} from "lucide-react";
import { Button } from "../ui/button";
import { useAuth } from "../../contexts/AuthContext";

export default function Sidebar({ collapsed, isMobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();

  const navItems = user
    ? [
        { name: "Home", icon: HomeIcon, path: "/" },
        { name: "My Channel", icon: UserIcon, path: `/channel/${user.username}` },
        { name: "History", icon: HistoryIcon, path: "/history" },
        { name: "Liked Videos", icon: ThumbsUpIcon, path: "/liked" },
        { name: "Playlists", icon: ListIcon, path: "/playlists/all" }, 
        { name: "Upload Video", icon: VideoIcon, path: "/upload" },
        { name: "Settings", icon: SettingsIcon, path: "/settings" },
      ]
    : [{ name: "Home", icon: HomeIcon, path: "/" }];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onCloseMobile}
        ></div>
      )}

      {/* Actual Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border z-50 overflow-y-auto transition-all duration-200",
          "font-sans", // Apply the font family here
          "hidden lg:block",
          {
            "w-64": !collapsed,
            "w-20": collapsed,
          }
        )}
      >
        <nav className="flex flex-col p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )
              }
            >
              <item.icon
                className={cn("shrink-0", { "size-5": !collapsed, "size-6": collapsed })}
              />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">{item.name}</span>
              )}
            </NavLink>
          ))}
          {user && (
            <Button
              variant="ghost"
              className={cn(
                "flex items-center justify-start rounded-md px-3 py-2 transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                { "w-full": !collapsed, "w-auto": collapsed }
              )}
              onClick={() => {
                logout();
                if (isMobileOpen) onCloseMobile();
              }}
            >
              <LogoutIcon
                className={cn("shrink-0", { "size-5": !collapsed, "size-6": collapsed })}
              />
              {!collapsed && (
                <span className="ml-3 text-sm font-medium">Logout</span>
              )}
            </Button>
          )}
        </nav>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 h-[calc(100vh-4rem)] bg-sidebar border-r border-sidebar-border z-50 overflow-y-auto transition-transform duration-300 transform",
          "font-sans", // Apply font here too
          "lg:hidden",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          "w-64"
        )}
      >
        <nav className="flex flex-col p-2 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center rounded-md px-3 py-2 transition-colors",
                  "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive &&
                    "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                )
              }
              onClick={onCloseMobile}
            >
              <item.icon className="size-5 shrink-0" />
              <span className="ml-3 text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
          {user && (
            <Button
              variant="ghost"
              className="flex items-center justify-start rounded-md px-3 py-2 transition-colors text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full"
              onClick={() => {
                logout();
                onCloseMobile();
              }}
            >
              <LogoutIcon className="size-5 shrink-0" />
              <span className="ml-3 text-sm font-medium">Logout</span>
            </Button>
          )}
        </nav>
      </aside>
    </>
  );
}