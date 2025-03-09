import GridPostList from "@/components/shared/GridPostList";//comment
import Loader from "@/components/shared/Loader";
import SearchResult from "@/components/shared/SearchResult";
import { useGetInfinitePosts, useSearchPosts } from "@/lib/react-query/queryAndMutations";
import { Search } from "lucide-react";
import  { useState,useEffect } from "react";
import {useInView} from 'react-intersection-observer';

const Explore = () => {
  const { ref, inView} = useInView();
  const [searchValue, setSearchValue] = useState("");

  // Fetch posts
  const { data: searchPosts, isFetching: isSearchFetching } = useSearchPosts(searchValue);
  const {  data: posts, fetchNextPage, hasNextPage } = useGetInfinitePosts(); 

  const shouldShowSearchResult = searchValue.length > 0;
  const shouldShowPost = !shouldShowSearchResult && posts?.pages?.every(page => page.documents.length === 0);

  console.log('post of explore',posts)
  useEffect(() => {
   if(inView && !searchValue){
    fetchNextPage();
   }
  }, [inView,searchValue])
  
  if (!posts) {
    return <div className="flex mt-10 ml-[50%]"><Loader /></div>;
  }

  return (
    <div className="Explore-container container mx-auto flex flex-col w-[90%] xl:w-[70%] ml-[35%]">
      {/* Search Input Section */}
      <div className="explore-inner-container w-[90%] xl:w-[70%] mt-8">
        <h2 className="text-2xl xl:text-3xl mb-1">Search Post</h2>
        <div className="flex items-center gap-2 px-3 bg-[#3d3d3d] rounded-xl py-2">
          <Search className="text-white" size={20} />
          <input
            type="text"
            placeholder="Search Post"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none text-white"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Popular Posts Section */}
      <div className="flex flex-col mt-4 w-[90%] xl:w-[70%]">
        <div className="flex w-full justify-between items-center">
          <h3 className="font-bold text-lg">Popular Today</h3>
          <div className="flex items-center bg-[#3d3d3d] rounded-md px-3 py-1">
            <p className="text-white text-sm font-bold">ALL</p>
            <img
              src="/assets/icons/filter.svg"
              alt="Filter"
              width={20}
              height={20}
              className="invert ml-2"
            />
          </div>
        </div>

        {/* Conditional Rendering for Search Results & No Posts */}
        <div className="mt-4 gap-4 h-auto mx-auto w-full">
          {shouldShowSearchResult ? (
            <SearchResult searchPosts={searchPosts} isSearchFetching={isSearchFetching}/>
          ) : shouldShowPost ? (
            <div className="text-gray-400">End of posts</div>
          ) : (
            posts.pages.map((page, index) => (
              <GridPostList key={index} posts={page.documents} />
            ))
          )}
        </div>
      </div>
      {hasNextPage && !searchValue && (
        <div ref={ref} className="flex justify-center mt-4">
          <Loader />
        </div>)}
    </div>
  );
};

export default Explore;
