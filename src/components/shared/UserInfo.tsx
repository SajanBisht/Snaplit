
import { useUserContext } from "@/context/AuthContext";
import { Button } from "../ui/button";



const UserInfo = () => {
    const { user: user } = useUserContext();

    return (
        <div className=" flex-col w-[20%] hidden md:block">
            <header className="flex gap-2 items-center w-full content-center">
                    <img
                        src={user.imageUrl || '/assets/icons/profile-placeholder.svg'}
                        alt={`${user.username}'s Profile Picture`}
                        className="w-10 h-10 rounded-full border-2 border-gray-700 mt-2"
                    />
                <div className="flex flex-col w-full">
                    <div className="flex gap-14 mt-3">
                        <div className="flex-col items-center content-center">
                            <h1 className="text-[16px] font-semibold text-gray-100">{user.username}</h1>
                            <h1 className="text-[16px] font-semibold text-gray-500">{user.name}</h1>
                        </div>
                        <Button className="bg-blue-500 hover:bg-gray-600 px-4 py-2 rounded-lg">
                            switch
                        </Button>
                    </div>
                </div>
            </header>
        </div>
    );
};

export default UserInfo