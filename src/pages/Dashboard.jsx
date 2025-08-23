import { useAuth } from "../context/AuthContext";
import Tasks from "../components/Tasks";
import AddTaskModal from "../components/AddTaskModal";
import ProfileModal from "../components/ProfileModal";
import { auth, db } from "../firebase/config";
import { signOut, deleteUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [userData, setUserData] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const navigate = useNavigate();
    useEffect(() => {
        const fetchUserData = async () => {
            if (currentUser) {
                const userDocRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userDocRef);

                if (userSnap.exists()) {
                    setUserData(userSnap.data());
                } else {
                    console.log("User document not found in Firestore");
                }
            }
        };

        fetchUserData();
    }, [currentUser]);

    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };
    const handleShowMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    }
    if (userData) {
        return (
            <div className="row">
                <div className="dashboard same-styles position-relative">
                    <div className="text-end">
                        <button className="btn btn-primary me-3" onClick={() => setShowProfileModal(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-person-square" viewBox="0 0 16 16">
                                <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                                <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1v-1c0-1-1-4-6-4s-6 3-6 4v1a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1z" />
                            </svg>
                        </button>
                        <button className="btn btn-danger" onClick={handleLogout}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-box-arrow-right" viewBox="0 0 16 16">
                                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z" />
                                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-3">
                        <h2 className="fw-bold fs-1">Welcome, {userData.name}</h2>
                        <button className="add-btn btn p-0 position-absolute" onClick={() => setShowAddModal(true)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                            </svg>
                        </button>
                    </div>
                    <div className="mt-3">
                        <Tasks onShowMessage={handleShowMessage} />
                        {showAddModal && (
                            <>
                                <AddTaskModal onClose={() => setShowAddModal(false)} onShowMessage={handleShowMessage} />
                            </>
                        )}
                        {showProfileModal && (
                            <>
                                <ProfileModal onClose={() => setShowProfileModal(false)} onShowMessage={handleShowMessage} currentUser={currentUser} userData={userData} />
                            </>
                        )}
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
                </div>
            </div>
        )
    }
    else {
        return (
            <div className="dashboard same-styles text-center d-flex align-items-center justify-content-center">
                <div>
                    <span className="spinner-border me-3 fw-normal" role="status" aria-hidden="true"></span>
                    <h2 className="fw-bold d-inline-block">
                        <span>Loading...</span>
                    </h2>
                </div>
            </div>
        )
    }
};

export default Dashboard;
