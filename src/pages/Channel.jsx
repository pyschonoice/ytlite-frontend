// src/pages/Channel.jsx
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, toggleSubscription } from "../services/api";
import Avatar from "../components/ui/Avatar";
import AvatarSkeleton from "../components/ui/AvatarSkeleton";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
// import PlaylistCard from "../components/PlaylistCard"; // No longer needed for display
import PlaylistCardSkeleton from "../components/PlaylistCardSkeleton";
// import TweetCard from "../components/TweetCard"; // No longer needed for display
import TweetCardSkeleton from "../components/TweetCardSkeleton";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import ProfileBanner from "../components/ProfileBanner";
import SortAndActionBar from "../components/SortAndActionBar";
import { Video, List, Pencil } from "lucide-react"; // Pencil not directly used for posts action on channel
import { useNavigate } from "react-router-dom";
import TweetListDisplay from "../components/TweetListDisplay"; // <-- NEW: For Posts tab
import PlaylistListDisplay from "../components/PlaylistListDisplay"; // <-- NEW: For Playlists tab

const TABS = [
  { key: "videos", label: "Videos" },
  { key: "posts", label: "Posts" },
  { key: "playlists", label: "Playlists" },
];

const AVATAR_PLACEHOLDER = "https://ui-avatars.com/api/?name=User&background=888&color=fff&rounded=true";

export default function Channel() {
  const { username } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // All hooks must be called unconditionally at the top level
  const { user } = useAuth();
  const [tab, setTab] = useState("videos");
  const [videoSort, setVideoSort] = useState("desc");
  const [postSort, setPostSort] = useState("desc");
  const [playlistSort, setPlaylistSort] = useState("desc");
  const [subLoading, setSubLoading] = useState(false);

  // Fetch channel data
  const { data: channelData, isLoading: loadingChannel, isError: errorChannel } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });

  const channelId = channelData?.data?.channel?._id;

  // Fetch videos for the channel
  const { data: videosData, isLoading: loadingVideos, isError: errorVideos } = useQuery({
    queryKey: ["channelVideos", username, videoSort],
    queryFn: () => get(`/dashboard/videos/${channelId}?sortBy=createdAt&sortType=${videoSort}`),
    enabled: !!channelId,
  });

  // Fetch tweets for the channel
  const {
    data: tweetsData,
    isLoading: loadingTweets,
    isError: errorTweets,
    error: tweetsFetchError, // Capture specific error object
  } = useQuery({
    queryKey: ["channelTweets", username, postSort],
    queryFn: () => get(`/tweet/c/${username}?sortBy=createdAt&sortType=${postSort}`),
    enabled: !!username,
  });

  // Fetch playlists for the channel
  const {
    data: playlistsData,
    isLoading: loadingPlaylists,
    isError: errorPlaylists,
    error: playlistsFetchError, // Capture specific error object
  } = useQuery({
    queryKey: ["channelPlaylists", channelId, playlistSort],
    queryFn: () => get(`/playlist/user/${channelId}?sortBy=createdAt&sortType=${playlistSort}`),
    enabled: !!channelId,
  });

  // Subscribe/Unsubscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: () => toggleSubscription(channel.username),
    onMutate: () => setSubLoading(true),
    onSettled: () => setSubLoading(false),
    onSuccess: () => {
      queryClient.invalidateQueries(["channel", username]);
    },
    onError: (err) => {
      console.error("Subscription toggle failed:", err);
      // Optionally show a toast or error message here
    }
  });

  // Early returns after all hooks have been called
  if (loadingChannel) return <div className="text-muted-foreground text-center mt-20">Loading channel...</div>;
  if (errorChannel || !channelData?.data?.channel) return <div className="text-destructive text-center mt-20">Channel not found.</div>;

  const channel = channelData.data.channel;
  const videos = videosData?.data?.videos || [];
  const tweets = tweetsData?.data?.tweets || [];
  // Normalize playlists if the structure needs it, similar to Profile.jsx
  const playlists = Array.isArray(playlistsData?.data?.playlists)
    ? playlistsData.data.playlists.map(pl => ({
        ...pl,
        ownerDetails: pl.ownerDetails || pl.owner || {}, // Ensure ownerDetails is populated
        videoCount: pl.videoCount || 0,
      }))
    : [];

  const isOwnChannel = user && channel.username === user.username;
  const isSubscribed = channel.isSubscribed;
  const avatarUrl = channel.avatar?.url || AVATAR_PLACEHOLDER;
  // avatarLink is not directly used for navigation in return JSX, but kept for context if needed
  // const avatarLink = isOwnChannel ? "/profile" : `/channel/${channel.username}`;

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      {/* Banner and Profile */}
      <ProfileBanner
        channel={channel}
        userDataLoading={loadingChannel}
        subscribersCount={channel.subscribersCount || 0}
        videosCount={videos.length} // Note: This might not be accurate if videos are paginated/filtered
        rightContent={!isOwnChannel && (
          <button
            className={`bg-primary text-primary-foreground px-6 py-2 rounded-full font-semibold text-lg shadow hover:bg-primary/90 transition-colors flex items-center gap-2 ${subLoading ? 'opacity-60 cursor-not-allowed' : ''}`}
            disabled={subLoading}
            onClick={() => subscribeMutation.mutate()}
          >
            {subLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
            ) : isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
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
              // No action button for videos on a public channel page
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
              // No action button for creating posts on another user's channel page
            />
            {/* NEW: Use TweetListDisplay for posts */}
            <TweetListDisplay
              tweets={tweets}
              isLoading={loadingTweets}
              isError={errorTweets}
              emptyText="No posts yet."
              errorMessage={tweetsFetchError?.message || ""}
              isOwner={false} // Always false for another user's channel
              // No onEditTweet or onDeleteTweet needed here
            />
          </>
        )}
        {tab === "playlists" && (
          <>
            <SortAndActionBar
              sortOrder={playlistSort}
              onSortChange={setPlaylistSort}
              // No action button for creating playlists on another user's channel page
            />
            {/* NEW: Use PlaylistListDisplay for playlists */}
            <PlaylistListDisplay
              playlists={playlists}
              isLoading={loadingPlaylists}
              isError={errorPlaylists}
              emptyText="No playlists yet."
              errorMessage={playlistsFetchError?.message || ""}
              // No onEditPlaylist or onDeletePlaylist needed here
              // The PlaylistCard component inside PlaylistListDisplay already handles navigation to /playlist/:id
            />
          </>
        )}
      </div>
    </div>
  );
}