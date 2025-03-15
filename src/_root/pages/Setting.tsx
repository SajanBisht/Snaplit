import EditProfileSetting from "@/components/SettingComponent/EditProfileSetting";
import { Button } from "@/components/ui/button";

const Setting = () => {
    return (
        <div className="flex md:ml-[18%] w-full min-h-screen">
            {/* Sticky Sidebar */}
            <div className="w-[280px] h-screen sticky top-0 overflow-y-auto p-4 bg-background">
                <h1 className="text-xl font-bold mt-6 text-center">Settings</h1>

                {/* Section 1 */}
                <div className="mt-6 space-y-1">
                    <h2 className="text-[14px] text-gray-400 flex justify-center">How you use Instagram</h2>
                    <Button className="hover:bg-gray-700 w-full">Edit Profile</Button>
                    <Button className="hover:bg-gray-700 w-full">Notification</Button>
                </div>

                {/* Section 2 */}
                <div className="mt-6 space-y-1">
                    <h2 className="text-[14px] text-gray-400 flex justify-center">Who can see your content</h2>
                    <Button className="hover:bg-gray-700 w-full">Account Privacy</Button>
                    <Button className="hover:bg-gray-700 w-full">Close Friend</Button>
                    <Button className="hover:bg-gray-700 w-full">Blocked</Button>
                </div>

                {/* Section 3 */}
                <div className="mt-6 space-y-1">
                    <h2 className="text-[14px] text-gray-400 flex justify-center">How others can interact with you</h2>
                    <Button className="hover:bg-gray-700 w-full">Tags and Mentions</Button>
                </div>

                {/* Section 4 */}
                <div className="mt-6 space-y-1">
                    <h2 className="text-[14px] text-gray-400 flex justify-center">What you see</h2>
                    <Button className="hover:bg-gray-700 w-full">Content Preference</Button>
                    <Button className="hover:bg-gray-700 w-full">Subscription</Button>
                </div>

                {/* Section 5 */}
                <div className="mt-6 space-y-1">
                    <h2 className="text-[14px] text-gray-400 flex justify-center">Password & Security</h2>
                    <Button className="hover:bg-gray-700 w-full">Reset Password</Button>
                </div>

                {/* Section 6 */}
                <div className="mt-6 space-y-1">
                    <h2 className="text-[14px] text-gray-400 flex justify-center">More Info and Support</h2>
                    <Button className="hover:bg-gray-700 w-full">About Snaplit</Button>
                    <Button className="hover:bg-gray-700 w-full">Contact Us</Button>
                </div>
            </div>

            {/* Vertical Divider */}
            <div className="w-[1px] bg-white opacity-80 mx-4" />

            {/* Main Content */}
            <div className="flex-1 mt-10 px-4">
                <EditProfileSetting />
            </div>
        </div>
    );
};

export default Setting;
