import Loader from "@/components/shared/Loader";//comment
import PostCard from "@/components/shared/PostCard";
import StoriesCarousel from "@/components/shared/StoriesCarousel";
import UserInfo from "@/components/shared/UserInfo";
import { useUserContext } from "@/context/AuthContext";
import { useGetRecentPosts } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { checkAuthUser } = useUserContext();
  useEffect(() => {
    if (!checkAuthUser) navigate("/sign-in");
  }, [checkAuthUser, navigate]);
  
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();

  return (
    <div className="flex  min-h-screen flex-col w-full">
      <div className="home-posts contain-content md:ml-[25%]">
        <div className="my-4 flex gap-6 md:w-[90%] ">
          <div className=" md:w-[70%] "><StoriesCarousel /></div>
          <div className=" md:w-[20%]"><UserInfo /></div>
        </div>
        <div className="w-full md:w-[80%] md:ml-[3%]">
          {isPostLoading && !posts ? (
            <div className="flex mt-[10%] ml-[50%] w-full">
              <Loader />
            </div>
          ) : (
            <ul className="flex flex-col gap-1 ">
              {posts && 'documents' in posts && posts.documents.map((post: Models.Document) => (
                <div className="md:w-[55%] w-full" key={post.$id}>
                  <PostCard  post={post}  />
                </div>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
