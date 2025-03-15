
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
            <div className="">
                {flag? (
                    <div className="flex mt-[10%] ml-[50%] w-full">
                        <Loader />
                    </div>
                ) : posts.length > 0 ? (
                    <ul className="flex flex-col gap-9 w-[80%]">
                        {posts.map((post: Models.Document) => (
                            <PostCard key={post.$id}  post={post}/>
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
