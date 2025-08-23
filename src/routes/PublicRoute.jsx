import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PublicRoute = ({ children }) => {
    const { currentUser } = useAuth();
    if(currentUser) {
        if(currentUser.emailVerified) {
            return <Navigate to="/dashboard" replace />
        }
        else {
            return <Navigate to="/verify-email" replace />
        }
    }
    return children;
};

export default PublicRoute;