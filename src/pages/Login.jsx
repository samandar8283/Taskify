import { useState, useRef } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate, Link } from 'react-router-dom';

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [showResend, setShowResend] = useState(false);
    const [loading, setLoading] = useState(false);
    const formRef = useRef();
    const navigate = useNavigate();
    const handleLogin = async (e) => {
        e.preventDefault();
        const form = formRef.current;

        if(!form.checkValidity()) {
            form.classList.add("was-validated");
            setMessage("Please fill in all required fields.");
            setMessageType("danger");

            setTimeout(() => {
                setMessage("");
                setMessageType("");
            }, 3000);
            return;
        }
        if (password.length < 6) {
            setMessage("Password must be at least 6 characters.");
            setMessageType("danger");
            setTimeout(() => {
                setMessage("");
                setMessageType("");
            }, 3000);
            return;
        }
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if(!user.emailVerified) {
                setMessage("Please verify your email before logging in.");
                setMessageType("warning");
                setShowResend(true);
                return;
            }
            setMessage('Login successful!');
            setMessageType('success');
            setEmail("");
            setPassword("");
            form.classList.remove("was-validated");
            form.reset();
            setTimeout(() => {
                setMessage("");
                setMessageType("");
                navigate('/dashboard');
            }, 1000);
        } catch (error) {
            setMessage(error.message);
            setMessageType("danger");
            console.error(error);
            setTimeout(() => {
                setMessage("");
                setMessageType("");
            }, 3000);
        } finally {
            setLoading(false);
        }
    }
    const handleResendVerification = async () => {
        try {
            if (auth.currentUser && !auth.currentUser.emailVerified) {
                await sendEmailVerification(auth.currentUser);
                setMessage("Verification email sent. Please check your inbox.");
                setMessageType("info");
                setShowResend(false);
                setTimeout(() => setMessage(""), 4000);
            }
        } catch (error) {
            setMessage("Failed to resend verification email.");
            setMessageType("danger");
            console.error(error);
            setTimeout(() => setMessage(""), 3000);
        }
    };
    return (
        <div className='login auth same-styles'>
            <h2 className='text-center fs-1 fw-bold mb-4'>Login</h2>
            <form ref={formRef} onSubmit={handleLogin} noValidate className='row g-3 needs-validation'>
                <div className="col-12">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input className='form-control' type="email" name="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="col-12">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input className='form-control' type="password" minLength='6' name="password" id="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className='col-12 text-center mt-5'>
                    <button className='btn auth-btn px-5 fw-bold w-100' type='submit' disabled={loading}>
                        {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Sign in"}
                    </button>
                </div>
                <div className="col-12 text-center">
                    Don't have an account? <Link to={"/signup"} className='ms-3 text-decoration-none fw-bold'>Register</Link>
                </div>
                <div className="message text-center">
                    {
                        message && (
                            <div className={`px-4 alert alert-${messageType}`} role='alert'>
                                {message}
                            </div>
                        )
                    }
                </div>
                {showResend && (
                    <button className="btn btn-link text-warning fw-bold mt-2" type="button" onClick={handleResendVerification}>
                        Resend Verification Email
                    </button>
                )}
            </form>
        </div>
    )
}

export default Login
