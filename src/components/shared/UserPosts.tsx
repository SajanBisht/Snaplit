import { Models } from "appwrite";
import { Link } from "react-router-dom";

type PostCardProps = {
  post: Models.Document;
};

const UserPosts = ({ post }: PostCardProps) => {
  if (!post?.creator) return null;

  return (
    <div className="user-post-card relative overflow-hidden p-2  border border-gray-200 rounded-xl shadow-md w-full 
    max-w-[350px]  transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.03] hover:border-gray-700 group cursor-pointer">
      <Link to={`/posts/${post.$id}`} className="block relative">
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={post.caption || "User post"}
          className="rounded-xl w-full h-[350px] object-cover group-hover:opacity-95 group-hover:scale-105 transition-all duration-300 ease-in-out "
        />

        {/* Caption on hover */}
        {post.caption && (
          <div className="absolute bottom-1  text-white text-sm font-medium
       bg-black bg-opacity-50 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full">
            {post.caption}
          </div>
        )}
      </Link>
    </div>

  );
};

export default UserPosts;
