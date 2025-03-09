import { useDeleteSavedPost, useGetCurrentUser, useLikePost, useSavePost } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import CommentModal from "./CommentModel/CommentModal";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
  toggleComment?: () => void; // ✅ Make it optional
};

const PostStats = ({ post, userId, toggleComment }: PostStatsProps) => {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const likedList: string[] = post.likes.map((user: Models.Document) => user.$id);
  const [likes, setLikes] = useState<string[]>(likedList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost, isPending: isSavingPost } = useSavePost();
  const { mutate: deleteSavedPost, isPending: isDeletingSavedPost } = useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();

  const isPostSaved = currentUser?.save?.some((record: Models.Document) => record.post?.$id === post?.$id) || false;

  useEffect(() => {
    setIsSaved(isPostSaved);
  }, [currentUser, isPostSaved]);

  const handleSavedPost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const savedPostRecord = currentUser?.save?.find((record: Models.Document) => record.post.$id === post.$id);

    if (isSaved) {
      setIsSaved(false);
      if (savedPostRecord) deleteSavedPost(savedPostRecord.$id);
    } else {
      setIsSaved(true);
      savePost({ postId: post.$id, userId });
    }
  };

  const handleLikedPost = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const updatedLikes = likes.includes(userId)
      ? likes.filter((id) => id !== userId)
      : [...likes, userId];

    setLikes(updatedLikes);
    likePost({ postId: post.$id, likedArray: updatedLikes });
  };

  return (
    <div className="flex justify-between items-center w-full">
      {/* Like */}
      <div className="flex items-center gap-3">
        <img
          src={likes.includes(userId) ? "/assets/icons/liked.svg" : "/assets/icons/like.svg"}
          alt="like"
          width={20}
          height={20}
          onClick={handleLikedPost}
          className="cursor-pointer"
        />
        <p>{likes.length}</p>
      </div>

      {/* Comment */}
      <div>
        <img
          src="/assets/icons/chat.svg"
          alt="comment"
          width={20}
          height={20}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleComment ? toggleComment() : setIsCommentOpen(true);
          }}
          className="cursor-pointer"
        />
      </div>

      {/* Share */}
      <div className="flex items-center gap-3">
        <img src="/assets/icons/share.svg" alt="share" width={20} height={20} className="cursor-pointer" />
        <p>0</p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        {(isSavingPost || isDeletingSavedPost) ? (
          <Loader />
        ) : (
          <img
            src={isSaved ? "/assets/icons/saved.svg" : "/assets/icons/save.svg"}
            alt="save"
            width={20}
            height={20}
            onClick={handleSavedPost}
            className="cursor-pointer"
          />
        )}
      </div>

      {/* Modal */}
      {isCommentOpen && <CommentModal postId={post.$id} isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} />}
    </div>
  );
};


export default PostStats;
