
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CommentInput from "./../CommentModel/CommentInput";
import { useContext, useState } from "react";
import { useUpdateComment } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import { CommentContext } from "./../CommentModel/CommentContext";

interface DropdownProps {
    handleDeleteReply: (commentId: string) => void;
    parentId: string;
    postId: string;
    comment: Models.Document;
    isEditingValue: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({ handleDeleteReply, parentId, postId, isEditingValue, comment }) => {
    // Update comment or edit comment section
    const { mutate: updateComment } = useUpdateComment();
    const [isEditing, setIsEditing] = useState(isEditingValue);
    const [newContent, setNewContent] = useState('');

    console.log(newContent);
    const handlePass = (content: string) => {
        setNewContent(content);
    };

    //context use
    const context = useContext(CommentContext);
    
    if (!context) {
        return <p>Error:Comment Context not found</p>;
    }

    const { value, setValue } = context;
    
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger>
                    <img src="/assets/images/three_dot2.png" alt="three dot" className="w-5 h-5 cursor-pointer" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#181818] border border-gray-700 rounded-lg shadow-lg p-2 w-32 z-[1000]">
                    <DropdownMenuItem
                        onClick={() => {setIsEditing(true);
                            setValue((prev) => ({ ...prev, homepost: false, replycomment: false, replysubcomment: false, editcomment:true }));
                        }}
                        className="text-gray-300 hover:bg-gray-700 rounded-md px-3 py-2"
                    >
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => handleDeleteReply(comment.$id)}
                        className="text-red-400 hover:bg-gray-700 rounded-md px-3 py-2"
                    >
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Section */}
            {console.log('value.editcomment',value)}
            {isEditing && value.editcomment &&(
                <div className="fixed bottom-0 gap-4 z-[1200] w-full py-2 left-0 ml-4">
                    <CommentInput
                        postId={postId}
                        userId={comment.userId}
                        action="Edit"
                        onCommentSubmit={(newcontent) => {
                            handlePass(newcontent);
                            updateComment({ commentId: comment.$id, newcontent, parentId, postId });
                            setIsEditing(false); // Hide input after updating
                        }}
                    />
                </div>
            )}
        </>
    );
};

export default Dropdown;
