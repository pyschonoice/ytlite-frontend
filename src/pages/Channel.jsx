import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { get } from "../services/api";

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

export default function Channel() {
  const { username } = useParams();
  const { data: channelData, isLoading: loadingChannel, isError: errorChannel } = useQuery({
    queryKey: ["channel", username],
    queryFn: () => get(`/user/c/${username}`),
    enabled: !!username,
  });
  const { data: videosData, isLoading: loadingVideos, isError: errorVideos } = useQuery({
    queryKey: ["channelVideos", username],
    queryFn: () => get(`/dashboard/videos/${channelData?.data?._id}`),
    enabled: !!channelData?.data?._id,
  });

  if (loadingChannel) return <div className="text-muted-foreground">Loading channel...</div>;
  if (errorChannel || !channelData?.data) return <div className="text-destructive">Channel not found.</div>;

  const channel = channelData.data;
  const videos = videosData?.data || [];

  return (
    <div className="py-4">
      <div className="relative mb-8">
        {channel.coverImage?.url && (
          <img
            src={channel.coverImage.url}
            alt="Cover"
            className="w-full h-40 sm:h-56 md:h-64 object-cover rounded-lg border border-border"
          />
        )}
        <div className="flex items-center gap-4 mt-[-2.5rem] px-4">
          <img
            src={channel.avatar?.url}
            alt={channel.fullName}
            className="w-20 h-20 rounded-full object-cover border-4 border-card shadow-lg"
          />
          <div>
            <div className="font-bold text-xl text-card-foreground">{channel.fullName || channel.username}</div>
            <div className="text-muted-foreground text-sm">@{channel.username}</div>
          </div>
          <button className="ml-auto bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Subscribe
          </button>
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-4 text-card-foreground">Videos</h2>
      {loadingVideos && <div className="text-muted-foreground">Loading videos...</div>}
      {errorVideos && <div className="text-destructive">Failed to load videos.</div>}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} />
        ))}
      </div>
    </div>
  );
} 