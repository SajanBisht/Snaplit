import  { useEffect } from 'react';//comment
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queryAndMutations';
import { useUserContext } from '@/context/AuthContext';

const Topbar = () => {
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) {
      navigate('/sign-in');
    }
  }, [isSuccess, navigate]);

  return (
    <section className="topbar w-full shadow-md bg-gray-950 md:hidden">
      <div className="flex justify-between items-center py-4 px-5">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img src="/assets/images/logo.svg" alt="logo" width={130} height={325} />
        </Link>
        <div className="flex items-center gap-4">
          {/* Logout Button */}
          <Button
            variant="ghost"
            className="shad-button_ghost cursor-pointer"
            onClick={() => signOut()}
          >
            <img src="/assets/icons/logout.svg" alt="logout" />
          </Button>
          {/* Profile Link */}
          <Link to={user ? `/profile/${user.id}` : '/sign-in'} className='flex items-center gap-3'>
            <img src={user?.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="profile" className='h-8 w-8 rounded-full' />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Topbar;
