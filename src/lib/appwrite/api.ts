import { ID, Query } from 'appwrite';
import { account, avatars, databases, appwriteConfig, storage } from '../appwrite/config';
import { INewPost, INewUser, InfinitePostsResponse, IReel, IUpdatePost } from '../../types/index';
import { toast } from '@/hooks/use-toast';


// Checking whether username is already taken
export const isUsernameAvailable = async (username: string) => {
    try {
        const res = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("username", username)]
        );

        return res.total === 0; // Available if no matches
    } catch (err) {
        console.error("Error checking username availability:", err);
        return false; // Fail safe: assume not available
    }
};


export async function createUserAccount(user: INewUser) {
    try {

        const { name, email, password, username } = user;

        // Create a new account
        const newAccount = await account.create(ID.unique(), email, password, name);
        // console.log(newAccount)
        if (!newAccount) throw new Error('Account creation failed');

        // Generate avatar
        const avatarUrl = avatars.getInitials(name);
        // console.log(avatarUrl)
        // Save user to DB
        const newUser = await saveUserToDB({
            name: newAccount.name,
            email: newAccount.email,
            username,
            imageUrl: avatarUrl,
            accountId: newAccount.$id
        });
        // // console.log('in createAccount' + newUser)
        return newUser;
    } catch (error) {
        // console.error(error + 'createUserAccount');
        return { error: (error as Error).message };
    }
}

export async function saveUserToDB(user: {
    name: string,
    email: string,
    username: string,
    imageUrl: string,
    accountId: string // Make sure it's correctly named
}) {
    try {
        // console.log(user)
        const newUser = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(), // Generates a unique document ID
            {
                name: user.name,
                email: user.email,
                username: user.username,
                imageUrl: user.imageUrl,
                accountid: user.accountId // Ensure this matches exactly with Appwrite schema
            }
        );
        // // console.log(newUser)
        // // console.log("User saved to database");
        return newUser;
    } catch (error) {
        // console.error(error + ' in saveUserToDB');
        return { error: (error as Error).message };
    }
}

export async function SignInAccount(user: { email: string, password: string }) {
    try {
        const { email, password } = user;
        console.log("Attempting to sign in:", user);

        // 🔹 Check for existing sessions
        try {
            const sessions = await account.listSessions();
            if (sessions.sessions.length > 0) {
                console.log("Existing session found. Deleting...");
                await account.deleteSessions(); // Delete all sessions before signing in
            }
        } catch (error) {
            console.error("Error listing sessions:", error);
        }

        // 🔹 Now create a new session
        const session = await account.createEmailPasswordSession(email, password);
        console.log("Session created:", session);

        return session;
    } catch (error) {
        console.error("SignInAccount Error:", error);

        // Check for rate-limiting error
        if ((error as Error).message.includes("rate limit")) {
            throw new Error("Too many attempts. Please try again later.");
        }

        throw new Error("Failed to sign in. Please check your credentials.");
    }
}



export const SignOutAccount = async () => {
    try {
        let document = null;
        try {
            document = await getCurrentAccount();
        } catch {
            console.warn("No session found — probably already signed out.");
        }

        if (!document) return;

        await account.deleteSession('current');
        console.log("Signed out successfully");

        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');

        // Reset global state if using context
        // setUser(null);
        // setIsAuthenticated(false);

        toast({
            title: "Successfully logged out!",
            description: "We hope to see you again soon.",
            variant: "sucsess", // if your toast system supports variants
        });

    } catch (error: unknown) {
        const appwriteError = error as { type?: string; message: string };
        if (appwriteError.type === "AppwriteException" && appwriteError.message.includes("missing scope")) {
            console.warn("Tried to sign out when already signed out (guest). Ignoring.");
        } else {
            console.error("Error signing out:", error);
        }
    }
};



export async function getCurrentAccount() {
    try {
        console.log(" Checking for active session...");

        // Step 1: Try getting the session
        const session = await account.getSession('current');
        console.log(" Active session found:", session);

        // Step 2: Get account details
        const currentAccount = await account.get();
        console.log(" Current Account:", currentAccount);

        // Step 3: Fetch user from database
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountid", currentAccount.$id)]
        );

        if (!currentUser || currentUser.documents.length === 0) {
            throw new Error(" User not found in database.");
        }

        console.log("📄 User retrieved from database:", currentUser.documents[0]);
        return currentUser.documents[0];

    } catch (error: any) {
        console.error(" Error in getCurrentAccount:", error.message);

        if (error.message?.includes("missing scope (account)")) {
            console.warn(" User is not logged in. Returning null.");
        }

        return null;
    }
}



