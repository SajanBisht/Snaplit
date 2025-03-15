import { Models } from 'appwrite';
import { Link } from 'react-router-dom';
import { useUserContext } from '@/context/AuthContext';
import PostStats from './PostStats';
import { getRelativeTime } from '@/lib/react-query/queryAndMutations';

type PostCardProps = {
    post: Models.Document;
};

// Custom function to get relative time


const PostCard = ({ post }: PostCardProps) => {
    const { user } = useUserContext();
    if (!post.creator) return null;

    return (
        <div className="post-card md:ml-6 rounded-lg shadow-md  h-full mt-4 p-2">
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
                    <Link to={`/update-post/${post.$id}`} className={`${user.id !== post.creator.$id && 'hidden'} ml-4`}>
                        <img src="/assets/icons/edit.svg" alt="edit" />
                    </Link>
                <img src="/assets/images/3dot-horizontal.png" alt="3 dots " className='invert-75 w-6 h-6' />
            </div>

            <Link to={`/posts/${post.$id}`}>
                <div className='w-full h-[80vh] mt-2  content-center border-1 flex justify-center items-center overflow-clip'>
                    <img src={post.imageUrl || "/assets/icons/profile-placeholder.svg"} alt="post image" className=' mb-2  mt-2  rounded-md ' />
                </div>
            </Link>
            <div className='mt-4'>
                <PostStats post={post} userId={user.id} />
                <p>{post.caption}</p>
                <ul className='flex gap-1'>
                    {post.tags.map((tag: string) => (
                        <li key={tag} className='text-gray-400'>
                            #{tag}
                        </li>
                    ))}
                </ul>
            </div>
            <hr className="bg-white opacity-30 mt-4" />
        </div>
    )
};

export default PostCard;
