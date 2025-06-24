import Avatar from "./ui/Avatar";
import AvatarSkeleton from "./ui/AvatarSkeleton";

export default function ProfileBanner({
  channel,
  userDataLoading,
  subscribersCount,
  videosCount,
  rightContent, // Subscribe button or edit profile
  children, // For any additional content below the main info
}) {
  return (
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
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 px-6 relative z-10">
        {userDataLoading ? (
          <AvatarSkeleton size="xl" className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl bg-background" style={{ marginTop: '-4rem', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }} />
        ) : (
          <Avatar
            user={channel}
            size="xl"
            className="w-32 h-32 rounded-full object-cover border-4 border-background shadow-xl bg-background"
            style={{ marginTop: '-4rem', boxShadow: '0 4px 32px rgba(0,0,0,0.15)' }}
          />
        )}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
          <div>
            <div className="flex items-center gap-2 text-3xl font-bold text-card-foreground">
              {channel?.fullName || channel?.username}
            </div>
            <div className="text-muted-foreground text-lg font-medium">@{channel?.username}</div>
            <div className="text-muted-foreground text-sm mt-1">{subscribersCount} subscribers • {videosCount} videos</div>
            {children}
          </div>
          <div className="flex flex-col sm:items-end sm:ml-auto mt-4 sm:mt-0">
            {rightContent}
          </div>
        </div>
      </div>
    </div>
  );
}