export async function createPost(post: INewPost) {
    try {
        // console.log("Starting post creation with data:", post);

        if (!post.file || post.file.length === 0) {
            throw new Error("No file provided for upload");
        }

        const uploadedFile = await uploadFile(post.file[0]);
        if (!uploadedFile) throw new Error("File upload failed");

        const fileUrl = getFilePreview(uploadedFile.$id);
        if (!fileUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to generate file preview URL");
        }

        const tags = post.tags?.split(',').map(tag => tag.trim()) || [];

        // console.log("User ID:", post.userId);
        if (!post.userId) throw new Error("Missing user ID for post creation.");

        const documentData = {
            creator: post.userId,
            caption: post.caption,
            imageUrl: fileUrl,
            imageid: uploadedFile.$id,
            location: post.location,
            tags: tags,
        };

        // console.log("Creating document with data:", documentData);

        const newPost = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            ID.unique(),
            documentData
        );

        if (!newPost) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to create post in database");
        }

        // console.log(" Post created successfully:", newPost);
        return newPost;
    } catch (error) {
        console.error("Error in createPost:", error);
        return { error: (error as Error).message };
    }
}


export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.mediastorageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.error("Error in uploadFile: " + error);
        return null;
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(appwriteConfig.mediastorageId, fileId);
        return fileUrl;
    } catch (error) {
        console.error("Error in getFilePreview: " + error);
        return null;
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.mediastorageId, fileId);
        return { status: "Ok" };
    } catch (error) {
        // console.error("Error in deleteFile: " + error);
        return { error: (error as Error).message };
    }
}

export async function getRecentPosts() {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(20)]
        )
        if (!posts) throw new Error("Failed to fetch posts");
        return posts;
    } catch (error) {
        // console.error("Error in getRecentPosts: " + error);
        return { error: (error as Error).message };
    }
}



export async function savePost(postId: string, userId: string) {
    try {
        const post = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            ID.unique(),
            {
                post: postId,
                users: userId
            }
        );
        if (!post) throw new Error("Failed to like post");
        // console.log("Saved Successfully")
        return post;
    } catch (error) {
        // console.error("Error in likedPost: " + error);
        return { error: (error as Error).message };
    }
}

export async function deleteSavePost(savedRecordId: string) {
    try {
        const statusCode = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            savedRecordId,
        );
        if (!statusCode) throw new Error("Failed to delete post");
        return statusCode;
    } catch (error) {
        // console.error("Error in deleteSavedPost: " + error);
        return { error: (error as Error).message };
    }
}

export async function likedPost(postId: string, likedArray: string[]) {
    try {
        // console.log('array', likedArray);

        //  Pass likes array directly (no extra wrapping object)
        const post = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId,
            {
                likes: likedArray, // Correct way to update an array field
            }
        );

        if (!post) throw new Error("Failed to like post");
        return post;
    } catch (error) {
        // console.error("Error in likedPost: " + error);
        return { error: (error as Error).message };
    }
}

export async function getPostById(postId: string) {
    try {
        const post = await databases.getDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );
        if (!post) throw new Error("Failed to fetch post");
        return post;
    } catch (error) {
        // console.error("Error in getPostById: " + error);
        return { error: (error as Error).message };
    }
}



export async function updatePost(post: IUpdatePost) {
    const hasFileToUpdate = post.file?.length > 0;

    try {
        let image = {
            imageUrl: post.imageUrl,
            imageid: post.imageId,
        };

        if (hasFileToUpdate) {
            // Upload image to storage
            const uploadedFile: any = await uploadFile(post.file[0]);
            if (!uploadedFile) throw new Error("Failed to upload file");

            // Get file URL
            const fileUrl = getFilePreview(uploadedFile?.$id);
            if (!fileUrl) {
                await deleteFile(uploadedFile.$id); // Delete uploaded file if URL generation fails
                throw new Error("Failed to generate file preview URL");
            }

            // Update image details
            image = { ...image, imageUrl: fileUrl, imageid: uploadedFile.$id };
        }

        // Update the post in the database
        const updatedPost = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            post.postId,
            {
                caption: post.caption,
                location: post.location,
                tags: Array.isArray(post.tags) ? post.tags : post.tags?.split(',').map(tag => tag.trim()) || [],
                imageUrl: image.imageUrl,
                imageid: image.imageid
            }
        );

        if (!updatedPost) {
            if (hasFileToUpdate) await deletePost(post.postId, image.imageid); // Delete uploaded file if post update fails
            throw new Error("Failed to update post in the database");
        }

        // console.log("✅ Post updated successfully:", updatedPost);
        return updatedPost;

    } catch (error) {
        console.error("Error in updatePost:", error);
        return null;
    }
}

