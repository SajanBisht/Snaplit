import { Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "@/context/AuthContext";
import Loader from "@/components/shared/Loader";

const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useUserContext();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader /> {/* or a spinner/loading screen */}
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* Left Side: Authentication Forms */}
      <section className="flex flex-col items-center justify-center p-2 w-full md:w-1/2">
        <Outlet />
      </section>

      {/* Right Side: Image */}
      <section className="w-1/2  items-center justify-center bg-gray-900 hidden md:block">
        <img
          src="/assets/images/side-img.svg"
          alt="logo"
          className="w-full h-full object-cover"
        />
      </section>
    </div>
  );
};

export default AuthLayout;
