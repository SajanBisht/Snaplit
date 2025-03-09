import { Models } from 'appwrite'//comment
import Loader from './Loader'
import GridPostList from './GridPostList'

type SearchResultsProps = {
  searchPosts: { pages: { documents: Models.Document[] }[] } | undefined
  isSearchFetching: boolean
}

const SearchResult = ({ searchPosts, isSearchFetching }: SearchResultsProps) => {
  if (isSearchFetching) {
    return <div><Loader /></div>
  }

  // Extract documents safely
  const posts = searchPosts?.pages?.flatMap(page => page.documents) || []

  if (posts.length > 0) {
    return <GridPostList posts={posts} />
  }

  console.log('searchPosts', searchPosts)

  return (
    <p className='text-gray-400'>No Result found</p>
  )
}

export default SearchResult