export async function deletePost(postId: string, imageId: string) {
    try {
        // Delete post document from database
        const post = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );
        if (!post) throw new Error("Failed to delete post");

        // Delete associated image file from storage
        if (imageId) {
            await deleteFile(imageId);
        }

        // console.log("✅ Post and associated image deleted successfully");
        return post;
    } catch (error) {
        // console.error("Error in deletePost: " + error);
        return { error: (error as Error).message };
    }
}



export const getInfinitePosts = async ({ pageParam }: { pageParam: string }): Promise<InfinitePostsResponse> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.orderDesc('$createdAt'), Query.limit(10), Query.cursorAfter(pageParam)]
        );
        return { pages: response.documents.length, documents: response.documents };
    } catch (error) {
        console.error('Error fetching posts:', error);
        return { pages: null, documents: [] };
    }
};


export const searchPosts = async (searchTerm: string, pageParam: string): Promise<InfinitePostsResponse> => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [
                Query.search('caption', searchTerm),
                Query.limit(10),
                ...(pageParam ? [Query.cursorAfter(pageParam)] : []),
            ]
        );
        return { pages: response.documents.length, documents: response.documents };
    } catch (error) {
        console.error('Error searching posts:', error);
        return { pages: null, documents: [] };
    }
};




export const handleCommentSubmit = async ({
    postId,
    userId,
    content,
    parentId = "",
}: {
    postId: string;
    userId: string;
    content: string;
    parentId?: string; // Optional parentId for replies
}) => {
    if (!userId) {
        // console.warn("Unauthenticated user tried to submit a comment.");
        return;
    }

    if (!content.trim()) {
        // console.warn("Empty comment submission blocked.");
        return;
    }

    // eslint-disable-next-line no-useless-catch
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId, // Your comments collection ID
            ID.unique(), // Auto-generated ID
            {
                postId,
                userId,
                content,
                likes: [], // Default empty likes array
                parentCommentId: parentId || null, // Ensure null if not a reply
            }
        );
        // console.log(" Comment added successfully:", response);
        return response; // Return the created comment for further use
    } catch (error) {
        // console.error(" Error adding comment:", error);
        throw error; // Allow handling in UI/mutations
    }
};


export const fetchComments = async (postId: string) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            [
                Query.equal("postId", postId), // Fetch comments for this post
                Query.isNull("parentCommentId"), // Check for empty string instead of null
                Query.orderDesc("$createdAt"), // Order by newest first
            ]
        );

        return response.documents;
    }
    catch (error) {
        console.error(`Error fetching user with ID :`, error);
        return null;
    }
}



export const getUsersByIds = async (userIds: string[]) => {
    try {
        const uniqueUserIds = [...new Set(userIds.map(String).map(id => id.trim()))]; // Ensure clean strings
        // console.log('Unique userIds in getUsersByIds:', uniqueUserIds);

        if (uniqueUserIds.length === 0) return [];

        // Fetch each document individually using getDocument
        const userPromises = uniqueUserIds.map(id =>
            databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.userCollectionId,
                id
            ).catch(() => {
                // console.error(`Error fetching user with ID ${id}:`, error);
                return null; // Prevent the function from failing
            })
        );

        const users = await Promise.all(userPromises);

        // Remove any null responses (failed fetches)
        const validUsers = users.filter(user => user !== null);
        // console.log("Users response:", validUsers);
        return validUsers;
    } catch (error) {
        console.error("Error fetching users by IDs:", error);
        return [];
    }
};

export const deleteComments = async (commentId: string) => {
    try {
        const response = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            commentId
        );
        console.log(" Comment Deleted Successfully", response);
        console.log('commentId in deletecomment', commentId)
        return commentId; // Return the response if needed
    } catch (error) {
        console.error(" Error deleting comment:", error);
        throw new Error((error as Error).message); // Throw error instead of returning it
    }
};

export const addSubComment = async (comment: {
    userId: string;
    content: string;
    parentId?: string;
    postId: string;
}) => {
    try {
        const commentData: Record<string, any> = {
            postId: comment.postId,
            userId: comment.userId,
            content: comment.content,
            likes: [],
        };

        if (comment.parentId) {
            commentData.parentCommentId = comment.parentId; // Only include if it exists
        }

        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            ID.unique(),
            commentData
        );

        console.log("Response in addSubComment:", response); //  Log before returning
        return response;
    } catch (error) {
        console.error("Error in addSubComment:", error);
        return { error: (error as Error).message };
    }
};

