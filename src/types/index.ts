export type INavLink = {
    imgURL: string;
    route: string;
    label: string;
  };
  
  export type IUpdateUser = {
    userId: string;
    name: string;
    bio: string;
    imageId: string;
    imageUrl: URL | string;
    file: File[];
  };
  
  export type INewPost = {
    userId: string;
    caption: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUpdatePost = {
    postId: string;
    caption: string;
    imageId: string;
    imageUrl: string;
    file: File[];
    location?: string;
    tags?: string;
  };
  
  export type IUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    imageUrl: string;
    bio: string;
  };
  
  export type INewUser = {
    name: string;
    email: string;
    username: string;
    password: string;
};
  
import { Models } from 'appwrite';

export type InfinitePostsResponse = {
  pages: unknown;
  documents: Models.Document[];
};

export type CommentType  = {
  $id: string;
  postId: string;
  userId: string;
  content: string;
  likes: string[]; // or `number` depending on how you're storing it
  parentCommentId?: string;
  $createdAt: string;
  $updatedAt: string;
}