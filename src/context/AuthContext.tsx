import { getCurrentAccount } from '@/lib/appwrite/api';
import { IUser } from '@/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react-refresh/only-export-components
export const INITIAL_USER: IUser = {
    id: '',
    name: '',
    email: '',
    username: '',
    imageUrl: '',
    bio: '',
};

interface IContextType {
    id: any;
    user: IUser;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: IUser) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    checkAuthUser: () => Promise<boolean>;
}

const INITIAL_STATE: IContextType = {
    user: INITIAL_USER,
    isAuthenticated: false, // Default false to avoid showing protected content temporarily
    isLoading: false,
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false,
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const navigate = useNavigate();

    const checkAuthUser = async () => {
        setIsLoading(true);
        try {
            console.log("Checking authentication...");
            const currentAccount = await getCurrentAccount();
            console.log("Current Account:", currentAccount);
    
            if (currentAccount && '$id' in currentAccount) {
                const userData = {
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    email: currentAccount.email,
                    username: currentAccount.username || '',
                    imageUrl: currentAccount.imageUrl || '',
                    bio: currentAccount.bio || '',
                };
    
                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData)); // ✅ Store in localStorage
    
                return true;
            }
        } catch (error) {
            console.error("Auth Error in checkAuthUser:", error);
            setIsAuthenticated(false);
            localStorage.removeItem('user'); // Clear storage if auth fails
        } finally {
            setIsLoading(false);
        }
        return false;
    };
    

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const cookieFallback = localStorage.getItem('cookieFallback');
        const isOnSignupPage = window.location.pathname === '/sign-up';
    
        if (storedUser) {
            setUser(JSON.parse(storedUser)); // ✅ Restore user from localStorage
            setIsAuthenticated(true);
        } else if (!isOnSignupPage && (!cookieFallback || cookieFallback === '[]')) {
            checkAuthUser().then((isLoggedIn) => {
                if (!isLoggedIn) navigate('/sign-in');
            });
        }
    }, [navigate]);    
    

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, setUser, setIsAuthenticated, checkAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

//  Export a custom hook for easy access to AuthContext
// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = () => useContext(AuthContext);
