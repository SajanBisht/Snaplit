import  { useState } from 'react';
import { Button } from '@/components/ui/button';
import PostOfUser from '@/components/shared/PostsOfUser';
import { useParams } from 'react-router-dom';
import { useGetUsers } from '@/lib/react-query/queryAndMutations';

const Profile = () => {
  const { id } = useParams();
  const { data: users, isLoading, isError } = useGetUsers(id ? [id] : []);
  const [toggleValue, setToggleValue] = useState('posts');
  const [postCount, setPostCount] = useState(0)
  const [toggleDpModel, setToggleDpModel] = useState(false)
  if (isLoading) return <p>Loading...</p>;
  if (isError || !users || users.length === 0) return <p>User not found</p>;
  const user = users[0]; // Extract the first user //comment

  console.log("user data in profile", user)
  return (
    <section className="flex justify-center mt-10 ml-[18%] w-full z-[8000]">
      <article className="flex flex-col items-center w-[60%] max-w-3xl p-6  rounded-lg shadow-lg">
        {/* Profile Header */}
        <header className="flex gap-6 items-center w-full">
          <img
            src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
            alt={`${user.username}'s Profile Picture`}
            className="w-38 h-38 rounded-full border-2 border-gray-700"
            onClick={() => setToggleDpModel(prev => !prev)}
          />
          
          {toggleDpModel && (
            <div className="fixed flex items-center justify-center z-[1100] w-[40%] h-[30%] bottom-[40%] left-[50%] -translate-x-1/2 bg-[#282828] bg-opacity-90 rounded-2xl shadow-lg transition-opacity duration-300">
              <div className="w-[90%] sm:w-[80%] md:w-[70%] p-4">
                {/* Header */}
                <div className="flex items-center justify-center mb-4">
                  <p className="text-lg font-semibold text-white">Change Profile Photo</p>
                </div>

                {/* Buttons Section */}
                <div className="flex flex-col gap-3">
                  <Button type="button" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg">
                    Upload Photo
                  </Button>
                  <Button type="button" className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg">
                    Remove Current Photo
                  </Button>
                  <Button
                    type="button"
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg"
                    onClick={() => setToggleDpModel(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col w-full">
            <div className="flex gap-4 mt-3 w-full">
              <h1 className="text-2xl font-semibold text-white">{user.username}</h1>
              <Button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
                Edit profile
              </Button>
              <Button className="bg-[#303030] hover:bg-gray-600 px-4 py-2 rounded-lg">
                View archieve
              </Button>
            </div>
            <div className='flex gap-6 my-3 '>
              <div className='flex gap-2'>
                <p>{postCount}</p>
                <p className='text-gray-400'>posts</p>
              </div>
              <div className='flex gap-2'>
                <p>0</p>
                <p className='text-gray-400'>followers</p>
              </div>
              <div className='flex gap-2'>
                <p>0</p>
                <p className='text-gray-400'>following</p>
              </div>
            </div>
            <div><p>{user.name}</p></div>
          </div>
        </header>
        {user.bio && user.bio.length !== 0 && <div className='w-full mt-2 ml-4'><p className='flex items-center'><span className='text-gray-400'>Bio:</span>{user.bio}</p></div>}

        {/* Profile Content */}
        <div className="w-full mt-6 border-t border-gray-700  ">
          <div className='flex justify-evenly'>
            <div className='flex items-center gap-1'>
              <img src="/assets/icons/posts.svg" alt="Posts" className='w-5 h-5' />
              <Button onClick={() => setToggleValue('posts')} className='p-0'><p className='text-[14px] text-gray-500'>POSTS</p></Button>
            </div>
            <div className='flex items-center gap-1'>
              <img src="/assets/icons/reels.svg" alt="Reels" className='w-5 h-5' />
              <Button onClick={() => setToggleValue('reels')} className='p-0'><p className='text-[14px] text-gray-500'>REELS</p></Button>
            </div>
            <div className='flex items-center gap-1'>
              <img src="/assets/icons/save.svg" alt="Saves" className='w-5 h-5' />
              <Button onClick={() => setToggleValue('saved')} className='p-0'><p className='text-[14px] text-gray-500'>SAVED</p></Button>
            </div>
            <div className='flex items-center gap-1'>
              <img src="/assets/images/tagged.png" alt="tagges" className='w-5 h-5' />
              <Button onClick={() => setToggleValue('tagged')} className='p-0'><p className='text-[14px] text-gray-500'>TAGGED</p></Button>
            </div>
          </div>
        </div>
        {/* model */}
        {toggleValue === 'posts' && <div className='w-full'><PostOfUser userLookup={user} setPostCount={setPostCount} /></div>}
        {toggleValue === 'saved' && <div className='w-full'></div>}
        {toggleValue === 'tagged' && <div className='w-full'></div>}
      </article>
    </section>
  );
};

export default Profile;
