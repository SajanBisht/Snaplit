import { INewPost, INewUser, InfinitePostsResponse, IReel, IUpdatePost } from '@/types'
import {
    useQuery,
    useMutation,
    useQueryClient,
    useInfiniteQuery,
} from '@tanstack/react-query'
import {
    addLikeToComment, addSubComment, createPost, createUserAccount, deleteComments, deletePost,
    deleteSavePost, fetchComments, fetchSubcomments, getCurrentAccount, getInfinitePosts, getPostById, getRecentPosts,
    getUsersByIds, handleCommentSubmit, likedPost, savePost, searchPosts,
    SignInAccount, SignOutAccount, updatePost, updateComment,
    deletePostWithComments,
    getUserOwnPosts,
    getUserSavedPosts,
    saveReelsInDatabase,
    getReelsFromDB,
    getUserWithThisUsername,
    followOthers,
    userFollowing,
    userFollowers,
    unFollowOthers
} from '../appwrite/api'

import { QUERY_KEYS } from './queryKeys'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user),
    })
}

export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: { email: string; password: string }) => SignInAccount(user),
        onError: (error: Error) => {
            // Global error handling for the mutation
            console.error("Mutation Error:", error);
            // You can also display a toast here if needed
        },
        onSuccess: (data) => {
            // You can handle success here, for example:
            console.log("Sign-in successful", data);
        },
    });
}

export const useSignOutAccount = () => {
    return useMutation({
        mutationFn: () => SignOutAccount(),
    })
}

export const useCreatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: INewPost) => createPost(post),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}

export const useGetRecentPosts = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_RECENT_POSTS],
        queryFn: getRecentPosts,
    })
}

export const useLikePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, likedArray }: { postId: string; likedArray: string[] }) => likedPost(postId, likedArray),
        onSuccess: (data) => {
            if ('$id' in data) {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.GET_POST_BY_ID, data.$id]
                })
            }
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useSavePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, userId }: { postId: string; userId: string }) => savePost(postId, userId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useDeleteSavedPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (savedRecordId: string) => deleteSavePost(savedRecordId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POSTS]
            })
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_CURRENT_USER]
            })
        }
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_CURRENT_USER],
        queryFn: getCurrentAccount,
    })
}

export const useGetPostById = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_POST_BY_ID, postId],
        queryFn: () => getPostById(postId),
        enabled: !!postId
    })
}

export const useUpdatePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (post: IUpdatePost) => updatePost(post),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_POST_BY_ID, data?.$id]
            })
        }
    })
}

export const useDeletePost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ postId, imageId }: { postId: string, imageId: string }) => deletePost(postId, imageId),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            })
        }
    })
}


export const useGetInfinitePosts = () => {
    return useInfiniteQuery<InfinitePostsResponse, Error, InfinitePostsResponse, [string], string>({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS],
        queryFn: ({ pageParam }) => getInfinitePosts({ pageParam }), // Now typed as string
        getNextPageParam: (lastPage) => {
            if (
                typeof lastPage === 'object' &&
                lastPage !== null &&
                'documents' in lastPage &&
                Array.isArray(lastPage.documents) &&
                lastPage.documents.length > 0
            ) {
                const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
                return lastId;
            }

            return null;
        },
        initialPageParam: '0',
    });
};



export const useSearchPosts = (searchTerm: string) => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_INFINITE_POSTS, searchTerm],
        queryFn: ({ pageParam = '' }) => searchPosts(searchTerm, pageParam),
        enabled: !!searchTerm,
        getNextPageParam: (lastPage) => {
            if (
                typeof lastPage === 'object' &&
                lastPage !== null &&
                'documents' in lastPage &&
                Array.isArray(lastPage.documents) &&
                lastPage.documents.length > 0
            ) {
                const lastId = lastPage.documents[lastPage.documents.length - 1].$id;
                return lastId;
            }

            return null;
        },
        initialPageParam: '',
    });
};



export const useHandleCommentSubmit = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            postId,
            userId,
            content,
            parentId,
        }: {
            postId: string;
            userId: string;
            content: string;
            parentId?: string; // Optional parentId
        }) =>
            handleCommentSubmit({
                postId,
                userId,
                content,
                parentId,
            }),

        onSuccess: () => {
            // Invalidate and refetch comments after submission
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_COMMENTS],
            });
        },
    });
};

export const useFetchComments = (postId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_COMMENTS, postId], // Cache by postId
        queryFn: () => fetchComments(postId),
    });
};

export const useGetUsers = (userIdArray: string[] | undefined) => {
    const userIds = userIdArray ?? [];

    return useQuery({
        queryKey: [QUERY_KEYS.GET_USERS_BY_IDS, userIds], // Query key includes all user IDs
        queryFn: () => getUsersByIds(userIds), // Fetch all users in one request
        enabled: userIds.length > 0, // Only enable query if there are user IDs
    });
};

export const useDeleteComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteComments,
        onSuccess: (response, commentId) => {
            console.log("Comment Deleted Successfully:", response); // ✅ Response from deleteComments
            console.log("Deleted Comment ID:", commentId);

            // Invalidate comments query to refetch updated comments
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COMMENTS] });
            // Invalidate subcomments query to update nested replies
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SUBCOMMENTS] });
        },
        onError: (error) => {
            console.error("Error deleting comment:", error);
        },
    });
};

export const useAddSubComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (comment: { content: string; parentId?: string; postId: string; userId: string }) =>
            addSubComment(comment),

        onSettled: (_data, _error, variables) => {
            if (variables.parentId) {
                // If it's a subcomment, refresh subcomments query
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SUBCOMMENTS, variables.parentId] });
            } else {
                // Otherwise, refresh top-level comments
                queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SUBCOMMENTS, variables.postId] });
            }
        },
    });
};


