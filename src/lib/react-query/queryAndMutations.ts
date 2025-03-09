import { INewPost, INewUser, InfinitePostsResponse, IUpdatePost } from '@/types'
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
    getUserOwnPosts
} from '../appwrite/api'

import { QUERY_KEYS } from './queryKeys'

export const useCreateUserAccount = () => {
    return useMutation({
        mutationFn: (user: INewUser) => createUserAccount(user),
    })
}
export const useSignInAccount = () => {
    return useMutation({
        mutationFn: (user: {
            email: string;
            password: string;
        }) => SignInAccount(user),
    })
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
            if ('\$id' in data) {
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

            const updateComments = (comments: any[]) =>
                comments.map((comment: any) =>
                    comment.$id === commentId ? { ...comment, content: newcontent } : comment
                );

            // 🔥 Ensure fresh cache update
            queryClient.setQueryData([QUERY_KEYS.GET_COMMENTS, postId], (oldData: any) =>
                oldData && Array.isArray(oldData) ? [...updateComments(oldData)] : oldData
            );

            if (parentId) {
                queryClient.setQueryData([QUERY_KEYS.GET_SUBCOMMENTS, parentId], (oldData: any) =>
                    oldData && Array.isArray(oldData) ? [...updateComments(oldData)] : oldData
                );
            }

            console.log('Cache Updated ✅');

            // 🚀 Force refetch to update UI
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


