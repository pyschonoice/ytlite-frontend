import { useQuery } from "@tanstack/react-query";
import { get } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import VideoCard from "../components/VideoCard";
import PlaylistCard from "../components/PlaylistCard";
import TweetCard from "../components/TweetCard";
import { useState } from "react";
import { CheckCircle } from "lucide-react";

const TABS = [
  { key: "home", label: "Home" },
  { key: "videos", label: "Videos" },
  { key: "playlists", label: "Playlists" },
  { key: "posts", label: "Posts" },
  // Add more tabs as needed
];

export default function Profile() {
  const { user } = useAuth();
  const username = user?.username;
  const [tab, setTab] = useState("home");

  // User info
  const { data: userData } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });
  const userId = userData?.data?.channel?._id;

  // Subscribers
  const { data: subsData } = useQuery({
    queryKey: ["subscribers", username],
    queryFn: () => get(`/subscribe/c/${username}`),
    enabled: !!username,
  });
  // Uploaded videos
  const { data: videosData } = useQuery({
    queryKey: ["profileVideos", userId],
    queryFn: () => get(`/video/?userId=${userId}`),
    enabled: !!userId,
  });
  // Tweets
  const { data: tweetsData } = useQuery({
    queryKey: ["tweets", username],
    queryFn: () => get(`/tweet/c/${username}`),
    enabled: !!username,
  });
  // Playlists
  const { data: playlistsData } = useQuery({
    queryKey: ["playlists", userId],
    queryFn: () => get(`/playlist/user/${userId}`),
    enabled: !!userId,
  });

  const channel = userData?.data?.channel;
  const videos = videosData?.data?.videos || videosData?.data || [];
  const tweets = tweetsData?.data?.tweets || tweetsData?.data || [];
  const playlists = playlistsData?.data?.playlists || playlistsData?.data || [];
  const subscribers = subsData?.data?.subscribers || [];

  return (
    <div className="py-4">
      {/* Banner and Profile */}
      <div className="relative mb-4">
        {/* Banner */}
        <div className="w-full h-48 sm:h-64 md:h-72 rounded-2xl overflow-hidden bg-muted border border-border">
          {channel?.coverImage?.url && (
            <img
              src={channel.coverImage.url}
              alt="Cover"
              className="w-full h-full rounded-2xl object-cover"
            />
          )}
        </div>
        {/* Avatar and Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 px-6  relative  z-10">
          <img
            src={channel?.avatar?.url}
            alt={channel?.fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl bg-background"
            style={{ marginTop: '-4rem', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }}
          />
          <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-3xl font-bold text-card-foreground">
                {channel?.fullName || channel?.username}
              </div>
              <div className="text-muted-foreground text-lg font-medium">@{channel?.username}</div>
              <div className="text-muted-foreground text-sm mt-1">{subscribers.length} subscribers • {videos.length} videos</div>
  
            </div>
            <div className="flex flex-col sm:items-end sm:ml-auto mt-4 sm:mt-0">
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold text-lg shadow hover:bg-primary/90 transition-colors">Subscribed</button>
            </div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-6 border-b border-border flex gap-6 px-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-3 px-4 font-semibold text-base transition-colors border-b-2 ${tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Tab Content */}
      <div className="px-2 sm:px-6">
        {/* {tab === "home" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
            {videos.slice(0, 10).map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )} */}
        {tab === "videos" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
        {tab === "posts" && (
          <div className="mb-8 px-2 max-w-2xl mx-auto">
            {tweets.map((tweet) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))}
          </div>
        )}
        {tab === "playlists" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 