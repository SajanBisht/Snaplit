
import { useContext, useEffect, useState } from "react";
import { useAddSubComment, useDeleteComment, useGetCurrentUser, useGetSubcomments, useGetUsers, useLikeComment } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import Loader from "@/components/shared/Loader";
import { formatDistanceToNow } from "date-fns";
import CommentInput from "./CommentInput";
import { Link } from "react-router-dom";
import Dropdown from "./Dropdown";
import { CommentContext } from "./CommentContext";

interface SubcommentsProps {
  parentId: string; // Parent comment ID
  postId: string; // Post ID
  comment: { userId: string }; // Parent comment object
}

const Subcomments = ({ parentId, postId, comment }: SubcommentsProps) => {
  const { data: subcomments, isPending, isError } = useGetSubcomments(parentId);
  const { mutate: addComment, isPending: isAdding } = useAddSubComment();
  const { data: currentUser } = useGetCurrentUser();
 
  const handleReply = (content: string, parentId?: string) => {
    if (!content.trim()) return;

    addComment(
      { content, parentId, postId, userId: currentUser?.$id || "" },
      {
        onSuccess: () => {
          console.log("Reply added!");
          setShowReplyInput(false); // Hide input after reply
        }
      }
    );
  };
  const { mutate: deleteComments, isPending: deleteCommentsLoading } = useDeleteComment();
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
  // Extract unique userIds from comments
  const userIdArray = Array.from(
    new Set((Array.isArray(subcomments?.data) ? subcomments.data : []).map(subcomment => subcomment.userId?.trim()).filter(Boolean))
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
    name[user.$id] = user.name || "/assets/icons/holder.svg"; // Default if no imageUrl
    return name;
  }, {} as Record<string, string>);

  const handleDeleteReply = (subcommentId: string) => {
    setDeletingCommentId(subcommentId); // Set loading state for this comment
    deleteComments(subcommentId, {
      onSuccess: () => setDeletingCommentId(null), // Reset state after deletion
      onError: () => setDeletingCommentId(null) // Reset state on error
    });
  }

  //Add like to subcomment
  const { mutate: addLikeToComment, isPending: isliking } = useLikeComment();
  const [likes, setLikes] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    if (subcomments?.data && Array.isArray(subcomments.data)) {
      const newLikes: Record<string, Set<string>> = {};
      subcomments.data.forEach((subcomment: Models.Document) => {
        newLikes[subcomment.$id] = new Set(subcomment?.likes ?? []);
      });
      setLikes(newLikes);
    }
  }, [subcomments]);


  console.log('like array in commentmodel', likes)
  const [likedCommentId, setlikedCommentId] = useState('')
  console.log('commentid like in commentmodel', likedCommentId)

  const handleLikedComment = (subcommentId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser?.$id) return;

    setlikedCommentId(subcommentId);

    setLikes((prevLikes) => {
      const newLikes = { ...prevLikes };
      if (!newLikes[subcommentId]) {
        newLikes[subcommentId] = new Set();
      }
      const likedUsers = newLikes[subcommentId];
      if (likedUsers.has(currentUser.$id)) {
        likedUsers.delete(currentUser.$id);
      } else {
        likedUsers.add(currentUser.$id);
      }
      addLikeToComment({ commentId: subcommentId, likedCommentArray: Array.from(likedUsers) });
      return newLikes;
    });
  };

  //editing comment section
  const [isEditing, setIsEditing] = useState(false);
  const handleEditReply = () => {
    setIsEditing(true);
    console.log("Editing comment");
  }

  //post reply section
   // State to track if the reply input should be shown
  const [showReplyInput, setShowReplyInput] = useState<Record<string, boolean>>({});

  const toggleShowReplyInput = (subcommentId: string) => {
    setShowReplyInput((prev) => {
      const updatedState: Record<string, boolean> = {};
  
      // Set all subcomments to false except the clicked one (toggle it)
      Object.keys(prev).forEach((id) => {
        updatedState[id] = false; // Set all other IDs to false
      });
  
      // Toggle only the clicked one
      updatedState[subcommentId] = !prev[subcommentId];
  
      return updatedState;
    });
  };  

  //context use
  const context = useContext(CommentContext);
    
  if (!context) {
      return <p>Error:Comment Context not found</p>;
  }

  const { value, setValue } = context;
  console.log(value);
  console.log(setValue);
  
  return (
    <div className="mt-3 space-y-2 z-[800]">
      {/* Show Loader while fetching */}
      {isPending && <Loader />}
      {isError && <p className="text-red-500">Failed to load replies.</p>}
      {/* Render Subcomments */}
      {subcomments?.data?.map((subcomment: Models.Document) => (
        <div key={subcomment.$id} className="pl-6 border-l-2 border-gray-300">
          <div className="flex-col gap-3">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Link to={`/profile/${subcomment.userId}`}>
                  <img
                    src={userImageMap[subcomment.userId] || "/assets/icons/holder.svg"}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
                <p>{userNameMap[subcomment.userId]}</p>
              </div>


              {/* Show Loader only for the comment being deleted */}
              {deletingCommentId === subcomment.$id ? (
                <div>
                  <Loader />
                </div>
              ) : (
                currentUser?.$id === subcomment.userId && (
                  <div className="cursor-pointer">
                    {/* Show Loader only for the comment being deleted */}
                    {deletingCommentId === subcomment.$id ? (
                      <Loader />
                    ) : (
                      currentUser?.$id === subcomment.userId && (
                        <div className="z-30 ">
                          <Dropdown
                            handleDeleteReply={handleDeleteReply}
                            comment={subcomment}
                            parentId={parentId}
                            postId={postId}
                            isEditingValue={isEditing}
                            handleEditReply={handleEditReply}
                          />
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div>

            <div className="ml-10">
              <span className="text-gray-500 text-xs flex items-center gap-1">
                <span>•</span>{formatDistanceToNow(new Date(subcomment.$createdAt), { addSuffix: true })}
              </span>
              <p className="text-gray-400">{subcomment.content}</p>
              <div className="flex">
                {/* Show Loader only for the comment being liked */}
                {isliking && subcomment.$id === likedCommentId ? (
                  <Loader />
                ) : (
                  <div className="flex items-center gap-3">
                    <img
                      src=
                      {
                        likes[subcomment.$id]?.has(currentUser?.$id) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"
                      }

                      alt="like"
                      width={20}
                      height={20}
                      onClick={handleLikedComment(subcomment.$id)}
                      className="cursor-pointer"
                    />

                    <p>{likes[subcomment.$id]?.size || 0}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Show Reply Button */}
            <div onClick={() => {toggleShowReplyInput(subcomment.$id);
             setValue((prev) => ({ ...prev, homepost: false,replycomment:false,replysubcomment:true,editcomment:false }));
            }} className="cursor-pointer">
              <span className="text-gray-400">{!showReplyInput[subcomment.$id] ? "Reply" : "Close"}</span>
            </div>

          {/* Recursive Subcomments */}
          <Subcomments parentId={subcomment.$id} postId={postId} comment={comment} />

          {/* Show Comment Input if reply button is clicked */}
          {showReplyInput[subcomment.$id] && value.replysubcomment && (
            <div className="fixed bottom-0 gap-4 z-[1200] w-full py-2 left-0  bg-blue-500">
              <CommentInput
                action="Reply"
                postId={postId}
                userId={comment.userId}
                onCommentSubmit={(content) => handleReply(content, parentId)}
              />
            </div>
          )}
        </div>
      ))}

    </div>
  );
};

export default Subcomments;
