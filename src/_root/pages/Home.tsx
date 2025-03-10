import Loader from "@/components/shared/Loader";//comment
import PostCard from "@/components/shared/PostCard";
import StoriesCarousel from "@/components/shared/StoriesCarousel";
import { useGetRecentPosts } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";

const Home = () => {
  const { data: posts, isPending: isPostLoading } = useGetRecentPosts();
  console.log('home posts',posts)
  console.log('isPostLoading',isPostLoading)
  return (
    <div className="flex  min-h-screen flex-col w-full ml-[35%]">
      <div className="home-container ">
        <div className="home-posts w-[70%]">
          <div className="w-[80%] my-4"><StoriesCarousel/></div>

          {isPostLoading && !posts ? (
            <div className="flex mt-[10%] ml-[50%] w-full">
              <Loader />
            </div>
          ) : (
            <ul className="flex flex-col gap-9 ">
              {posts  && posts?.documents.map((post: Models.Document) => (
                 <PostCard key={post.$id} post={post} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
