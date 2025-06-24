import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "../services/api";
import PlaylistCard from "../components/PlaylistCard";
import TweetCard from "../components/TweetCard";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

function VideoCard({ video }) {
  return (
    <Link
      to={`/video/${video._id}`}
      className="group block rounded-lg overflow-hidden bg-card border border-border shadow hover:shadow-lg transition-all duration-200"
    >
      <div className="aspect-video bg-muted overflow-hidden">
        <img
          src={video.thumbnail?.url}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
      </div>
      <div className="p-3 flex flex-col gap-1">
        <div className="font-semibold text-card-foreground line-clamp-2 text-base">
          {video.title}
        </div>
        <div className="text-xs text-muted-foreground flex gap-2">
          <span>{video.views} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}

const TABS = [
  { key: "videos", label: "Videos" },
  { key: "posts", label: "Posts" },
  { key: "playlists", label: "Playlists" },
];

const AVATAR_PLACEHOLDER = "https://ui-avatars.com/api/?name=User&background=888&color=fff&rounded=true";

export default function Channel() {
  const { username } = useParams();
  const { user } = useAuth();
  const [tab, setTab] = useState("videos");
  const { data: channelData, isLoading: loadingChannel, isError: errorChannel } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });
  const channelId = channelData?.data?._id;
  const { data: videosData, isLoading: loadingVideos, isError: errorVideos } = useQuery({
    queryKey: ["channelVideos", username],
    queryFn: () => get(`/dashboard/videos/${channelId}`),
    enabled: !!channelId,
  });
  const { data: tweetsData, isLoading: loadingTweets, isError: errorTweets } = useQuery({
    queryKey: ["channelTweets", username],
    queryFn: () => get(`/tweet/c/${username}`),
    enabled: !!username,
  });
  const { data: playlistsData, isLoading: loadingPlaylists, isError: errorPlaylists } = useQuery({
    queryKey: ["channelPlaylists", channelId],
    queryFn: () => get(`/playlist/user/${channelId}`),
    enabled: !!channelId,
  });

  if (loadingChannel) return <div className="text-muted-foreground">Loading channel...</div>;
  if (errorChannel || !channelData?.data) return <div className="text-destructive">Channel not found.</div>;

  const channel = channelData.data;
  const videos = videosData?.data || [];
  const tweets = tweetsData?.data?.tweets || tweetsData?.data || [];
  const playlists = playlistsData?.data?.playlists || playlistsData?.data || [];
  const isOwnChannel = user && channel.username === user.username;
  const avatarUrl = channel.avatar?.url || AVATAR_PLACEHOLDER;
  const avatarLink = isOwnChannel ? "/profile" : `/channel/${channel.username}`;

  return (
    <div className="py-4">
      {/* Banner and Profile */}
      <div className="relative mb-4">
        {/* Banner */}
        <div className="w-full h-48 sm:h-64 md:h-72 rounded-2xl overflow-hidden bg-muted border border-border">
          {channel.coverImage?.url ? (
            <img
              src={channel.coverImage.url}
              alt="Cover"
              className="w-full h-full rounded-2xl object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-2xl">No cover image</div>
          )}
        </div>
        {/* Avatar and Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 px-6  relative  z-10">
          <Link to={avatarLink} className="shrink-0">
            <img
              src={avatarUrl}
              alt={channel.fullName || channel.username}
              className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl bg-background"
              style={{ marginTop: '-4rem', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }}
            />
          </Link>
          <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
            <div>
              <div className="flex items-center gap-2 text-3xl font-bold text-card-foreground">
                {channel.fullName || channel.username}
              </div>
              <div className="text-muted-foreground text-lg font-medium">@{channel.username}</div>
              <div className="text-muted-foreground text-sm mt-1">{channel.subscribers?.length || 0} subscribers • {videos.length} videos</div>
              {channel.email && <div className="text-muted-foreground text-sm mt-1">{channel.email}</div>}
              {channel.bio && <div className="text-muted-foreground text-sm mt-1">{channel.bio}</div>}
            </div>
            <div className="flex flex-col sm:items-end sm:ml-auto mt-4 sm:mt-0">
              {!isOwnChannel && (
                <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold text-lg shadow hover:bg-primary/90 transition-colors">Subscribe</button>
              )}
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
        {tab === "videos" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
            {loadingVideos && <div className="text-muted-foreground">Loading videos...</div>}
            {errorVideos && <div className="text-destructive">Failed to load videos.</div>}
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
        )}
        {tab === "posts" && (
          <div className="mb-8 px-2 max-w-2xl mx-auto">
            {loadingTweets && <div className="text-muted-foreground">Loading posts...</div>}
            {errorTweets && <div className="text-destructive">Failed to load posts.</div>}
            {tweets.map((tweet) => (
              <TweetCard key={tweet._id} tweet={tweet} />
            ))}
          </div>
        )}
        {tab === "playlists" && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {loadingPlaylists && <div className="text-muted-foreground">Loading playlists...</div>}
            {errorPlaylists && <div className="text-destructive">Failed to load playlists.</div>}
            {playlists.map((playlist) => (
              <PlaylistCard key={playlist._id} playlist={playlist} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 