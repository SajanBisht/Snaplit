import  { useEffect, useRef, useState } from 'react';//comment
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { useSignOutAccount } from '@/lib/react-query/queryAndMutations';
import { useSidebarLinks } from '@/constants';
import { INavLink } from '@/types';
import Loader from './Loader';

const LeftSidebar = () => {
  const { pathname } = useLocation();
  const { mutate: signOut, isSuccess ,isPending:isLoading } = useSignOutAccount();
  const navigate = useNavigate();

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
    <nav className='leftsidebar min-h-screen  hidden md:block w-[16%] fixed z-[1100]'>
      <section className="shadow-md flex">
        <div className=" px-5 gap-4">
          <div className="mb-4">
            <Link to="/" className="flex items-center mt-7">
              <img src="/assets/images/logoSnaplit2.png" alt="logo" className='w-full h-[55px] ' />
            </Link>
          </div>

          <ul className='flex flex-col gap-3 mt-4 text-xl'>
            {sidebarLinks.map((link: INavLink) => {
              const isActive = pathname === link.route;
              return (
                <li key={link.route} className={`left-sidebar-link group ${isActive ? 'bg-[#171717] rounded-md' : ''}`}>
                  <NavLink to={link.route} className='flex gap-4 items-center hover:bg-[#171717] py-2 px-4 hover:rounded-md'>
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
                      navigate('/liked');
                      setHiddenModel(prev=>!prev);
                    }}>
                      <img src="/assets/icons/like.svg" alt="likes" width={23} />
                      <span>Liked</span>
                    </Button>
                  </div>
                  <div className='hover:bg-gray-500 w-full  rounded-xl cursor-pointer'>
                    <Button
                      className="text-[18px] text-gray-400 gap-2 cursor-pointer"
                      onClick={()=> signOut()}
                    >
                      {isLoading ? <div className='ml-24'><Loader /></div> : <div className='flex items-center justify-center gap-2'>
                        <img src="/assets/icons/logout.svg" alt="logout" />
                        <p className='text-gray-400 text-[16px]'>Logout</p>
                      </div>}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className={`hover:bg-[#171717] hover:rounded-md w-full disable ${hiddenModel ? 'bg-[#171717] rounded-md' : ''}`} >
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
        <div className="w-px min-h-screen bg-white opacity-30"></div>
      </section>
    </nav>
  );
}

export default LeftSidebar;
