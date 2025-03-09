import React, { useState } from "react";
import { CommentContext } from "./CommentContext";

const ContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [value, setValue] = useState({
    homepost: true,
    replycomment: false,
    replysubcomment: false,
    editcomment:false,
  });

  return (
    <CommentContext.Provider value={{ value, setValue }}>
      {children}
    </CommentContext.Provider>
  );
};

export { ContextProvider };
