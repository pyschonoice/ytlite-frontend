import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "../services/api";
import Avatar from "../components/ui/Avatar";
import AvatarSkeleton from "../components/ui/AvatarSkeleton";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import PlaylistCard from "../components/PlaylistCard";
import PlaylistCardSkeleton from "../components/PlaylistCardSkeleton";
import TweetCard from "../components/TweetCard";
import TweetCardSkeleton from "../components/TweetCardSkeleton";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileBanner from "../components/ProfileBanner";
import SortAndActionBar from "../components/SortAndActionBar";
import { Video, List, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [videoSort, setVideoSort] = useState("desc");
  const [postSort, setPostSort] = useState("desc");
  const [playlistSort, setPlaylistSort] = useState("desc");
  const navigate = useNavigate();

  const { data: channelData, isLoading: loadingChannel, isError: errorChannel } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });

  const channelId = channelData?.data?.channel?._id; // Corrected access for channelId

  const { data: videosData, isLoading: loadingVideos, isError: errorVideos } = useQuery({
    queryKey: ["channelVideos", username, videoSort],
    queryFn: () => get(`/dashboard/videos/${channelId}?sortBy=createdAt&sortType=${videoSort}`),
    enabled: !!channelId,
  });

  const { data: tweetsData, isLoading: loadingTweets, isError: errorTweets } = useQuery({
    queryKey: ["channelTweets", username, postSort],
    queryFn: () => get(`/tweet/c/${username}?sortBy=createdAt&sortType=${postSort}`),
    enabled: !!username,
  });

  const { data: playlistsData, isLoading: loadingPlaylists, isError: errorPlaylists } = useQuery({
    queryKey: ["channelPlaylists", channelId, playlistSort],
    queryFn: () => get(`/playlist/user/${channelId}?sortBy=createdAt&sortType=${playlistSort}`),

    enabled: !!channelId,
  });

  if (loadingChannel) return <div className="text-muted-foreground">Loading channel...</div>;
  if (errorChannel || !channelData?.data?.channel) return <div className="text-destructive">Channel not found.</div>; // Corrected check

  const channel = channelData.data.channel; // Corrected access
  const videos = videosData?.data?.videos || []; // Corrected access
  const tweets = tweetsData?.data?.tweets || []; // Corrected access
  const playlists = playlistsData?.data?.playlists || []; // Corrected access


  const isOwnChannel = user && channel.username === user.username;
  const avatarUrl = channel.avatar?.url || AVATAR_PLACEHOLDER;
  const avatarLink = isOwnChannel ? "/profile" : `/channel/${channel.username}`;

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Banner and Profile */}
      <ProfileBanner
        channel={channel}
        userDataLoading={loadingChannel}
        subscribersCount={channel.subscribersCount || 0}
        videosCount={videos.length}
        rightContent={!isOwnChannel && (
          <button className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold text-lg shadow hover:bg-primary/90 transition-colors">Subscribe</button>
        )}
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
            />
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 mb-8">
              {loadingVideos
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
            />
            <div className="mb-8 px-2 max-w-2xl mx-auto flex flex-col gap-8">
              {loadingTweets
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
            />
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {loadingPlaylists
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
          </>
        )}
      </div>
    </div>
  );
}