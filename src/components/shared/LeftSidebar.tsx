import  { useEffect, useRef, useState } from 'react';//comment
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queryAndMutations';
import { useUserContext } from '@/context/AuthContext';
import { useSidebarLinks } from '@/constants';
import { INavLink } from '@/types';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { mutate: signOut, isSuccess } = useSignOutAccount();
  const navigate = useNavigate();
  const { user } = useUserContext();

  useEffect(() => {
    if (isSuccess) {
      navigate('/sign-in');
    }
  }, [isSuccess, navigate]);

  // Modal State & Ref
  const [hiddenModel, setHiddenModel] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close Modal on Click Outside
useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      setHiddenModel(false); // Close modal when clicking outside
    }
  };

  if (hiddenModel) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [hiddenModel]);

  const sidebarLinks = useSidebarLinks(); // Call the function inside a component

  return (
    <nav className='leftsidebar min-h-screen bg-gray-950 hidden md:block w-[20%] fixed z-[1100]'>
      <section className="shadow-md">
        <div className="py-4 px-5 gap-4">
          <div className="mb-4">
            <Link to="/" className="flex items-center">
              <img src="/assets/images/logoSnaplit.png" alt="logo" className='w-72 h-16 rounded-2xl ' />
            </Link>
          </div>

          <Link to={`/profile/${user.id}`} className='flex items-center gap-3'>
            <img src={user.imageUrl || '/assets/icons/profile-placeholder.svg'} alt="profile" className='h-12 w-12 rounded-full' />
            <div>
              <p className='body-bold text-xl'>{user.name}</p>
              <p className='text-gray-400 text-[14px]'>@{user.username}</p>
            </div>
          </Link>

          <ul className='flex flex-col gap-3 mt-4 text-xl'>
            {sidebarLinks.map((link: INavLink) => {
              const isActive = pathname === link.route;
              return (
                <li key={link.route} className={`left-sidebar-link group ${isActive ? 'bg-purple-800 rounded-xl' : ''}`}>
                  <NavLink to={link.route} className='flex gap-4 items-center hover:bg-purple-800 py-2 px-4 hover:rounded-xl'>
                    <img
                      src={link.imgURL}
                      alt={link.label}
                      className={`w-[25px] ${link.label === 'Profile' ? 'rounded-full w-[30px]' : 'left-sidebar-link'} 
                      ${isActive && link.label !== 'Profile' ? 'filter invert brightness-0' : ''} 
                      ${link.label !== 'Profile'?'group-hover:filter group-hover:invert group-hover:brightness-0':''}`}
                    />
                    {link.label}
                  </NavLink>
                </li>
              );
            })}

            {hiddenModel && (
              <div ref={modalRef} className='fixed z-[1200] h-[38%] bg-[#303030] w-[19%] bottom-[12%] rounded-2xl p-4 my-2 shadow-lg shadow-blue-400'>
                <div className='w-full'>
                  <div className='hover:bg-gray-500 w-full flex left-0 rounded-xl cursor-pointer my-2'>
                    <Button className='text-[18px] text-gray-400 gap-2 cursor-pointer'
                     onClick={()=>{
                      navigate('/liked-posts');
                      setHiddenModel(prev=>!prev);
                    }}>
                      <img src="/assets/icons/like.svg" alt="likes" width={23} />
                      <span>Liked</span>
                    </Button>
                  </div>
                  <div className='hover:bg-gray-500 w-full flex left-0 rounded-xl cursor-pointer'>
                    <Button
                      variant="ghost"
                      className="text-[18px] text-gray-400 gap-2 cursor-pointer"
                      onClick={() => signOut()}
                    >
                      <img src="/assets/icons/logout.svg" alt="logout" />
                      <p className='text-gray-400 text-[16px]'>Logout</p>
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className={`hover:bg-purple-800 hover:rounded-xl w-full disable ${hiddenModel ? 'bg-purple-800 rounded-xl' : ''}`} >
              <Button
                onClick={() => setHiddenModel(prev => !prev)}
                className='w-full flex hover:filter hover:invert hover:brightness-0'
                disabled={hiddenModel}
              >
                <div className=' gap-4 w-full flex'>
                  <img src="/assets/icons/showmore.svg" alt="" className='w-[30px]' />
                  <span className='text-xl'>More</span>
                </div>
              </Button>
            </div>
          </ul>
        </div>
      </section>
    </nav>
  );
}

export default LeftSidebar;
