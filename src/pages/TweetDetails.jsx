// src/pages/TweetDetails.jsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { get, api } from "../services/api"; // Assuming your tweet API calls are through this 'api' service
import { useState, useEffect } from "react";
import TweetCard from "../components/TweetCard";
import ProgressModal from "../components/ProgressModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import EditTweetModal from "../components/EditTweetModal";
import { Button } from "../components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export default function TweetDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { tweetId } = useParams(); // Get tweet ID from URL

  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressModalTitle, setProgressModalTitle] = useState("");
  const [progressModalDescription, setProgressModalDescription] = useState("");
  const [progressModalVariant, setProgressModalVariant] = useState("loading");

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  // Fetch single tweet details
  const {
    data: tweetResponse,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["tweet", tweetId],
    queryFn: async () => {
      const res = await get(`/tweet/${tweetId}`); // API to get single tweet
      return res.data;
    },
    enabled: !!tweetId && !!user,
  });

  // Normalize tweet object
  const tweet = tweetResponse?.tweet || tweetResponse || {}; // Adjust based on exact API response structure
  const isOwner = user && tweet.owner && user._id === tweet.owner?._id;

  // --- MUTATIONS ---

  const deleteTweetMutation = useMutation({
    mutationFn: () => api.delete(`/tweet/${tweetId}`),
    onMutate: () => {
      setShowDeleteConfirm(false);
      setShowProgressModal(true);
      setProgressModalTitle("Deleting Post...");
      setProgressModalDescription(
        "This post is being permanently removed."
      );
      setProgressModalVariant("loading");
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["tweet", tweetId]);
      queryClient.invalidateQueries(["tweets", user?.username]); // Invalidate profile tweets
      setShowProgressModal(true);
      setProgressModalTitle("Success!");
      setProgressModalDescription("Post deleted successfully!");
      setProgressModalVariant("success");
      setTimeout(() => {
        setShowProgressModal(false);
        navigate(`/profile?tab=posts`); // Redirect back to profile posts
      }, 2000);
    },
    onError: (err) => {
      setShowProgressModal(true);
      setProgressModalTitle("Error!");
      setProgressModalDescription(
        err?.response?.data?.message || "Failed to delete post."
      );
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Delete post failed:", err);
    },
  });

  const updateTweetMutation = useMutation({
    mutationFn: (data) => api.patch(`/tweet/${tweetId}`, { content: data.content }),
    onMutate: () => {
      setShowEditModal(false);
      setShowProgressModal(true);
      setProgressModalTitle("Updating Post...");
      setProgressModalDescription("Saving changes to your post.");
      setProgressModalVariant("loading");
    },
    onSuccess: (res) => {
      queryClient.setQueryData(["tweet", tweetId], res.data); // Update cache for this tweet
      queryClient.invalidateQueries(["tweets", user?.username]); // Invalidate profile tweets
      setShowProgressModal(true);
      setProgressModalTitle("Success!");
      setProgressModalDescription("Post updated successfully!");
      setProgressModalVariant("success");
      setTimeout(() => setShowProgressModal(false), 2000);
    },
    onError: (err) => {
      setShowProgressModal(true);
      setProgressModalTitle("Error!");
      setProgressModalDescription(
        err?.response?.data?.message || "Failed to update post."
      );
      setProgressModalVariant("error");
      setTimeout(() => setShowProgressModal(false), 3000);
      console.error("Update post failed:", err);
    },
  });

  // --- Render Logic ---
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl text-muted-foreground">
        Loading post...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive text-xl mt-20">
        Error loading post: {error?.message || "Post not found or access denied."}
      </div>
    );
  }

  if (!tweet._id) {
    return (
      <div className="text-center text-muted-foreground text-xl mt-20">
        Post not found.
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-xl mx-auto px-4 sm:px-0">
        <div className="flex items-center justify-between gap-4 bg-background z-40 sticky top-0 py-4 border-b border-border">
          <h1 className="text-2xl font-bold text-card-foreground">Post Details</h1>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" onClick={() => setShowEditModal(true)}>
                <Pencil className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>

        <div className="mt-4">
          <TweetCard tweet={tweet} className="p-4" /> {/* Display the tweet */}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => deleteTweetMutation.mutate()}
        isLoading={deleteTweetMutation.isLoading}
        title="Delete Post"
        description={`Are you sure you want to delete this post? This action cannot be undone and the post will be permanently removed.`}
        confirmText="Delete"
      />

      {/* Edit Tweet Modal */}
      {tweet && (
        <EditTweetModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          tweet={tweet}
          onSubmit={(data) => updateTweetMutation.mutate(data)}
          isLoading={updateTweetMutation.isLoading}
          error={updateTweetMutation.isError ? (updateTweetMutation.error?.response?.data?.message || "Failed to update tweet.") : ""}
        />
      )}

      {/* Progress/Status Modal */}
      <ProgressModal
        open={showProgressModal}
        title={progressModalTitle}
        description={progressModalDescription}
        variant={progressModalVariant}
      />
    </div>
  );
}