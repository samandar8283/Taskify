import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";

function App() {
    const location = useLocation();
    const colClass = location.pathname === "/dashboard" ? "col-sm-10 col-lg-9 col-xl-7" : "col-sm-8 col-lg-5";
    return (
        <div className="row min-vh-100 align-items-center justify justify-content-center m-0">
            <div className={colClass}>
                <Routes>
                    <Route path="/" element={
                        <PublicRoute><Login /></PublicRoute>
                    } />;
                    <Route path="/signup" element={
                        <PublicRoute><SignUp /></PublicRoute>
                    } />
                    <Route path="/login" element={
                        <PublicRoute><Login /></PublicRoute>
                    } />
                    <Route path="/verify-email" element={
                        <VerifyEmail />
                    } />
                    <Route path="/dashboard" element={
                        <PrivateRoute><Dashboard /></PrivateRoute>
                    } />
                    <Route path="*" element={<NotFound />} />;
                </Routes>
            </div>
        </div>
    );
}

export default App;
