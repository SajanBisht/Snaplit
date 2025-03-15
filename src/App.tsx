import "./App.css";

import { Routes, Route } from "react-router-dom";
import { AllUsers, CreatePost, EditPost, Explore, Home, LikedPosts,Notification, Messages, PostDetails, Profile, Reels, Saved, UpdateProfile, Setting} from "./_root/pages";
import SigninForm from "./_auth/forms/SigninForm";
import SignupForm from "./_auth/forms/SignupForm";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import { Toaster } from "@/components/ui/toaster"
import { ContextProvider } from "./components/shared/CommentModel/ContextProvider";

const App = () => {
  return (
    <main className=" bg-black text-white flex  min-h-screen">
      <ContextProvider>
        <Routes>
          {/* public Route */}
          <Route element={<AuthLayout />}>
            <Route path="/sign-in" element={<SigninForm />} />
            <Route path="/sign-up" element={<SignupForm />} />
          </Route>
          {/* private Route */}
          <Route element={<RootLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/all-users" element={<AllUsers />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path={`/update-post/:id`} element={<EditPost />} />
            <Route path="/posts/:id" element={<PostDetails />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/update-profile/:id" element={<UpdateProfile />} />
            <Route path="/liked-posts" element={<LikedPosts />} />
            <Route path="/reels" element={<Reels />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/notification" element={<Notification />} />
            <Route path="/setting" element={<Setting />} />
          </Route>
        </Routes>
      </ContextProvider>
      <Toaster />
    </main>
  );
};

export default App;
