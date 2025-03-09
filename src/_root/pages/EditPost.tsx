import PostForm from '@/components/forms/PostForm';
import Loader from '@/components/shared/Loader';
import { useGetPostById } from '@/lib/react-query/queryAndMutations';
import { useParams } from 'react-router-dom';

const EditPost = () => {
  const { id } = useParams(); //  No generics needed
  console.log("Post ID from URL:", id);

  const { data: post, isPending } = useGetPostById(id || '');

  if (isPending) {
    return <div className="loader w-full flex mt-[10%] ml-[50%]"><Loader /></div>;
  }

  if (!post) {
    return <div className="error w-full">Error: Post not found</div>;
  }
  console.log(post);
  if ('error' in post) {
    console.log(post);
    return <div className="error w-full">Error: {post.error}</div>;
  }

  return (
    <div className="w-full flex min-h-screen ml-[35%]">
      <div className="w-[90%] bg-black"> {/*  Fixed class name */}
        <div className=" flex items-center gap-3 justify-start w-full m-2">
          <img src="/assets/icons/edit.svg" alt="edit" width={36} height={36} /> {/*  Use an edit icon */}
          <h2 className="h3-bold md:h2-bold w-full text-left text-2xl">Edit Post</h2> {/*  Fixed heading */}
        </div>
        <PostForm action="Update" post={post} />
      </div>
    </div>
  );
};

export default EditPost;
