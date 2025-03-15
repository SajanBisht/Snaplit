import { useUserContext } from "@/context/AuthContext";
import Loader from "./Loader";
import { useUserSavedPosts } from "@/lib/react-query/queryAndMutations";
import UserPosts from "./UserPosts";
import { Models } from "appwrite";

const SavedCards = () => {
    const { user: user } = useUserContext();
    console.log("user in saved card", user); 
    const userId = typeof user?.id === 'string' ? user?.id : '';
    const { data: posts,isPending:isPostLoading,isError:isErrorPosts} = useUserSavedPosts(userId);
    console.log("saved document", posts)
    
    return (
        <div className="flex min-h-screen flex-col w-full">
            <div className="home-container w-full px-2 mb-8 ">
                <div className="home-posts w-full flex-col">
                    {isPostLoading && (
                        <div className="flex ml-[60%] mt-10">
                            <Loader />
                        </div>
                    )}
                    {isErrorPosts && (
                        <div className="text-red-500 text-center mt-4">Failed to load posts. Please try again.</div>
                    )}
                </div>

                {Array.isArray(posts) && posts.length > 0 ? (
                    <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 w-full items-center justify-items-center ">
                        {posts.map((post: Models.Document) => (
                            <div key={post.$id}><UserPosts  post={post} /></div>
                        ))}
                    </ul>
                ) : (
                    !isPostLoading &&
                    !isErrorPosts &&
                    Array.isArray(posts) &&
                    posts.length === 0 && (
                        <p className="text-center text-white mt-4">No Saved posts found.</p>
                    )
                )}
            </div>
        </div>
    );
}
export default SavedCards