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
  $id: string; // Add this line
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
import { Key } from 'readline';

export type InfinitePostsResponse = {
  pages: unknown;
  documents: Models.Document[];
};

export type CommentType = {
  $id: string;
  postId: string;
  userId: string;
  content: string;
  likes: string[]; // or `number` depending on how you're storing it
  parentCommentId?: string;
  $createdAt: string;
  $updatedAt: string;
}



// Used when creating a new reel (form submission + upload)
export type INewReel = {
  userId: string;
  caption: string;
  videoId: string; // You might want to make this optional if generated inside the function
  videoUrl: string;
  file: File[]; // Typing the file correctly
  thumbnailUrl?: string;
  tags?: string[]; // Already split into array before DB insert
  location?: string;
  audio?: string;
  duration?: number;
};

// Used when retrieving a reel from the database
export type IReel = {
  file: unknown;
  $id?: string; // Appwrite document ID (optional for type safety)
  userId: string;
  caption: string;
  videoId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  tags?: string[]; // Stored in DB as array
  location?: string;
  audio?: string;
  duration?: number;
  likes: string[]; // array of userIds
  views: number;
  comments: number;
  createdAt: string;
};

// Used for infinite scroll pagination
export type InfiniteReelsResponse = {
  pages: unknown; // Replace with actual pagination structure if needed
  documents: IReel[];
};

//User Fetch
export type IUserFetch = {
  $id: Key | null | undefined;
  accountid:string
  id: string;
  name: string;
  username: string;
  email: string;
  imageUrl: string;
  bio: string;
};
