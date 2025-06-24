import { Routes, Route, useLocation } from "react-router-dom";
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

export default function App() {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isVideoPage = location.pathname.startsWith("/video/");

  useEffect(() => {
    if (isVideoPage) {
      // On video page, force sidebar to be collapsed
      setSidebarCollapsed(true);
    } else {
      // On other pages, sidebar state can be managed by user (e.g., uncollapse by default)
      setSidebarCollapsed(false); // Default to uncollapsed on non-video pages
    }
    // Always close mobile sidebar overlay on route change
    setIsMobileSidebarOpen(false);
  }, [location.pathname, isVideoPage]);

  // Handler for desktop sidebar toggle, now aware of video page
  const handleToggleDesktopSidebar = () => {
    if (isVideoPage) {
      // If on video page, do not allow toggling (keep collapsed)
      setSidebarCollapsed(true);
    } else {
      // Otherwise, allow toggling
      setSidebarCollapsed((c) => !c);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header
        onToggleSidebar={handleToggleDesktopSidebar} // Use the new handler
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        sidebarCollapsed={sidebarCollapsed}
        isSidebarToggleDisabled={isVideoPage} // New prop to disable toggle on video page
      />
      <div className="flex flex-1">
        <Sidebar
          collapsed={sidebarCollapsed} // Sidebar will be collapsed on video page
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
        <main
          className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto transition-all duration-200 h-[calc(100vh-4rem)]"
        >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/video/:id" element={<Video />} />
              <Route path="/channel/:username" element={<Channel />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/upload" element={<UploadVideo />} />
              <Route path="/history" element={<History />} />
              <Route path="/liked" element={<Liked />} />
              <Route path="/playlist/:playlistId" element={<Playlists />} />
            </Routes>
          
        </main>
      </div>
    </div>
  );
}