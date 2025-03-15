import PostForm from '@/components/forms/PostForm'//comment
import ReelForm from '@/components/forms/ReelForm';
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const CreatePost = () => {
  const [toggleCreate, setToggleCreate] = useState(1);
  const inputWidth = "w-[95%] md:w-[90%] lg:w-[80%] xl:w-[75%] mx-2";
  return (
    <div className='w-full flex min-h-screen md:ml-[30%] left-0'>
      <div className=' w-full bg-black'>
        <div className={` flex items-center gap-3 justify-start ${inputWidth} m-2 mt-4`}>
          <img src="/assets/icons/add-post.svg" alt="add" width={36} height={36} />
          {toggleCreate > 0 && (
            <h2 className='h3-bold md:h2-bold w-full text-left text-2xl my-2'>
              {toggleCreate === 1 ? 'Create Post' : 'Create Reel'}
            </h2>
          )}
          <div className='flex gap-4 '>
            <Button
              className={`w-20 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border
            ${toggleCreate === 1
                  ? 'bg-[#7e22ce] text-white border-[#7e22ce] shadow-lg scale-[1.02]'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:text-white hover:bg-white/10 hover:border-white'}`}
              onClick={() => setToggleCreate(1)}
            >
              Post
            </Button>

            <Button
              className={`w-20 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium border
            ${toggleCreate === 2
                  ? 'bg-[#7e22ce] text-white border-[#7e22ce] shadow-lg scale-[1.02]'
                  : 'bg-transparent text-gray-400 border-gray-600 hover:text-white hover:bg-white/10 hover:border-white'}`}
              onClick={() => setToggleCreate(2)}
            >
              Reels
            </Button>
          </div>
        </div>
        <div className='w-full'>
          {toggleCreate === 1 && <PostForm action='Create' />}
          {toggleCreate === 2 && <ReelForm action='Create' />}
        </div>
      </div>
    </div>
  )
}

export default CreatePost