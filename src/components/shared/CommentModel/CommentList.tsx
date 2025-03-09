
import { useDeleteComment, useFetchComments, useGetCurrentUser, useGetPostById, useGetUsers, useHandleCommentSubmit, useLikeComment, useAddSubComment } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import Loader from "./../Loader";
import PostCard from "./../PostCard";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import Subcomments from "./Subcomments";
import CommentInput from "./../CommentModel/CommentInput";
import { useContext, useEffect, useState } from "react";
import Dropdown from "./Dropdown";
import { CommentContext } from "./../CommentModel/CommentContext";

interface CommentListProps {
    postId: string;
}

const CommentList: React.FC<CommentListProps> = ({ postId }) => {
    const { mutate: handleCommentSubmit } = useHandleCommentSubmit();
    const { data: currentUser } = useGetCurrentUser();
    const { data: comments, isLoading, error } = useFetchComments(postId);
    const { data: post } = useGetPostById(postId);
    console.log('post in commentList', postId)
    console.log('comments in commentList', comments);

    // Extract unique userIds from comments
    const userIdArray = Array.from(
        new Set((comments ?? []).map(comment => comment.userId?.trim()).filter(Boolean))
    );

    // Fetch user data
    const userQueries = useGetUsers(userIdArray);
    const userData = userQueries?.data ?? [];

    // Create a lookup map of userId -> imageUrl
    const userImageMap = userData.reduce((acc, user) => {
        acc[user.$id] = user.imageUrl || "/assets/icons/holder.svg"; // Default if no imageUrl
        return acc;
    }, {} as Record<string, string>);
    const userNameMap = userData.reduce((name, user) => {
        name[user.$id] = user.name || "User"; // Default if no Name
        return name;
    }, {} as Record<string, string>);

    // console.log('User Image Map:', userImageMap);
    const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
    const { mutate: deleteComments } = useDeleteComment();

    const handleDeleteReply = (commentId: string) => {
        setDeletingCommentId(commentId);
        deleteComments(commentId, {
            onSuccess: () => setDeletingCommentId(null),
            onError: () => setDeletingCommentId(null)
        });
    };

    //Add like to comment
    const { mutate: addLikeToComment, isPending: isliking } = useLikeComment();
    const [likes, setLikes] = useState<Record<string, Set<string>>>({});

    useEffect(() => {
        if (comments) {
            const newLikes: Record<string, Set<string>> = {};
            comments.forEach((comment: Models.Document) => {
                newLikes[comment.$id] = new Set(comment?.likes ?? []);
            });
            setLikes(newLikes);
        }
    }, [comments]);

    const [likedCommentId, setlikedCommentId] = useState('')
    console.log('like array in commentmodel', likes)

    console.log('commentid like in commentmodel', likedCommentId)

    const handleLikedComment = (commentId: string) => (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser?.$id) return;

        setlikedCommentId(commentId);

        setLikes((prevLikes) => {
            const newLikes = { ...prevLikes };
            if (!newLikes[commentId]) {
                newLikes[commentId] = new Set();
            }
            const likedUsers = newLikes[commentId];
            if (likedUsers.has(currentUser.$id)) {
                likedUsers.delete(currentUser.$id);
            } else {
                likedUsers.add(currentUser.$id);
            }
            addLikeToComment({ commentId, likedCommentArray: Array.from(likedUsers) });
            return newLikes;
        });
    };

    //post reply section
    const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});

    const toggleShowReplyInput = (commentId: string) => {
        setShowReplyInput((prev) => {
            const updatedState: Record<string, boolean> = {};

            // Set all subcomments to false except the clicked one (toggle it)
            Object.keys(prev).forEach((id) => {
                updatedState[id] = false; // Set all other IDs to false
            });

            // Toggle only the clicked one
            updatedState[commentId] = !prev[commentId];

            return updatedState;
        });
    };

    //add reply comment
    const { mutate: addComment } = useAddSubComment();
    const handleReply = (content: string, parentId?: string) => {
        if (!content.trim()) return;

        addComment(
            { content, parentId, postId, userId: currentUser?.$id || "" },
            {
                onSuccess: () => {
                    console.log("Reply added!");
                    setShowReplyInput((prev) => ({ ...prev, [parentId || '']: false })); // Hide input after reply
                }
            }
        );
    };

    //more section
    const [showMoreMap, setShowMoreMap] = useState<Record<string, boolean>>({});

    const toggleShowMore = (commentId: string) => {
        setShowMoreMap(prev => ({
            ...prev,
            [commentId]: !prev[commentId], // Toggle only for the clicked comment
        }));
    };

    //editing comment section
    const [isEditing] = useState(false);
   

    //context use
    const context = useContext(CommentContext);

    if (!context) {
        return <p>Error:Comment Context not found</p>;
    }

    const { value, setValue } = context;
    console.log(value);
    console.log(setValue);

    return (
        <div className="w-full flex z-[1150] ">
            {/* Comments List */}
            <div className="w-full flex">
                <div className="w-[50%] sticky h-[300px] top-0 hidden md:block">
                    {post && !('error' in post) && <PostCard key={postId} post={post} toggleComment={() => {}} />}
                </div>
                <div className="md:w-[50%] w-full ml-4">
                    {isLoading && <Loader />}
                    {error && <p className="text-red-500">Error loading comments.</p>}
                    <ul>
                        {comments && comments.map((comment: Models.Document) => (
                            <li key={comment.$id} className="p-2 border-b">
                                <div className="flex items-start gap-3">
                                    <Link to={`/profile/${comment.userId}`}>
                                        <img
                                            src={userImageMap[comment.userId] || "/assets/icons/holder.svg"}
                                            alt="Avatar"
                                            className="w-8 h-8 rounded-full"
                                        />
                                    </Link>
                                    <div className="w-[100%]">
                                        <div className="flex items-center justify-between gap-4 w-full">
                                            <div className=" ">
                                                <p className="font-semibold">{userNameMap[comment.userId]}</p>
                                                <span className="text-gray-500 text-xs flex items-center gap-1">
                                                    <span>•</span>{formatDistanceToNow(new Date(comment.$createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {/* Show Loader only for the comment being deleted */}
                                            {deletingCommentId === comment.$id ? (
                                                <div>
                                                    <Loader />
                                                </div>
                                            ) : (
                                                currentUser?.$id === comment.userId && (
                                                    <div className="cursor-pointer">
                                                        {/* Show Loader only for the comment being deleted */}
                                                        {deletingCommentId === comment.$id ? (
                                                            <Loader />
                                                        ) : (
                                                            currentUser?.$id === comment.userId && (
                                                                <div className="z-30">
                                                                    <Dropdown
                                                                        handleDeleteReply={handleDeleteReply}
                                                                        comment={comment}
                                                                        parentId={''}
                                                                        postId={postId}
                                                                        isEditingValue={isEditing}
                                                                    />
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                )
                                            )}
                                        </div>
                                        <p className="text-gray-400">{comment.content}</p>

                                        <div className="flex">
                                            {/* Show Loader only for the comment being liked */}
                                            {isliking && comment.$id === likedCommentId ? (
                                                <Loader />
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src=
                                                        {
                                                            likes[comment.$id]?.has(currentUser?.$id || "") ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"
                                                        }

                                                        alt="like"
                                                        width={20}
                                                        height={20}
                                                        onClick={handleLikedComment(comment.$id)}
                                                        className="cursor-pointer"
                                                    />

                                                    <p>{likes[comment.$id]?.size || 0}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-start items-center gap-6 mt-1">
                                    {/* Show Reply Button */}
                                    <div onClick={() => {
                                        toggleShowReplyInput(comment.$id)
                                        setValue((prev) => ({ ...prev, homepost: false, replycomment: true, replysubcomment: false,editcomment:false }));
                                    }} className="cursor-pointer">
                                        <span className="text-gray-400">{ !showReplyInput[comment.$id] ? "Reply" : "Close"}</span>
                                    </div>

                                    <div onClick={() => toggleShowMore(comment.$id)} className="cursor-pointer">
                                        <span className="text-gray-400">{showMoreMap[comment.$id] ? "Hide replies" : "View replies"}</span>
                                    </div>
                                </div>

                                {showReplyInput[comment.$id] && value.replycomment && (
                                    <div className="fixed bottom-0 left-0 w-full z-[1200] gap-4 mt-1 py-2 ml-4">
                                        <CommentInput
                                            postId={postId}
                                            action="Reply"
                                            userId={comment.userId}
                                            onCommentSubmit={(content) => handleReply(content, comment.$id)}
                                        />
                                    </div>
                                )}

                                {showMoreMap[comment.$id] && <div className="my-4">
                                    <Subcomments parentId={comment.$id} postId={postId} comment={{
                                        $id: comment.$id,
                                        postId: postId,
                                        userId: comment.userId,
                                        content: comment.content,
                                        likes: comment.likes ?? [],
                                        $createdAt: comment.$createdAt,
                                        $updatedAt: comment.$updatedAt
                                    }} />
                                    {comments && <div className="text-gray-300 my-2 ml-4">No more Reply</div>}</div>}
                            </li>
                        ))}
                    </ul>
                    <div className=" md:h-[180px] item-center flex justify-center"><p className="text-gray-200">No more comments</p></div>
                </div>
            </div>
            {/* Comment Input */}
             <div className="fixed w-full bottom-0 z-[1100]">
                <CommentInput
                    action="post"
                    postId={postId}
                    userId={currentUser?.id}
                    onCommentSubmit={(content, parentId) =>
                        handleCommentSubmit({
                            postId: postId,
                            userId: currentUser?.$id || "",
                            content,
                            parentId,
                        },
                            {
                                onSuccess: () => {
                                    console.log("Reply added!");
                                    setShowReplyInput((prev) => ({ ...prev, [parentId || '']: false })); // Hide input after reply
                                }
                            })
                    }
                />
                <div className="bg-[#181818] h-2"></div>
            </div>
        </div>
    );
};

export default CommentList;


