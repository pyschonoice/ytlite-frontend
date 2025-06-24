import { useInfiniteQuery } from "@tanstack/react-query";
import { get } from "../services/api";
import VideoCard from "../components/VideoCard";

export default function Home() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["videos"],
    queryFn: ({ pageParam = 1 }) => get(`/video/?page=${pageParam}&limit=20`),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.data?.totalPages > allPages.length) {
        return allPages.length + 1;
      }
      return undefined;
    },
  });

  const videos = data?.pages?.flatMap((page) => page.data?.videos || page.data || []) || [];

  return (
    <div className="py-8 px-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-card-foreground">All Videos</h1>
      {isLoading && <div className="text-muted-foreground">Loading videos...</div>}
      {isError && <div className="text-destructive">Failed to load videos.</div>}
      <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
        {videos.map((video) => (
          <VideoCard key={video._id} video={video} fixedSize />
        ))}
      </div>
      {hasNextPage && (
        <div className="flex justify-center mt-12">
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isFetchingNextPage ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
} 