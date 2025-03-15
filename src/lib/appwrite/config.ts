import { Client, Account, Databases, Storage, Avatars } from 'appwrite';

export const appwriteConfig = {
    url: import.meta.env.VITE_APPWRITE_URL,
    projectId: import.meta.env.VITE_APPWRITE_PROJECT_ID,
    mediastorageId: import.meta.env.VITE_APPWRITE_MEDIA_STORAGE_ID, 
    videostorageId: import.meta.env.VITE_APPWRITE_VIDEO_STORAGE_ID, 
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USER_COLLECTION_ID,
    postCollectionId: import.meta.env.VITE_APPWRITE_POST_COLLECTION_ID,
    savesCollectionId: import.meta.env.VITE_APPWRITE_SAVES_COLLECTION_ID,
    commentsCollectionId: import.meta.env.VITE_APPWRITE_Comments_COLLECTION_ID,
    reelsCollectionId: import.meta.env.VITE_APPWRITE_Reels_COLLECTION_ID,
    followersCollectionId: import.meta.env.VITE_APPWRITE_Followers_COLLECTION_ID,
};

// Initialize client **with endpoint and project set**
export const client = new Client()
    .setEndpoint(appwriteConfig.url) 
    .setProject(appwriteConfig.projectId);
   

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
