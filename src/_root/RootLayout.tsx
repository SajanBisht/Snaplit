import Bottombar from "@/components/shared/Bottombar"
import LeftSidebar from "@/components/shared/LeftSidebar"
import Topbar from "@/components/shared/Topbar"
import UserInfo from "@/components/shared/UserInfo"
import { Outlet } from "react-router-dom"


const RootLayout = () => {
  return (
    <div className="w-full md:flex ">
      <Topbar />
      <LeftSidebar />
      <section className="flex flex-1 h-full">
        <Outlet />
      </section>
      <UserInfo/>
      <Bottombar />
    </div>
  )
}

export default RootLayout