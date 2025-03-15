import { getCurrentAccount } from '@/lib/appwrite/api';
import { IUser } from '@/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

// Initial blank user
export const INITIAL_USER: IUser = {
    id: '',
    name: '',
    email: '',
    username: '',
    imageUrl: '',
    bio: '',
    $id:''
};

interface IContextType {
    id: unknown;
    user: IUser;
    isAuthenticated: boolean;
    isLoading: boolean;
    setUser: (user: IUser) => void;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    checkAuthUser: () => Promise<boolean>;
}

const INITIAL_STATE: IContextType = {
    user: INITIAL_USER,
    isAuthenticated: false,
    isLoading: false,
    setUser: () => {},
    setIsAuthenticated: () => {},
    checkAuthUser: async () => false,
    id: undefined,
};

export const AuthContext = createContext<IContextType>(INITIAL_STATE);

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<IUser>(INITIAL_USER);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    const checkAuthUser = async () => {
        setIsLoading(true);
        try {
            console.log("Checking authentication...");
            const currentAccount = await getCurrentAccount();
            console.log("Current Account:", currentAccount);

            if (currentAccount && '$id' in currentAccount) {
                const userData: IUser = {
                    id: currentAccount.$id,
                    name: currentAccount.name,
                    email: currentAccount.email,
                    username: currentAccount.username || '',
                    imageUrl: currentAccount.imageUrl || '',
                    bio: currentAccount.bio || '',
                    $id: ''
                };

                setUser(userData);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userData)); // store locally
                return true;
            }
        } catch (error) {
            console.error("Auth Error in checkAuthUser:", error);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
        return false;
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const isOnSignupPage = window.location.pathname === '/sign-up';

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setIsLoading(false);
        } else {
            checkAuthUser().then((isLoggedIn) => {
                if (!isLoggedIn && !isOnSignupPage) {
                    navigate('/sign-in');
                }
            });
        }
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ id: undefined, user, isAuthenticated, isLoading, setUser, setIsAuthenticated, checkAuthUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

// Export custom hook
export const useUserContext = () => useContext(AuthContext);
