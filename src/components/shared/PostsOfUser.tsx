import Loader from "@/components/shared/Loader";
import { useUserContext } from "@/context/AuthContext";
import { useGetUserPosts } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import UserPosts from "./UserPosts";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useEffect } from "react";

// Define the prop type
interface PostsOfUserProps {
  userLookup: Models.Document; // Adjust the type according to your data structure
  setPostCount: (count: number) => void; // Fix: Ensure it accepts a number
}

const PostsOfUser: React.FC<PostsOfUserProps> = ({ userLookup ,setPostCount}) => {
  const { user: currentUser } = useUserContext();
  const { data, isPending: isPostLoading, isError: isErrorPosts } = useGetUserPosts(userLookup?.accountid);
  
  console.log("Fetched User Posts:", data?.posts);
  console.log("User Document ID:", data?.documentId);
  
  const posts = data?.posts || [];
  
  useEffect(() => {
    setPostCount(posts.length);
  }, [posts, setPostCount]); // Depend on `posts`
  
  const documentId = data?.documentId;
  const navigate = useNavigate();

  console.log("posts data in postof:", posts);
  console.log("user data in postof:", userLookup);
  console.log("currentuser  of postof", currentUser);
  console.log("currentuser id of postof", currentUser.id);
  console.log("userLookup accountid of postof", userLookup?.accountid);
  console.log("User Document ID from API:", documentId);

  return (
    <div className="flex min-h-screen flex-col w-full">
      <div className="home-container w-full">
        <div className="home-posts w-[80%] flex-col">
          {isPostLoading && (
            <div className="flex ml-[60%] mt-10">
              <Loader />
            </div>
          )}
          {isErrorPosts && (
            <div className="text-red-500 text-center mt-4">Failed to load posts. Please try again.</div>
          )}
        </div>

        {posts.length > 0 ? (
          <ul className="flex gap-9 w-full">
            {posts.map((post: Models.Document) => (
              <UserPosts key={post.$id} post={post} />
            ))}
          </ul>
        ) : (
          !isPostLoading &&
          !isErrorPosts &&
          posts.length === 0 && (
            <p className="text-center text-gray-400 mt-4">No posts found.</p>
          )
        )}
      </div>

      <div className={`w-full flex justify-center mt-6 ${currentUser?.id !== documentId? 'hidden' : ''}`}>
        <div className="flex flex-col items-center text-center gap-y-2">
          <p className="text-3xl">Create Post</p>
          <Button className="my-4" onClick={() => navigate("/create-post")}>
            <div className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center">
              <img src="/assets/images/camera.png" alt="camera" className="w-14 h-14" />
            </div>
          </Button>
          <p className="text-3xl">Share Photos</p>
          <p>When you share photos, they will appear on your profile.</p>
          {posts.length === 0 && (
            <p className="text-blue-500 mt-4">
              <Link to="/create-post">Share your First Post.</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostsOfUser;
