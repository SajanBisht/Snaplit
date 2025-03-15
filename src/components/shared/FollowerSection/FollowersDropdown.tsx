import { Input } from "@/components/ui/input"
import { useGetUserWithThisUsername, } from "@/lib/react-query/queryAndMutations";
import { IUser, IUserFetch } from "@/types";
import { useEffect, useRef, useState } from "react";
import SearchUsersSection from "../SearchUsersSection";
import Loader from "../Loader";

type FollowersDropdownProps = {
    allFollowing: IUser[],
    allFollowers: IUser[],
    setFollowerSection: React.Dispatch<React.SetStateAction<boolean>>,
    actionForModel:string
}
const FollowersDropdown = ({ allFollowing, setFollowerSection,actionForModel,allFollowers }: FollowersDropdownProps) => {

    const [username, setUsername] = useState('');
    const modalRef = useRef<HTMLDivElement>(null); // Reference for modal container

    // Detect click outside modal
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                setFollowerSection(prev=>!prev); // Close modal
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [setFollowerSection]);

    //make scroll off for window
    useEffect(() => {
        document.body.style.overflow = "hidden"; // Disable scroll on body
        return () => {
            document.body.style.overflow = "auto"; // Re-enable scroll on cleanup
        };
    }, []);

    // Use the custom hook to fetch user data
    const { data, isLoading, isError } = useGetUserWithThisUsername(username);
    const personInfo: IUserFetch | undefined = data as unknown as IUserFetch;
    console.log("personInfo in alluser", personInfo)

    return (
        <div className='w-full p-4 border-2 rounded-md bg-black  ' ref={modalRef}>
            <div  className='m-auto w-full  max-h-[370px]  overflow-y-scroll' >
                <div className='relative w-full p-1'>
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
                        className='rounded-xl w-full h-12 pl-10 bg-gray-900 text-white border border-gray-700 focus:border-purple-600 focus:ring-0 focus:outline-none '
                        placeholder='Enter username'
                    />
                </div>
                <div className='mt-3 px-1'>
                    {isLoading && <div className='flex gap-2 items-center'><div><Loader /></div><span>Loading...</span></div>}
                    {!isLoading && !isError && !personInfo && (
                        <div className='text-gray-500 ml-4'>{actionForModel==='followers'?'followers...':'followings...'}</div>
                    )}
                    {isError && <p>Error fetching user data.</p>}
                    {personInfo && <SearchUsersSection personInfo={personInfo} paas={'Search2'} />}
                    <hr className="bg-white mt-2 opacity-70 h-[1px]" />
                </div>
                {actionForModel==='followings' &&<div className="w-full px-1 gap-y-2">
                    {allFollowing && allFollowing.map((followingInfo) => (
                        <div className="my-2" key={String(followingInfo.$id)}><SearchUsersSection personInfo={followingInfo} paas={'FollowersDropdown'} /></div>
                    ))}
                </div>}
                {actionForModel==='followers' &&<div className="w-full px-1 gap-y-2">
                    {allFollowers && allFollowers.map((followersInfo) => (
                        <div className="my-2" key={String(followersInfo.$id)}><SearchUsersSection personInfo={followersInfo} paas={'FollowersDropdown'} /></div>
                    ))}
                </div>}
            </div>
        </div>
    )
}
export default FollowersDropdown