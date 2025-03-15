import { useState } from 'react';
import { Input } from '@/components/ui/input';
import SearchUsersSection from '@/components/shared/SearchUsersSection';
import { useGetUserWithThisUsername } from '@/lib/react-query/queryAndMutations';
import { IUserFetch } from '@/types';
import Loader from '@/components/shared/Loader';

const AllUsers = () => {
  const [username, setUsername] = useState('');

  // Use the custom hook to fetch user data
  const { data, isLoading, isError } = useGetUserWithThisUsername(username);
  const personInfo: IUserFetch | undefined = data as unknown as IUserFetch;
  console.log("personInfo in alluser", personInfo)
  return (
    <div className='md:ml-[16%] w-full h-full'>
      <div className='m-auto w-[60%] h-full'>
        <h1 className='justify-center flex text-3xl my-2 text-white/50'>Search</h1>
        <div className='relative w-full'>
          <img
            src='/assets/icons/search.svg'
            alt='search'
            className='absolute inset-y-0 left-3 w-5 h-5 my-auto invert'
          />
          <img
            src='/assets/icons/close.svg'
            alt='clear'
            className='absolute inset-y-0 right-3 w-5 h-5 my-auto invert cursor-pointer'
            onClick={() => setUsername('')}
          />
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className='rounded-xl w-full h-12 pl-10 bg-gray-900 text-white border border-gray-700 focus:border-purple-600 focus:ring-0 focus:outline-none'
            placeholder='Enter username'
          />
        </div>
        <div className='w-[50%] my-3'>
          {isLoading && <div className='flex gap-2 items-center'><div><Loader /></div><span>Loading...</span></div>}
          {!isLoading && !isError && !personInfo  && (
            <div className='text-gray-400 ml-4'>User not found</div>
          )}
          {isError && <p>Error fetching user data.</p>}
          {personInfo && <SearchUsersSection personInfo={personInfo} paas={'Search'}/>}
        </div>
      </div>
    </div>
  );
};

export default AllUsers;
