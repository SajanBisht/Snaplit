
import { Models } from 'appwrite'
import PostCard from './PostCard'
import Loader from './Loader'

type GridPostListProps = {
    posts: Models.Document[];

}
const GridPostList = ({ posts }: GridPostListProps) => {
    console.log('posts of grid post', posts)
    const flag=false;
    return (
        <div>
            {/* <ul className=''>
                {posts.map((post) => (
                    <li key={post.$id} className='min-w-80 h-40'>
                        <Link to={`/post/${post.$id}`} className=''>
                            <img src={post.imageUrl} alt="post" className='w-full h-full' />
                        </Link>
                    </li>
                ))}
            </ul> */}
            <div className="">
                {flag? (
                    <div className="flex mt-[10%] ml-[50%] w-full">
                        <Loader />
                    </div>
                ) : posts.length > 0 ? (
                    <ul className="flex flex-col gap-9 w-full">
                        {posts.map((post: Models.Document) => (
                            <PostCard key={post.$id} post={post} />
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-400">No posts found</p>
                )}
            </div>

        </div>
    )
}

export default GridPostList
