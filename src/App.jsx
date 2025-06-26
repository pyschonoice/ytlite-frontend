// src/App.jsx (Only Routes section updated)
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";
import Home from "./pages/Home";
import Video from "./pages/Video";
import Channel from "./pages/Channel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import UploadVideo from "./pages/UploadVideo";
import History from "./pages/History";
import Liked from "./pages/Liked";
import Playlists from "./pages/Playlists";
import AllUserPlaylists from "./pages/AllUserPlaylists";
import Settings from "./pages/Settings";
import TweetDetails from "./pages/TweetDetails"; // <-- NEW IMPORT

import { useAuth } from "./contexts/AuthContext";
import { cn } from "./lib/utils";

// Simple PrivateRoute component
const PrivateRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading application...</div>;
  return user ? children : <Navigate to="/login" replace />;
};

export default function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isVideoPage = location.pathname.startsWith("/video/");
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const isSettingsPage = location.pathname === "/settings";
  const isAllPlaylistsPage = location.pathname === "/playlists/all";
  const isTweetDetailsPage = location.pathname.startsWith("/tweet/"); // <-- NEW check
  const forceSidebarCollapsed = isVideoPage || isAuthPage || isSettingsPage || isAllPlaylistsPage || isTweetDetailsPage; // <-- UPDATED

  useEffect(() => {
    if (forceSidebarCollapsed) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
    setIsMobileSidebarOpen(false);
  }, [location.pathname, forceSidebarCollapsed]);

  const handleToggleDesktopSidebar = () => {
    if (forceSidebarCollapsed) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed((c) => !c);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        onToggleSidebar={handleToggleDesktopSidebar}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        sidebarCollapsed={sidebarCollapsed}
        isSidebarToggleDisabled={forceSidebarCollapsed}
      />
      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-200 h-[calc(100vh-4rem)]",
            "p-4 sm:p-6 lg:p-8",
            {
              "lg:ml-64": !sidebarCollapsed && !isAuthPage,
              "lg:ml-20": sidebarCollapsed && !isAuthPage,
              "ml-0": isAuthPage,
            }
          )}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/video/:id" element={<Video />} />
            <Route path="/channel/:username" element={<Channel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Authenticated Routes */}
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
            <Route path="/upload" element={<PrivateRoute><UploadVideo /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/liked" element={<PrivateRoute><Liked /></PrivateRoute>} />
            <Route path="/playlist/:playlistId" element={<PrivateRoute><Playlists /></PrivateRoute>} />
            <Route path="/playlists/all" element={<PrivateRoute><AllUserPlaylists /></PrivateRoute>} />
            <Route path="/tweet/:tweetId" element={<PrivateRoute><TweetDetails /></PrivateRoute>} /> {/* <-- NEW ROUTE */}
            <Route path="*" element={<div className="text-center text-muted-foreground text-xl mt-20">404 - Page Not Found</div>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}