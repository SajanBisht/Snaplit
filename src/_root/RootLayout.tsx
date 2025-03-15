import { Outlet, useNavigate } from "react-router-dom";
import Bottombar from "@/components/shared/Bottombar";
import LeftSidebar from "@/components/shared/LeftSidebar";
import Topbar from "@/components/shared/Topbar";
import { useUserContext } from "@/context/AuthContext";
import { useEffect } from "react";


const RootLayout = () => {
  const navigate = useNavigate();
    const { checkAuthUser } = useUserContext();
    useEffect(() => {
      if (!checkAuthUser) navigate("/sign-in");
    }, [checkAuthUser, navigate]);
  
  return (
    <div className="w-full md:flex">
      <Topbar />
      <LeftSidebar />
      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      <Bottombar />
    </div>
  );
};

export default RootLayout;
