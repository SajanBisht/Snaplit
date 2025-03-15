import Loader from "@/components/shared/Loader";//comment
import PostStats from "@/components/shared/PostStats";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import { useDeletePostWithComment, useGetPostById } from "@/lib/react-query/queryAndMutations";
import { Link, useNavigate, useParams } from "react-router-dom";

const PostDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const user = useUserContext();
  const { data: post, isPending: isLoadingPost } = useGetPostById(id || "");
  const { mutate: deletePost } = useDeletePostWithComment();
  const handleDeletePost = () => {
    if (post && !("error" in post)) {
      deletePost(post.$id);
    }
    navigate('/');
  };
  if (isLoadingPost) return <div className="mt-10 ml-[50%]"><Loader /></div>;
  if (!post || "error" in post) return <div className="text-red-500">Error loading post</div>;

  const getRelativeTime = (timestamp: string | number | Date) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const timeIntervals = [
      { label: "year", seconds: 31536000 },
      { label: "month", seconds: 2592000 },
      { label: "week", seconds: 604800 },
      { label: "day", seconds: 86400 },
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
      { label: "second", seconds: 1 },
    ];
    for (const interval of timeIntervals) {
      const count = Math.floor(diffInSeconds / interval.seconds);
      if (count >= 1) return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
    }
    return "just now";
  };


  return (
    <div className="flex justify-center p-6 w-full h-fit ml-[20%] ">
      <div className="border text-white rounded-2xl p-6 w-[80%] shadow-lg flex md:flex">
        {/* Post Image */}
        <div className=" flex w-[50%] gap-2">
          <img
            src={post?.imageUrl || "/assets/icons/profile-placeholder.svg"}
            alt="post"
            className="rounded-md h-full w-full  object-cover"
          />
        </div>
        <div className="h-full bg-white opacity-30 w-px mx-2"></div>
        <div className="w-[50%] p-2 ">
          {/* User Info & Actions */}
          <div className="flex items-center justify-between  mt-4">
            {/* Profile Info */}
            <div className="flex items-center gap-3">
              <Link to={`/profile/${post?.creator?.$id}`}>
                <img
                  src={post?.creator?.imageUrl || "/assets/icons/holder.svg"}
                  alt="creator"
                  className="rounded-full w-12 h-12 object-cover"
                />
              </Link>
              <div>
                <p className="text-lg font-semibold">{post?.creator?.name || "Unknown User"}</p>
                <p className="text-gray-400 text-sm">{getRelativeTime(post.$createdAt)}</p>
              </div>
            </div>

            {/* Edit & Delete Buttons */}
            {user.user.id === post.creator.$id && (
              <div className="flex gap-3 items-center">
                <Link to={`/update-post/${post.$id}`}>
                  <img src="/assets/icons/edit.svg" alt="edit" className="w-6" />
                </Link>
                <Button onClick={handleDeletePost} className="p-1">
                  <img src="/assets/icons/delete.svg" alt="delete" className="w-6" />
                </Button>
              </div>
            )}
          </div>

          {/* Divider */}
          <hr className="border-gray-700 my-4" />

          {/* Post Content */}
          <div className="my-2">
            <p className="text-xl">{post.caption}</p>
            <div className="flex gap-2 mt-2 text-sm text-gray-400">
              {post.tags.map((tag: string) => (
                <span key={tag}>#{tag}</span>
              ))}
            </div>
          </div>

          {/* Post Stats */}
          <PostStats post={post} userId={user.user.id} />
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
