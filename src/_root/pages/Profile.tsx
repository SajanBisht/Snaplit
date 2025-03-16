import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import PostOfUser from '@/components/shared/PostsOfUser';
import { Link, useParams } from 'react-router-dom';
import { useFollowOthers, useGetUsers, useUnFollowOthers, useUserFollowers, useUserFollowing } from '@/lib/react-query/queryAndMutations';
import SavedCards from '@/components/shared/SavedCards';
import { useUserContext } from '@/context/AuthContext';
import FollowersDropdown from '@/components/shared/FollowerSection/FollowersDropdown';


const Profile = () => {
  const { user: currentuser } = useUserContext();
  const { id } = useParams();
  const { data: users, isLoading, isError } = useGetUsers(id ? [id] : []);
  const [toggleValue, setToggleValue] = useState('posts');
  const [postCount, setPostCount] = useState(0)
  const [toggleDpModel, setToggleDpModel] = useState(false)
  //togglr folloer section
  const [followerSection, setFollowerSection] = useState(false);


  //user following list
  // console.log("userId in profile", id)
  const { data: response } = useUserFollowing(id ? id : '')
  // console.log("user following list profile", response);
  const { data: allFollowing } = useGetUsers(response)
  console.log("All Following Data profile", allFollowing)



  //Followers Section
  const [actionForModel, setActionForModel] = useState('followers')//model action command
  // console.log("id .......", id)
  // console.log("currentuserId in profile", currentuser.id)
  const { data: response2 } = useUserFollowers(id ? id : '')
  // console.log("//////w/w/w/w user followers list profile", response2);
  const followerIds = response2 ? response2.map(item => item.followerId) : [];
  // console.log("followerId array", followerIds);    //['67bf62f3003d0e3e230d']
  const { data: allFollowers } = useGetUsers(followerIds)
  console.log("All Followers Data profile", allFollowers)
  const [toggleFollow, setToggleFollow] = useState(false);

  useEffect(() => {
    setToggleFollow(followerIds.includes(currentuser.id));
  }, [currentuser.id, followerIds]);

  const { mutateAsync: followOthers } = useFollowOthers();
  const { mutateAsync: unfollowOthers } = useUnFollowOthers();

  const handleFollowButton = async () => {
    if (!toggleFollow) {
      const response = await followOthers({ followerId: currentuser.id, followingId: id || '' });
      console.log("response of add follower", response);
    } else {
      const response = await unfollowOthers({ followerId: currentuser.id, followingId: id || '' });
      console.log("response of unfollow user", response);
    }
    setToggleFollow((prev) => !prev);
  }


  if (isLoading) return <p className='ml-[50%]'>Loading...</p>;
  console.log(users)
  if (isError || !users || users.length === 0) return <p>User not found</p>;
  const user = users[0]; // Extract the first user //comment

  // console.log("user data in profile", user)


  return (
    <section className="flex justify-center md:mt-10 md:ml-[18%] w-full z-[800] relative">
      <article className="flex flex-col items-center w-full p-6  rounded-lg shadow-lg">
        {/* Profile Header */}
        <header className="md:flex gap-6 items-center  ">
          <div className="flex  w-full gap-2 ">
            <div className='relative flex flex-col items-center justify-center w-full z-[800]'>
              <img
                src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                alt={`${user.name}'s Profile Picture`}
                className="md:w-38 md:h-38 sm:w-24 sm:h-24 w-20 h-20 rounded-full border-2 border-black"
                onClick={() => setToggleDpModel(prev => !prev)}
              />

              {/* Add button positioned above the profile image */}
              <img
                src="/assets/images/add2.png"
                alt="add"
                className='absolute md:bottom-[25px] sm:bottom-[40px]  bottom-[52px] right-4  invert z-[1000] md:w-8 md:h-8 sm:w-7 sm:h-7 w-6 h-6 cursor-pointer bg-white rounded-full hover:w-[35px] hover:h-[35px]'
              />

              <p className='text-gray-400 opacity-80 mx-auto'>{user.username}</p>
            </div>

            <div className=' my-3 '>
              <div className=' gap-2  items-center'>
                <h1 className="md:text-2xl font-semibold text-white text-[18px]">{user.username}</h1>
                {currentuser.id === id && <div className="flex gap-4 mt-3 items-center ">
                  <Button className="border-1 hover:bg-gray-600 px-4 py-2 rounded-lg focus:border-purple-700 sm:w-full w-24">
                    Edit profile
                  </Button>
                  <Button className="border-1 hover:bg-gray-600 px-4 py-2 rounded-lg focus:border-purple-700 sm:w-full w-24">
                    View archieve
                  </Button>
                  <div className='w-full'>
                    <Link to={'/setting'} className='w-full'><img src="/assets/icons/setting.svg" alt="setting" className='w-8' /></Link>
                  </div>
                </div>}
                {currentuser.id !== id && <div className="flex gap-4 mt-3 items-center md:w-full">
                  <Button className="border-1 hover:bg-gray-600 px-4 py-2 rounded-lg focus:border-purple-700" onClick={handleFollowButton}>
                    {toggleFollow ? 'Following' : 'Follow'}
                  </Button>
                  <Button className="border-1 hover:bg-gray-600 px-4 py-2 rounded-lg focus:border-purple-700">
                    message
                  </Button>
                  <img src="/assets/images/3dot-horizontal.png" alt="3dot-h" className='invert w-6 h-6' />
                </div>}
              </div>
              <div className='flex items-center gap-4 mt-2'>
                <div className='flex gap-2'>
                  <p>{postCount}</p>
                  <p className='text-gray-400'>posts</p>
                </div>
                <Button className='md:flex gap-2 cursor-pointer' onClick={() => {
                  setFollowerSection(prev => !prev);
                  setActionForModel('followers')
                }} disabled={followerSection}>
                  <p>{followerIds?.length || 0}</p>
                  <p className='text-gray-400'>followers</p>
                </Button>
                <Button className='md:flex gap-2 cursor-pointer' onClick={() => {
                  setFollowerSection(prev => !prev);
                  setActionForModel('followings')
                }} disabled={followerSection}>
                  <p>{allFollowing?.length || 0}</p>
                  <p className='text-gray-400'>following</p>
                </Button>
              </div>

              {/* followers section */}
              {followerSection && (
                <div className={`absolute md:top-44  ${actionForModel === 'followings' ? 'md:right-[20%]' : 'md:right-[35%]'} z-[1200]  shadow-lg rounded-md  md:w-[30%] md:mx-auto  h-[30%] w-[92%] left-0 md:left-[62%] mx-[4%]`}>
                  <FollowersDropdown
                    allFollowing={(allFollowing ?? []).map(doc => ({
                      $id: doc.$id,
                      id: doc.id,
                      name: doc.name,
                      username: doc.username,
                      email: doc.email,
                      imageUrl: doc.imageUrl,
                      bio: doc.bio || '',
                    }))}
                    allFollowers={(allFollowers ?? []).map(doc => ({
                      $id: doc.$id,
                      id: doc.id,
                      name: doc.name,
                      username: doc.username,
                      email: doc.email,
                      imageUrl: doc.imageUrl,
                      bio: doc.bio || '',
                    }))}
                  setFollowerSection={setFollowerSection}
                  actionForModel={actionForModel}
                  />
                </div>
              )}
            </div>
          </div>

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
        </header>

        {user.bio && user.bio.length !== 0 && <div className='w-full mt-2 ml-4'><p className='flex items-center'>
          <span className='text-gray-400'>Bio:</span>{user.bio}</p></div>}

        {/* Profile Content */}
        <div className="w-full mt-6 border-t border-gray-700  ">
          <div className='flex justify-evenly'>
            <div className='flex items-center gap-1' onClick={() => setToggleValue('posts')}>
              <img src="/assets/icons/posts.svg" alt="Posts" className='w-5 h-5' />
              <Button className='p-0'><p className='text-[14px] text-gray-500'>POSTS</p></Button>
            </div>
            <div className='flex items-center gap-1' onClick={() => setToggleValue('reels')}>
              <img src="/assets/icons/reels.svg" alt="Reels" className='w-5 h-5' />
              <Button className='p-0'><p className='text-[14px] text-gray-500'>REELS</p></Button>
            </div>
            {currentuser.id === id && <div className='flex items-center gap-1' onClick={() => setToggleValue('saved')}>
              <img src="/assets/icons/save.svg" alt="Saves" className='w-5 h-5' />
              <Button className='p-0'><p className='text-[14px] text-gray-500'>SAVED</p></Button>
            </div>}
            <div className='flex items-center gap-1' onClick={() => setToggleValue('tagged')}>
              <img src="/assets/images/tagged.png" alt="tagges" className='w-5 h-5' />
              <Button className='p-0'><p className='text-[14px] text-gray-500'>TAGGED</p></Button>
            </div>
          </div>
        </div>
        {/* model */}
        {toggleValue === 'posts' && <div className='w-full'><PostOfUser userLookup={user} setPostCount={setPostCount} /></div>}
        {toggleValue === 'saved' && <div className='w-full mt-6'><SavedCards /></div>}
        {toggleValue === 'tagged' && <div className='w-full'></div>}
      </article>
    </section>
  );
};

export default Profile;
