import GridPostList from "@/components/shared/GridPostList";
import Loader from "@/components/shared/Loader";
import SearchResult from "@/components/shared/SearchResult";
import { useGetInfinitePosts, useSearchPosts } from "@/lib/react-query/queryAndMutations";
import { Models } from "appwrite";
import { Search } from "lucide-react";
import { useState, useEffect, useCallback, Key } from "react";
import { useInView } from "react-intersection-observer";

const Explore = () => {
  const { ref, inView } = useInView();
  const [searchValue, setSearchValue] = useState("");

  // Fetch posts
  const { data: searchPosts, isFetching: isSearchFetching } = useSearchPosts(searchValue);
  const { data: posts, fetchNextPage, hasNextPage } = useGetInfinitePosts();

  // Determine what to render
  const isSearching = searchValue.length > 0;
  const noPostsToShow =
    !isSearching &&
    Array.isArray(posts?.pages) &&
    posts.pages.every((page) => page.documents.length === 0);

  // Infinite scroll loading
  useEffect(() => {
    if (inView && !isSearching) {
      fetchNextPage();
    }
  }, [inView, isSearching, fetchNextPage]);

  // Search input handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  }, []);

  if (!posts) {
    return <div className="flex mt-10 ml-[50%]"><Loader /></div>;
  }

  return (
    <div className="Explore-container container mx-auto flex flex-col w-[90%] xl:w-[70%] md:ml-[35%]">
      {/* Search Section */}
      <div className="explore-inner-container w-[90%] xl:w-[70%] mt-8">
        <h2 className="text-2xl xl:text-3xl mb-1">Search Post</h2>
        <div className="flex items-center gap-2 px-3 bg-[#3d3d3d] rounded-xl py-2">
          <Search className="text-white" size={20} />
          <input
            type="text"
            placeholder="Search Post"
            className="w-full bg-transparent border-b border-gray-300 focus:outline-none text-white"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Posts Section */}
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

        {/* Conditional content */}
        <div className="mt-4 gap-4 h-auto mx-auto w-full">
          {isSearching ? (
            isSearchFetching ? (
              <Loader />
            ) : (
              <SearchResult searchPosts={searchPosts} isSearchFetching={isSearchFetching} />
            )
          ) : noPostsToShow ? (
            <div className="text-gray-400">End of posts</div>
          ) : (
            (posts.pages as { documents: unknown[] }[]).map((page, index: Key) => (
              <GridPostList key={index} posts={page.documents as Models.Document[]} />
            ))
          )}
        </div>
      </div>

      {/* Infinite scroll loader */}
      {hasNextPage && !isSearching && (
        <div ref={ref} className="flex justify-center mt-4">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
