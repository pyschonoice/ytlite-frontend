import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, api } from "../services/api";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle, Bell, ThumbsUp, ThumbsDown } from "lucide-react";

function formatNumber(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
  return n;
}

function CommentList({ videoId }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["comments", videoId],
    queryFn: () => get(`/comment/${videoId}`),
    enabled: !!videoId,
  });
  if (isLoading) return <div className="text-muted-foreground">Loading comments...</div>;
  if (isError) return <div className="text-destructive">Failed to load comments.</div>;
  const comments = data?.data?.comments || data?.data || [];
  return (
    <div className="space-y-4 mt-4">
      {comments.length === 0 && <div className="text-muted-foreground">No comments yet.</div>}
      {comments.map((c) => (
        <div key={c._id} className="flex gap-3 items-start">
          <img src={c.ownerDetails?.avatar?.url} alt="avatar" className="w-8 h-8 rounded-full object-cover border border-border" />
          <div>
            <div className="font-medium text-card-foreground">{c.ownerDetails?.fullName || c.ownerDetails?.username}</div>
            <div className="text-muted-foreground text-xs mb-1">{new Date(c.createdAt).toLocaleString()}</div>
            <div className="text-card-foreground">{c.content}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CommentForm({ videoId, onSuccess }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  if (!user) return null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await api.post(`/comment/${videoId}`, { content });
      setContent("");
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to post comment");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment..."
        className="flex-1 px-3 py-2 border border-border rounded-md bg-input text-input-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        disabled={isLoading}
      />
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {isLoading ? "Posting..." : "Comment"}
      </button>
      {error && <div className="text-destructive text-sm ml-2">{error}</div>}
    </form>
  );
}

export default function Video() {
  const { id } = useParams();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const hasIncremented = useRef(false);

  // Fetch video details (with likeCount, isLiked)
  const { data, isLoading, isError } = useQuery({
    queryKey: ["video", id],
    queryFn: () => get(`/video/${id}`),
    enabled: !!id,
  });

  // Fetch channel info for subscribe state and subscriber count
  const channelUsername = data?.data?.owner?.username;
  const { data: channelData } = useQuery({
    queryKey: ["channelInfo", channelUsername],
    queryFn: () => get(`/user/c/${channelUsername}`),
    enabled: !!channelUsername,
  });

  // Set initial like/sub state from backend
  useEffect(() => {
    if (data?.data) {
      setLikeCount(data.data.likeCount || 0);
      setLiked(!!data.data.isLiked);
    }
  }, [data]);
  useEffect(() => {
    if (channelData?.data?.channel) {
      setSubscribed(!!channelData.data.channel.isSubscribed);
      console.log('subscribersCount from API:', channelData.data.channel.subscribersCount);
      setSubscriberCount(Number(channelData.data.channel.subscribersCount) || 0);
    }
  }, [channelData]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: () => api.post(`/like/toggle/v/${id}`),
    onSuccess: (res) => {
      // Optimistically update like state
      //setLiked((l) => !l);
      setLiked(!!data.data.isLiked);
      setLikeCount(data.data.likeCount);
      queryClient.invalidateQueries(["video", id]);
    },
  });

  // Subscribe mutation
  const subscribeMutation = useMutation({
    mutationFn: () => api.post(`/subscribe/c/${channelUsername}`),
    onSuccess: () => {
      setSubscribed((s) => !s);
      setSubscriberCount((c) => (subscribed ? c - 1 : c + 1));
      queryClient.invalidateQueries(["channelInfo", channelUsername]);
    },
  });

  // Comments refresh
  const refreshComments = () => queryClient.invalidateQueries(["comments", id]);

  const handlePlay = async () => {
    if (!hasIncremented.current && id) {
      hasIncremented.current = true;
      try {
        await api.patch(`/video/${id}/view`);
      } catch (e) {
        // ignore error
      }
    }
  };

  if (isLoading) return <div className="text-muted-foreground">Loading video...</div>;
  if (isError || !data?.data) return <div className="text-destructive">Video not found.</div>;

  const video = data.data;
  const isOwnChannel = user && channelUsername && user.username === channelUsername;

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-4">
      {/* Video Player and Info */}
      <div className="flex-1 w-full max-w-3xl mx-auto">
        <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
          <video
            src={video.videoFile?.url}
            poster={video.thumbnail?.url}
            controls
            className="w-full h-full object-contain rounded-lg"
            onPlay={handlePlay}
          />
        </div>
        {/* Video Header Section */}
        <div className="flex flex-col gap-2 mb-4">
          <h1 className="text-2xl font-bold text-card-foreground mb-1">{video.title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            {/* Channel Info and Subscribe */}
            <div className="flex items-center gap-4 flex-wrap">
              <Link to={`/channel/${video.owner?.username || video.owner?._id}`} className="flex items-center gap-2">
                <img
                  src={video.owner?.avatar?.url}
                  alt={video.owner?.fullName}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
                <span className="font-semibold text-card-foreground text-lg flex items-center gap-1">
                  {video.owner?.fullName || video.owner?.username}
                </span>
              </Link>
              <span className="text-muted-foreground text-sm min-w-[80px]">
                {typeof subscriberCount === 'number' && !isNaN(subscriberCount) ? formatNumber(subscriberCount) : 0} subscribers
              </span>
              {!isOwnChannel && (
                <button
                  onClick={() => subscribeMutation.mutate()}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full font-medium shadow transition-colors
                    ${subscribed ? "bg-muted text-muted-foreground border border-border" : "bg-primary text-primary-foreground hover:bg-primary/90"}
                    disabled:opacity-60`}
                  disabled={subscribeMutation.isLoading}
                >
                  <Bell className="w-5 h-5" />
                  {subscribed ? "Subscribed" : "Subscribe"}
                </button>
              )}
            </div>
            {/* Like/Dislike */}
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                onClick={() => likeMutation.mutate()}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors
                  ${liked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"}
                  disabled:opacity-60`}
                disabled={likeMutation.isLoading}
              >
                <ThumbsUp className="w-5 h-5" />
                {formatNumber(likeCount)}
              </button>
  
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mb-2">
          <span>{formatNumber(video.views)} views</span>
          <span>•</span>
          <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        </div>
        <div className="mb-4 text-card-foreground whitespace-pre-line">{video.description}</div>
      </div>
      {/* Comments and More (placeholder) */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="font-semibold mb-2 text-card-foreground">Comments</div>
          <CommentForm videoId={id} onSuccess={refreshComments} />
          <CommentList videoId={id} />
        </div>
      </div>
    </div>
  );
} 