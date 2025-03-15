import { IUser, IUserFetch } from "@/types";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import { useFollowOthers, useUnFollowOthers } from "@/lib/react-query/queryAndMutations";
import { useUserContext } from "@/context/AuthContext";

type SearchUsersSectionProps = {
  personInfo: IUser | IUserFetch;
  paas: string;
};

const SearchUsersSection = ({ personInfo, paas }: SearchUsersSectionProps) => {
  const { user: currentUser } = useUserContext();
  const userId: string = personInfo["$id"] as string ?? '';
  const [toggleFollow, setToggleFollow] = useState(paas === 'Search2' ? false : true);
  const [followingId, setFollowingId] = useState<string | null>(null);
  const { mutateAsync: followOthers } = useFollowOthers();
  const { mutateAsync: unfollowOthers } = useUnFollowOthers();

  useEffect(() => {
    if (userId) {
      setFollowingId(userId);
    }
  }, [userId]);

  const handleFollowSection = async (value: string) => {
    if (!currentUser?.id || !followingId) return;

    try {
      if (value === 'Follow') {
        const response = await followOthers({ followerId: currentUser.id, followingId });
        console.log("response of add follower", response);
      } else {
        const response = await unfollowOthers({ followerId: currentUser.id, followingId });
        console.log("response of unfollow user", response);
      }
      setToggleFollow((prev) => !prev);
    } catch (error) {
      console.error(`Failed to ${value.toLowerCase()} user:`, error);
    }
  };

  return (
    <div className="flex gap-2 border-purple-600 border-2 p-1 items-center rounded-md">
      <div className="w-full flex items-center">
        <Link to={`/profile/${userId}`} className="w-full flex items-center gap-2">
          <img src={personInfo.imageUrl} alt="Searched Person DP" className="w-10 h-10 rounded-full" />
          <div className="flex-col w-full">
            <p>{personInfo.username}</p>
            <p className="text-gray-400">{personInfo.name}</p>
          </div>
        </Link>
      </div>
      {paas !=='Search' && <Button
        className="border-gray-500 border-1"
        onClick={() => handleFollowSection(toggleFollow ? 'Following' : 'Follow')}
      >
         {toggleFollow? "Following": "Follow" }
      </Button>}
    </div>
  );
};

export default SearchUsersSection;
