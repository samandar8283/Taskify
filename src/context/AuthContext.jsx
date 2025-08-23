import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true); // loading tugamaguncha sahifa ko‘rsatilmasin

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 🔑 Har safar user yangilansa serverdan qayta reload qilamiz
                await user.reload();
                setCurrentUser({ ...auth.currentUser }); // yangi reference bilan update
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe(); // clean-up
    }, []);

    return (
        <AuthContext.Provider value={{ currentUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
