import PostForm from '@/components/forms/PostForm'//comment
const CreatePost = () => {
  return (
    <div className='w-[80%] flex min-h-screen ml-[35%] left-0'>
      <div className=' w-[90%] bg-black'>
        <div className=' flex items-center gap-3 justify-start w-full m-2 mt-4'>
          <img src="/assets/icons/add-post.svg" alt="add" width={36} height={36} />
          <h2 className='h3-bold md:h2-bold w-full text-left text-2xl my-2'>Create Post</h2>
        </div>
        <PostForm action='Create'/>
      </div>
    </div>
  )
}

export default CreatePost