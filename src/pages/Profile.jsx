import { useQuery } from "@tanstack/react-query";
import { get } from "../services/api";
import { createPlaylist } from "../services/playlistApi";
import { useAuth } from "../contexts/AuthContext";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistCardSkeleton from "../components/PlaylistCardSkeleton";
import TweetCard from "../components/TweetCard";
import TweetCardSkeleton from "../components/TweetCardSkeleton";
import { useState } from "react";
import { CheckCircle, Plus, Video, List, Pencil } from "lucide-react";
import Avatar from "../components/ui/Avatar";
import AvatarSkeleton from "../components/ui/AvatarSkeleton";
import { Link, useNavigate } from "react-router-dom";
import ProfileBanner from "../components/ProfileBanner";
import SortAndActionBar from "../components/SortAndActionBar";
import PlaylistModal from "../components/PlaylistModal";
import CreateEditPlaylistModal from "../components/CreateEditPlaylistModal";

const TABS = [
  { key: "videos", label: "Videos" },
  { key: "playlists", label: "Playlists" },
  { key: "posts", label: "Posts" },
  { key: "subscribed", label: "Subscribed Channels" },
  { key: "subscribers", label: "Subscribers" },
];

export default function Profile() {
  const { user } = useAuth();
  const username = user?.username;
  const [tab, setTab] = useState("videos");
  const [videoSort, setVideoSort] = useState("desc");
  const [postSort, setPostSort] = useState("desc");
  const [playlistSort, setPlaylistSort] = useState("desc");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const navigate = useNavigate();

  // User info
  const { data: userData } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });
  const userId = userData?.data?.channel?._id;

  // Subscribers
  const { data: subsData, isLoading: loadingSubscribers } = useQuery({
    queryKey: ["subscribers", username],
    queryFn: () => get(`/subscribe/c/${username}`),
    enabled: !!username,
  });
  // Uploaded videos
  const { data: videosData } = useQuery({
    queryKey: ["profileVideos", userId, videoSort],
    queryFn: () => get(`/video/?userId=${userId}&sortBy=createdAt&sortType=${videoSort}`),
    enabled: !!userId,
  });
  // Tweets
  const { data: tweetsData } = useQuery({
    queryKey: ["tweets", username, postSort],
    queryFn: () => get(`/tweet/c/${username}?sortBy=createdAt&sortType=${postSort}`),
    enabled: !!username,
  });
  // Playlists
  const { data: playlistsData } = useQuery({
    queryKey: ["playlists", userId, playlistSort],
    queryFn: () => get(`/playlist/user/${userId}?sortBy=createdAt&sortType=${playlistSort}`),

    enabled: !!userId,
  });
  // Subscribed Channels
  const { data: subscribedData, isLoading: loadingSubscribed } = useQuery({
    queryKey: ["subscribedChannels", username],
    queryFn: () => get(`/subscribe/u/${username}`),
    enabled: !!username,
  });

  const channel = userData?.data?.channel;
  const videos = videosData?.data?.videos || videosData?.data || [];
  const tweets = tweetsData?.data?.tweets || tweetsData?.data || [];
  const playlists = playlistsData?.data?.playlists || playlistsData?.data || [];

  const subscribers = subsData?.data?.subscribers || [];
  const subscribedChannels = subscribedData?.data?.channels || subscribedData?.data || [];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Banner and Profile */}
      <ProfileBanner
        channel={channel}
        userDataLoading={userData?.isLoading}
        subscribersCount={subscribers.length}
        videosCount={videos.length}
      />
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
      <div className="px-2 sm:px-6 flex flex-col gap-10">
        {tab === "videos" && (
          <>
            <SortAndActionBar
              sortOrder={videoSort}
              onSortChange={setVideoSort}
              actionLabel={"+ Upload"}
              actionIcon={<Video className="w-5 h-5" />}
              onAction={() => window.location.href = "/upload"}
            />
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
              {videosData?.isLoading
                ? Array.from({ length: 5 }).map((_, i) => <VideoCardSkeleton key={i} />)
                : videos.map((video) => <VideoCard key={video._id} video={video} />)}
            </div>
          </>
        )}
        {tab === "posts" && (
          <>
            <SortAndActionBar
              sortOrder={postSort}
              onSortChange={setPostSort}
              actionLabel={"+ Post"}
              actionIcon={<Pencil className="w-5 h-5" />}
              onAction={() => alert("Create Post coming soon!")}
            />
            <div className="mb-8 px-2 max-w-2xl mx-auto flex flex-col gap-8">
              {tweetsData?.isLoading
                ? Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)
                : tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)}
            </div>
          </>
        )}
        {tab === "playlists" && (
          <>
            <SortAndActionBar
              sortOrder={playlistSort}
              onSortChange={setPlaylistSort}
              actionLabel={"+ Create"}
              actionIcon={<List className="w-5 h-5" />}
              onAction={() => setShowCreateModal(true)}
            />
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {playlistsData?.isLoading
                ? Array.from({ length: 3 }).map((_, i) => <PlaylistCardSkeleton key={i} />)
                : playlists.map((playlist) => (
                  <PlaylistCard
                    key={playlist._id}
                    playlist={playlist}
                    onClick={() => navigate(`/playlist/${playlist._id}`)}
                    className="cursor-pointer"
                  />
                ))}
            </div>
            <CreateEditPlaylistModal
              open={showCreateModal}
              onClose={() => { setShowCreateModal(false); setCreateError(""); }}
              onSubmit={({ name, description }) => {
                setCreateLoading(true);
                setCreateError("");
                createPlaylist({ name, description })
                  .then(() => {
                    setShowCreateModal(false);
                    setCreateLoading(false);
                    playlistsData.refetch && playlistsData.refetch();
                  })
                  .catch(err => {
                    setCreateError(err?.response?.data?.message || "Failed to create playlist");
                    setCreateLoading(false);
                  });
              }}
              loading={createLoading}
              error={createError}
              mode="create"
            />
          </>
        )}
        {tab === "subscribed" && (
          <div className="flex flex-col gap-4 mb-8">
            {loadingSubscribed
              ? Array.from({ length: 5 }).map((_, i) => <AvatarSkeleton key={i} size="lg" />)
              : (subscribedChannels.length === 0 ? <div className="text-muted-foreground">No subscriptions yet.</div> :
                subscribedChannels.map((ch) => (
                  <Link key={ch._id} to={`/channel/${ch.username}`} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card hover:shadow transition">
                    <Avatar user={ch} size="lg" />
                    <div>
                      <div className="font-semibold text-card-foreground">{ch.fullName || ch.username}</div>
                      <div className="text-muted-foreground text-sm">@{ch.username}</div>
                    </div>
                  </Link>
                )))}
          </div>
        )}
        {tab === "subscribers" && (
          <div className="flex flex-col gap-4 mb-8">
            {loadingSubscribers
              ? Array.from({ length: 5 }).map((_, i) => <AvatarSkeleton key={i} size="lg" />)
              : (subscribers.length === 0 ? <div className="text-muted-foreground">No subscribers yet.</div> :
                subscribers.map((ch) => (
                  <Link key={ch._id} to={`/channel/${ch.username}`} className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card hover:shadow transition">
                    <Avatar user={ch} size="lg" />
                    <div>
                      <div className="font-semibold text-card-foreground">{ch.fullName || ch.username}</div>
                      <div className="text-muted-foreground text-sm">@{ch.username}</div>
                    </div>
                  </Link>
                )))}
          </div>
        )}
      </div>
    </div>
  );
} 