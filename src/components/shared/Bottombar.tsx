import { bottombarLinks } from '@/constants';
import { Link, useLocation } from 'react-router-dom';

const Bottombar = () => {
  const { pathname } = useLocation();

  return (
    <section className="bottom-bar fixed bottom-0 left-0 w-full bg-gray-950 shadow-md py-2 md:hidden z-[900] ">
      <ul className="flex justify-around items-center text-xl">
        {bottombarLinks.map((link) => {
          const isActive = pathname === link.route;
          return (
            <li key={link.route} className={`bottombar-link group`}>
              <Link
                to={link.route}
                className={`flex flex-col items-center p-2 transition-all ${isActive ? 'bg-purple-800 rounded-xl' : ''}`}
              >
                <img
                  src={link.imgURL}
                  alt={link.label}
                  className={`w-6 h-6 ${isActive ? 'filter invert brightness-0' : ''} group-hover:filter group-hover:invert group-hover:brightness-0`}
                />
                <p className="text-gray-400 text-sm">{link.label}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Bottombar;
