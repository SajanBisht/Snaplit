import { Models } from "appwrite";
import { Link } from "react-router-dom";

type PostCardProps = {
  post: Models.Document;
};

const UserPosts = ({ post }: PostCardProps) => {
  if (!post?.creator) return null;

  return (
    <div className="user-post-card p-2 border rounded-xl shadow-md w-[200px] m-2 hover:shadow-lg transition-shadow duration-300">
      <Link to={`/posts/${post.$id}`} className="block">
        <img
          src={post.imageUrl || "/assets/icons/profile-placeholder.svg"}
          alt={post.caption || "User post"}
          className="rounded-xl w-[200px] h-[250px] object-cover"
        />
      </Link>
    </div>
  );
};

export default UserPosts;
