import React, { createContext, useContext, useState, useEffect} from "react" ;
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);
    const checkAuthStatus = async()=>{
        try{
            const token = localStorage.getItem("token");
            const userStr = localStorage.getItem("user");
            if(token && userStr){
                const userData = JSON.parse(userStr);
                setUser(userData);
                setIsAuthenticated(true);
            }
        }catch(error){
            console.error("Auth check failed:", error);
            logout();

        }finally{
            setLoading(false);
        }

    };

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setIsAuthenticated
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        winndow.location.href = "/";
    };
    const updateUser = (updatedUserData) => {
        setUser(updatedUserData);
        const newUserData = { ...user, ...updatedUserData };
        localStorage.setItem("user", JSON.stringify(newUserData));
    }

    const value = {
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        checkAuthStatus,
        updateUser
    };


    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
    if(!context){
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context ;
};
