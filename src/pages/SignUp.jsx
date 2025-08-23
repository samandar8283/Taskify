import { useState, useRef } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from "./../firebase/config";

function SignUp() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);
    const formRef = useRef();
    const navigate = useNavigate();
    const handleSignUp = async (e) => {
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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name,
                email: email,
                createdAt: new Date()
            });
            setMessage("Registration successful! Please check your email to verify.");
            setMessageType("success");
            setName("");
            setEmail("");
            setPassword("");
            form.classList.remove("was-validated");
            form.reset();
            setTimeout(() => {
                setMessage("");
                setMessageType("");
                navigate("/verify-email");
            }, 3000);
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
    return (
        <div className='signup auth same-styles'>
            <h2 className='text-center fs-1 fw-bold mb-4'>Registration</h2>
            <form ref={formRef} onSubmit={handleSignUp} noValidate className='row g-3 needs-validation'>
                <div className="col-12">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input className='form-control' type="name" name="name" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
                </div>
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
                        {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Sign up"}
                    </button>
                </div>
                <div className="col-12 text-center">
                    Already have an account? <Link to={"/login"} className='ms-3 text-decoration-none fw-bold'>Login</Link>
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
            </form>
        </div>
    )
}

export default SignUp