export const useGetSubcomments = (parentId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_SUBCOMMENTS, parentId], // Use a unique key for subcomments
        queryFn: () => fetchSubcomments(parentId), // Fetch only subcomments
        enabled: !!parentId // Prevents the query from running if parentId is missing
    });
};


export const useLikeComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, likedCommentArray }: { commentId: string; likedCommentArray: string[] }) =>
            addLikeToComment({ commentId, likedCommentArray }), // Now passing an object

        onSuccess: (data) => {
            if ('$id' in data) {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.ADD_LIKE_TO_COMMENT]
                });
            }
        }
    });
};

export const useUpdateComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ commentId, newcontent, parentId, postId }: {
            commentId: string;
            newcontent: string;
            parentId: string;
            postId: string;
        }) => updateComment({ commentId, newcontent, parentId, postId } as { commentId: string; newcontent: string; parentId: string; postId: string }),

        onSuccess: (_, { commentId, newcontent, parentId, postId }) => {
            console.log("Updating cache for post:", postId, "Comment ID:", commentId);

            const updateComments = (comments: unknown[]) =>
                comments.map((comment: unknown) =>
                    typeof comment === 'object' && comment !== null && (comment as { $id: string; [key: string]: unknown }).$id === commentId ? { ...comment, content: newcontent } : comment
                );

            //  Ensure fresh cache update
            queryClient.setQueryData([QUERY_KEYS.GET_COMMENTS, postId], (oldData: unknown) =>
                oldData && Array.isArray(oldData) ? [...updateComments(oldData)] : oldData
            );

            if (parentId) {
                queryClient.setQueryData([QUERY_KEYS.GET_SUBCOMMENTS, parentId], (oldData: unknown) =>
                    oldData && Array.isArray(oldData) ? [...updateComments(oldData)] : oldData
                );
            }

            console.log('Cache Updated ');

            //  Force refetch to update UI
            queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_COMMENTS, postId] });
            if (parentId) queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.GET_SUBCOMMENTS, parentId] });
        },

        onError: (error) => {
            console.error("Error updating comment:", error);
            alert("Failed to update comment. Please try again!");
        },
    });
};


export const useDeletePostWithComment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (postId: string) => deletePostWithComments(postId), // Corrected property name
        onSuccess: () => {
            // Invalidate or refetch posts after deletion
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.GET_RECENT_POSTS]
            });
        },
    });
};


//User Posts
export const useGetUserPosts = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_OWN_POSTS, userId], // Include userId in query key
        queryFn: () => getUserOwnPosts(userId), // Pass userId correctly as a function
        enabled: !!userId, // Prevents execution if userId is not available
    });
};


export const useUserSavedPosts = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_SAVED_POSTS, userId], // Include userId in query key
        queryFn: () => getUserSavedPosts(userId), // Pass userId correctly as a function
        enabled: !!userId, // Prevents execution if userId is not available
    });
}

//Save Reels
export const useSaveReelsInDatabase = () => {

    return useMutation({
        mutationFn: (file: IReel) => saveReelsInDatabase(file),
        onSuccess: () => {
            // Optional: Invalidate to refresh reel-related queries after saving
            // queryClient.invalidateQueries({
            //   queryKey: [QUERY_KEYS.GET_RECENT_REELS],
            // });
        },
        onError: (error) => {
            console.error("Failed to save reel:", error);
        },
    });
};

//Not a function of query&Mutation just calculate time
export const getRelativeTime = (timestamp: string | number | Date) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    const timeIntervals = [
        { label: "year", seconds: 31536000 },
        { label: "month", seconds: 2592000 },
        { label: "week", seconds: 604800 },
        { label: "day", seconds: 86400 },
        { label: "hour", seconds: 3600 },
        { label: "minute", seconds: 60 },
        { label: "second", seconds: 1 },
    ];

    for (const interval of timeIntervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count} ${interval.label}${count !== 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
};

//Get Reels
export const useGetPaginatedReels = () => {
    return useInfiniteQuery({
        queryKey: [QUERY_KEYS.GET_REELS_FROM_DB],
        queryFn: ({ pageParam }: { pageParam?: string }) => getReelsFromDB({ pageParam }),
        initialPageParam: undefined, // 🔥 Required for strict TS types
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });
};

//search user by username

export const useGetUserWithThisUsername = (username: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_BY_USERNAME, username],
        queryFn: () => getUserWithThisUsername(username),
        enabled: !!username, // Ensures the query runs only if a username is provided
    });
};


//follow others
export const useFollowOthers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            followerId,
            followingId,
        }: {
            followerId: string;
            followingId: string;
        }) => followOthers({ followerId, followingId }),
        onSuccess: () => {
            // Refetch relevant queries after follow
            queryClient.invalidateQueries({ queryKey: ["getUserFollowers"] });
            queryClient.invalidateQueries({ queryKey: ["getUserFollowing"] });
        },
    });
};

//user Follower who follows our user 
export const useUserFollowers = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWERS, userId],
        queryFn: () => userFollowers(userId),
        enabled: !!userId, // only run if userId is truthy
    });
};

//user Following who our user follows 
export const useUserFollowing = (userId: string) => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_USER_FOLLOWING, userId],
        queryFn: () => userFollowing(userId),
        enabled: !!userId,
    });
};

export const useUnFollowOthers = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            followerId,
            followingId,
        }: {
            followerId: string;
            followingId: string;
        }) => unFollowOthers({ followerId, followingId }),

        onSuccess: () => {
            // Refetch relevant queries after unfollow
            queryClient.invalidateQueries({ queryKey: ["getUserFollowers"] });
            queryClient.invalidateQueries({ queryKey: ["getUserFollowing"] });
        },

        onError: (error) => {
            console.error("Unfollow failed:", error);
        },
    });
};