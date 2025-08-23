import { useAuth } from "../context/AuthContext";
import { sendEmailVerification, signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";

function VerifyEmail() {
    const { currentUser } = useAuth();
    console.log(currentUser);
    console.log("salom");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const navigate = useNavigate();
    const handleResend = async () => {
        try {
            await sendEmailVerification(currentUser);
            setMessage("Verification email has been resent. Please check your inbox.");
            setMessageType("success");
            setTimeout(() => {
                setMessage("");
                setMessageType("");
            }, 5000);
        } catch (error) {
            console.error(error);
            setMessage("Error resending verification email.");
            setMessageType("danger");
            setTimeout(() => {
                setMessage("");
                setMessageType("");
            }, 5000);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };
    console.log(currentUser)
    if (currentUser && !currentUser.emailVerified) {
        return (
            <div className="verify-email card mx-auto" style={{ maxWidth: "500px" }}>
                <div className="card-body text-center">
                    <h3 className="mb-3 fw-bold">Verify Your Email</h3>
                    <p className="fw-semibold">
                        We've sent a verification link to <strong>{currentUser?.email}</strong>. <br />
                        Please verify your email to access the dashboard. <br />
                        ⚠️ If you don't see the email in your inbox, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.
                    </p>
                    <div className="message text-center">
                        {
                            message && (
                                <div className={`px-4 alert alert-${messageType}`} role='alert'>
                                    {message}
                                </div>
                            )
                        }
                    </div>
                    <button className="btn btn-primary mt-3 w-100" onClick={handleResend}>
                        Resend Verification Email
                    </button>
                    <button className="btn btn-outline-danger mt-2 w-100" onClick={handleLogout}>
                        Login
                    </button>
                </div>
            </div>
        );
    } else if (currentUser && currentUser.emailVerified) {
        return (
            <div className="verify-email card mx-auto" style={{ maxWidth: "500px" }}>
                <div className="card-body text-center">
                    <h3 className="mb-3">Verify Your Email</h3>
                    <p className="fw-semibold">
                        Your email <strong>{currentUser.email}</strong> has been successfully verified. <br />
                        You can now access your dashboard.
                    </p>
                    <div className="message text-center">
                        {
                            message && (
                                <div className={`px-4 alert alert-${messageType}`} role='alert'>
                                    {message}
                                </div>
                            )
                        }
                    </div>
                    <Link to="/dashboard" className="btn btn-success mt-3 w-100">
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        );
    } else {
        return <Navigate to="/login" replace />
    }
};

export default VerifyEmail;