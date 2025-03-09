import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useUserContext } from "@/context/AuthContext";
import Emoji from "./Emoji";

interface CommentInputProps {
  postId: string;
  parentCommentId?: string; // Optional for replies
  userId: string;
  action:string;
  onCommentSubmit: (content: string, parentId?: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ postId, parentCommentId, userId, onCommentSubmit,action }) => {
  const { user } = useUserContext();
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim() === "") return;
    onCommentSubmit(content, parentCommentId);
    setContent(""); // Clear input after submitting
  };

  return (
    <div className="flex items-center w-full  bg-[#181818] border-t border-gray-700 z-[1100] ">
      <div className="flex items-center gap-3 w-[95%] mx-auto">
        {/* User Avatar */}
        <img
          src={user.imageUrl ? user.imageUrl : "/assets/icons/holder.svg"}
          alt="User Avatar"
          className="w-10 h-10 rounded-full"
        />

        {/* Textarea Field */}
        <Emoji onSelect={(emoji) => setContent((prev) => prev + emoji)} />
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 p-2 bg-[#222] text-white rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-gray-500"
          rows={2} // Initial height
        />

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg w-[80px]"
        >
          {action === 'Edit' ? 'Edit' : action === 'Reply' ? 'Reply' : 'Post'}
        </Button>
      </div>
    </div>
  );
};

export default CommentInput;
