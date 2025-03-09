import { ID, Query } from 'appwrite';
import { account, avatars, databases, appwriteConfig, storage } from '../appwrite/config';
import { INewPost, INewUser, IUpdatePost } from '../../types/index';

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
        // console.log("Attempting to sign in:", user);

        // 🔹 Check for existing sessions
        try {
            const sessions = await account.listSessions();
            if (sessions.sessions.length > 0) {
                // console.log("Existing session found. Deleting...");
                await account.deleteSessions(); // Delete all sessions before signing in
            }
        } catch (error) {
            // console.error("Error listing sessions:", error);
        }

        // 🔹 Now create a new session
        const session = await account.createEmailPasswordSession(email, password);
        // // console.log("Session created:", session);

        // // 🔹 Short delay to allow session propagation
        // await new Promise((resolve) => setTimeout(resolve, 500));

        return session;
    } catch (error) {
        // console.error("SignInAccount Error:", error);
        return { error: (error as Error).message };
    }
}

export async function SignOutAccount() {
    try {
        await account.deleteSessions();
        // // console.log("User signed out successfully.");
        return true; // Return true to indicate success
    } catch (error) {
        // console.error("Error signing out:", error);
        return false; // Return false to indicate failure
    }
}

export async function getCurrentAccount() {
    try {
        // // console.log("🔍 Fetching current session...");

        // Check if user has an active session
        const session = await account.getSession('current').catch(() => null);
        if (!session) {
            // console.warn(" No active session found. User might be logged out.");
            return null;
        }
        // // console.log("✅ Active session:", session);

        // Fetch user account details
        const currentAccount = await account.get().catch(() => null);
        if (!currentAccount) {
            throw new Error(" User account not found.");
        }
        // console.log("✅ Current Account Data:", currentAccount);

        // Fetch user data from the database
        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal("accountid", currentAccount.$id)]
        );

        if (!currentUser || currentUser.documents.length === 0) {
            throw new Error(" User not found in database.");
        }

        // console.log("✅ User retrieved from database:", currentUser.documents[0]);
        return currentUser.documents[0];

    } catch (error: any) {
        // console.error(" Error in getCurrentAccount:", error);

        if (error.message.includes("missing scope (account)")) {
            // console.warn(" User is not logged in. Returning null.");
            return null;
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

        // console.log("✅ Post created successfully:", newPost);
        return newPost;
    } catch (error) {
        // console.error("Error in createPost:", error);
        return { error: (error as Error).message };
    }
}

export async function uploadFile(file: File) {
    try {
        const uploadedFile = await storage.createFile(
            appwriteConfig.storageId,
            ID.unique(),
            file
        );
        return uploadedFile;
    } catch (error) {
        // console.error("Error in uploadFile: " + error);
        return null;
    }
}

export function getFilePreview(fileId: string) {
    try {
        const fileUrl = storage.getFilePreview(appwriteConfig.storageId, fileId);
        return fileUrl;
    } catch (error) {
        // console.error("Error in getFilePreview: " + error);
        return null;
    }
}

export async function deleteFile(fileId: string) {
    try {
        await storage.deleteFile(appwriteConfig.storageId, fileId);
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
            const fileUrl = getFilePreview(uploadedFile.$id);
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
        // console.error("Error in updatePost:", error);
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



export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
    try {
        const queries: any[] = [Query.orderDesc('$updatedAt'), Query.limit(10)]
        if (pageParam !== 0) {
            queries.push(Query.cursorAfter(pageParam.toString()))
        }
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            queries
        )
        if (!posts) throw new Error("Failed to fetch posts");
        return posts;
    }
    catch (error) {
        // console.error("Error in getInfinitePost: " + error);
        return { error: (error as Error).message };
    }
}

export async function searchPosts(searchTerm: string) {
    try {
        const posts = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.postCollectionId,
            [
                Query.search("caption", searchTerm),
                Query.search("tags", searchTerm)
            ]
        );
        return posts;
    } catch (error) {
        // console.error("Error in searchPosts:", error);
        return { error: (error as Error).message };
    }
}



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
    } catch (error) {
        return []; // Return an empty array in case of an error
    }
};



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
            ).catch(error => {
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
        // console.error("Error fetching users by IDs:", error);
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
        console.log('commentId in deletecomment',commentId)
        return commentId; // Return the response if needed
    } catch (error) {
        // console.error(" Error deleting comment:", error);
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

        console.log("Response in addSubComment:", response); // ✅ Log before returning
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
        console.log('commentId of comment to be updated',commentId)
        console.log('commentId of comment to be updated',newcontent)
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
  
  export const deletePostWithComments = async ( postId :string) => {
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
  

