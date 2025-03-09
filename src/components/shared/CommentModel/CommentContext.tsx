
import React, { createContext } from "react";

interface CommentContextType {
  value: {
    homepost: boolean;
    replycomment: boolean;
    replysubcomment: boolean;
    editcomment:boolean;
  };
  setValue: React.Dispatch<React.SetStateAction<{
    homepost: boolean;
    replycomment: boolean;
    replysubcomment: boolean;
    editcomment:boolean;
  }>>;
}

// Create Context with default value
const CommentContext = createContext<CommentContextType | null>(null);

export { CommentContext };