export const fetchSubcomments = async (parentId: string) => {
    if (!parentId) {
        console.warn("fetchSubcomments called with an invalid parentId");
        return { error: "Invalid parent ID", data: [] };
    }

    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            [
                Query.equal("parentCommentId", parentId), // Fetch only subcomments
                Query.orderAsc("$createdAt"), // Oldest first
            ]
        );

        return { data: response.documents };
    } catch (error) {
        console.error("Error fetching subcomments:", (error as Error).message);
        return { error: (error as Error).message, data: [] };
    }
};

export const addLikeToComment = async ({ commentId, likedCommentArray }: { commentId: string; likedCommentArray: string[] }) => {
    try {
        const updatedComment = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            commentId,
            { likes: likedCommentArray } // Ensure correct field update
        );

        if (!updatedComment) throw new Error("Failed to like comment");
        return updatedComment;
    } catch (error) {
        return { error: (error as Error).message };
    }
};

export async function updateComment({
    commentId,
    newcontent,
}: {
    commentId: string;
    newcontent: string;
}) {
    try {
        console.log('commentId of comment to be updated', commentId)
        console.log('commentId of comment to be updated', newcontent)
        const updatedComment = await databases.updateDocument(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            commentId,
            { content: newcontent }
        );

        if (!updatedComment) throw new Error("Failed to update comment");

        return updatedComment;
    } catch (error) {
        console.error("Error updating comment:", error);
        return null;
    }
}

export const deletePostWithComments = async (postId: string) => {
    try {
        // 1️⃣ Get all comments related to the post
        const commentsResponse = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.commentsCollectionId,
            [Query.equal("postId", postId)] // Filter comments by postId
        );

        const comments = commentsResponse.documents;

        // 2️⃣ Delete each comment
        for (const comment of comments) {
            await databases.deleteDocument(
                appwriteConfig.databaseId,
                appwriteConfig.commentsCollectionId,
                comment.$id // Delete comment by its document ID
            );
            console.log(`Deleted comment: ${comment.$id}`);
        }

        // 3️⃣ Delete the post after all comments are deleted
        const postResponse = await databases.deleteDocument(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            postId
        );
        console.log("Post Deleted Successfully", postResponse);

        return postResponse; // Return post deletion response
    } catch (error) {
        console.error("Error deleting post or comments:", error);
        throw new Error((error as Error).message);
    }
};

//User own posts
export const getUserOwnPosts = async (userId: string) => {
    try {
        console.log("Passed userId from postOf:", userId);

        // Fetch user document
        const document = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountid", userId)] // Filtering by accountid
        );

        console.log("Fetched Documents:", document);

        // Ensure we got a valid document
        if (document.documents.length === 0) {
            console.warn("No user found with this accountid");
            return { posts: [], documentId: null };
        }

        const documentId = document.documents[0].$id; // Extract document ID
        console.log("User Document ID:", documentId);

        // Fetch user's posts
        const allPosts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [Query.equal("creator", documentId)] // Filtering posts by creator
        );

        return { posts: allPosts.documents, documentId }; // Returning an object instead of an array
    } catch (error) {
        console.error("Error in loading user own posts", error);
        return { posts: [], documentId: null }; // Return empty data on error
    }
};


export const getUserSavedPosts = async (userId: string) => {
    try {
        console.log("Passed userId from SavedCard:", userId);

        // Fetch user document
        const document = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.savesCollectionId,
            [Query.equal("users", userId)] // Filtering by accountid
        );

        console.log("Fetched Documents:", document);

        // Ensure we got a valid document
        if (document.documents.length === 0) {
            console.warn("No user found with this accountid");
            return { posts: [], documentId: null };
        }
        const posts = document.documents.map((doc) => doc.post);
        return posts;
    } catch (error) {
        console.error("Error in loading user own posts", error);
        return { posts: [], documentId: null }; // Return empty data on error
    }
}


export const saveReelsInDatabase = async (file: IReel) => {
    try {
        if (!file || !Array.isArray(file.file) || file.file.length === 0) {
            throw new Error("No file provided for upload");
        }

        const uploadedFile = await uploadFileVideo(file.file[0]);
        if (!uploadedFile) throw new Error("File upload failed");

        //  Get actual video URL
        const videoUrl = getFileViewVideo(uploadedFile.$id);

        //  Get image-based thumbnail preview
        const thumbnailUrl = getFilePreviewVideo(uploadedFile.$id);

        // Fallback if either is missing
        if (!videoUrl || !thumbnailUrl) {
            await deleteFile(uploadedFile.$id);
            throw new Error("Failed to generate video URL or thumbnail");
        }

        // Save both in DB
        const document = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.reelsCollectionId,
            ID.unique(),
            {
                userId: file.userId,
                caption: file.caption,
                videoId: uploadedFile.$id,
                videoUrl,       // Actual playable video
                thumbnailUrl,   // Thumbnail preview
                tags: file.tags,
                location: file.location || "",
                audio: file.audio || "",
                duration: file.duration || 0,
                likes: file.likes || [],
                views: file.views || 0,
                comments: file.comments || 0,
            }
        );
        return document;
    } catch (error) {
        console.error("Error saving reel:", error);
        throw error;
    }
};

