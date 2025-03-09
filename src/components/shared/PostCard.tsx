import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import PostStats from './PostStats';

type PostCardProps = {
    post: Models.Document;
};

// Custom function to get relative time
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
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
};

const PostCard = ({ post,toggleComment }: PostCardProps) => {
    const { user } = useUserContext();
    if (!post.creator) return null;

    return (
        <div className="post-card p-4 border rounded-lg shadow-md w-full m-2">
            <div className="flex justify-between items-center w-full">
                <div className="flex items-center gap-3 w-full">
                    {/* Profile Link */}
                    <Link to={`/profile/${post?.creator?.$id}`}>
                        <img
                            src={post?.creator?.imageUrl || '/assets/icons/holder.svg'}
                            alt="creator"
                            className="rounded-full w-12 h-12 object-cover"
                        />
                    </Link>

                    {/* User Info */}
                    <div className="flex flex-col">
                        <div className="flex justify-evenly items-center gap-10">
                            <p className="text-lg font-semibold">{post?.creator?.name || "Unknown User"}</p>
                            <p className="text-gray-400 text-[14px]">{new Date(post.$createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-sm text-gray-500 flex gap-2">
                            {/* Human-readable relative time */}
                            <p>{getRelativeTime(post.$createdAt)}</p>
                            <span>•</span>
                            <p>{post?.location || "Unknown Location"}</p>
                        </div>
                    </div>
                </div>

                {/* Edit Post Link */}
                <Link to={`/update-post/${post.$id}`} className={`${user.id !== post.creator.$id && 'hidden'}`}>
                    <img src="/assets/icons/edit.svg" alt="edit" />
                </Link>
            </div>
            <Link to={`/posts/${post.$id}`}>
                <div className=''>
                    <p>{post.caption}</p>
                    <ul  className='flex gap-1 mt-2'>
                        {post.tags.map((tag:string)=>(
                            <li key={tag} className='text-gray-400'>
                                #{tag}
                            </li>
                        ))}
                    </ul>
                </div>
                <img src={post.imageUrl ||"/assets/icons/profile-placeholder.svg"} alt="post image" className='rounded-xl mb-2 w-[50%] h-[250px]'/>
            </Link>
            <PostStats post={post} userId={user.id} toggleComment={toggleComment}/>
        </div>
    )
};

export default PostCard;