export async function uploadFileVideo(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.videostorageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        console.error("Error in uploadFile: " + error);
        return null;
    }
}

// For playback
export function getFileViewVideo(fileId: string) {
    try {
        return storage.getFileView(appwriteConfig.videostorageId, fileId);
    } catch (error) {
        console.error("Error in getFileViewVideo: " + error);
        return null;
    }
}

// For thumbnail
export function getFilePreviewVideo(fileId: string) {
    try {
        return storage.getFilePreview(appwriteConfig.videostorageId, fileId);
    } catch (error) {
        console.error("Error in getFilePreview: " + error);
        return null;
    }
}


// lib/appwrite/api.ts
export const getReelsFromDB = async ({ pageParam }: { pageParam?: string }) => {
    const limit = 2;

    try {
        const queries = [
            Query.orderDesc('$createdAt'),
            Query.limit(limit),
        ];

        if (pageParam) {
            queries.push(Query.cursorAfter(pageParam));
        }

        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.reelsCollectionId,
            queries
        );

        return {
            data: response.documents,
            nextPage: response.documents.length === limit
                ? response.documents[response.documents.length - 1].$id
                : undefined,
        };
    } catch (error) {
        console.error("Error in getReelsFromDB:", error);
        throw error;
    }
};



//Finding users with username
export const getUserWithThisUsername = async (username: string) => {
    try {
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('username', username)]
        );

        // Check if any documents were found
        console.log("user with username", response.documents[0])
        if (response.total > 0) {
            return response.documents[0]; // Return the first matching document
        } else {
            return null; // No user found with the given username
        }
    } catch (error) {
        console.error('Error in getUserWithThisUsername:', error);
        throw error;
    }
};

// Follow Others
export const followOthers = async ({
    followerId,
    followingId,
}: {
    followerId: string;
    followingId: string;
}) => {
    try {
        const response = await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.followersCollectionId,
            ID.unique(),
            {
                followerId,
                followingId,
            }
        );
        console.log("Follower added successfully:", response);
        return response;
    } catch (error) {
        console.error("Error adding follower:", error);
        throw error;
    }
};


// Who is following the user (i.e., all docs where followingId = userId)
export const userFollowers = async (userId: string) => {
    try {
        console.log("User Followers Section yaaaaaaaaaaaaaaaaaay",userId)
        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followersCollectionId,
            [Query.equal("followingId", [userId])]
        );
        console.log("User Followers Section yaaaaaaaaaaaaaaaaaay",response.documents)
        return response.documents; // List of people following this user
    } catch (error) {
        console.error("Error fetching followers:", error);
        throw error;
    }
};

// Who the user is following (i.e., all docs where followerId = userId)
export const userFollowing = async (userId: string) => {
    try {
        if (!userId || typeof userId !== "string") {
            throw new Error("Invalid userId passed to userFollowing");
        }

        console.log("userId in userFollowing", userId);

        const response = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.followersCollectionId,
            [Query.equal("followerId", [userId])] //  FIXED here
        );
        const followingIds = response.documents.map(item => item.followingId);
        console.log("followingIds", followingIds); //Array of followingId
        return followingIds;
    } catch (error) {
        console.error("Error fetching following:", error);
        throw error;
    }
};


//Unfollow Others
export const unFollowOthers = async ({
  followerId,
  followingId,
}: {
  followerId: string;
  followingId: string;
}) => {
  try {
    // Step 1: Get the matching document(s)
    const { documents } = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      [
        Query.equal("followerId", followerId),
        Query.equal("followingId", followingId),
      ]
    );

    if (documents.length === 0) {
      throw new Error("No matching follow relationship found.");
    }

    // Step 2: Delete the first matching document
    const documentId = documents[0].$id;
    const response = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.followersCollectionId,
      documentId
    );

    console.log("Follower removed successfully:", response);
    return response;
  } catch (error) {
    console.error("Error removing follower:", error);
    throw error;
  }
};
