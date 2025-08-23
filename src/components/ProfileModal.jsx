import { useState, useRef } from "react";
import { doc, deleteDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function ProfileModal({ onClose, onShowMessage, currentUser, userData }) {
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [name, setName] = useState(userData.name);
    const [password, setPassword] = useState("");
    const formRef = useRef();
    const formDeleteRef = useRef();

    const toLocalDateTime = (date) => {
        const local = new Date(date);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0, 16);
    };
    const handleDeleteProfile = async () => {
        const form = formDeleteRef.current;
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            onShowMessage("Please enter your password correctly.", "danger");
            return;
        }

        setDeleteLoading(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email, password);
            await reauthenticateWithCredential(auth.currentUser, credential);

            const tasksRef = collection(db, "tasks");
            const q = query(tasksRef, where("uid", "==", currentUser.uid));
            const querySnapshot = await getDocs(q);
            const deletePromises = querySnapshot.docs.map((taskDoc) => deleteDoc(taskDoc.ref));
            await Promise.all(deletePromises);

            const userRef = doc(db, "users", currentUser.uid);
            await deleteDoc(userRef);

            await deleteUser(auth.currentUser);

            onShowMessage("User and related tasks deleted successfully!", "success");
            onClose();
        } catch (err) {
            console.error(err);
            onShowMessage("Incorrect password or login expired. Please try again.", "danger");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEditProfile = async () => {
        const form = formRef.current;
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            onShowMessage("Please fill in all required fields.", "danger");
            return;
        }
        setEditLoading(true);
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, { name });

            onShowMessage("Profile edited successfully!", "success");
            onClose();
        } catch (err) {
            onShowMessage("Error editing profile!", "danger");
            console.error("Error editing profile:", err);
        } finally {
            setEditLoading(false);
        }
    };

    return (
        <div className="task-modal-container">
            {!showDeleteModal && (
                <div className="task-modal">
                    <h3 className="fs-3 fw-bold mb-3">User Profile</h3>
                    <form ref={formRef} className="row g-3 needs-validation" noValidate>
                        <div className="col-12">
                            <label htmlFor="name" className="form-label">Name</label>
                            <input
                                id="name"
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="email" className="form-label">Email</label>
                            <input
                                id="email"
                                type="text"
                                className="form-control"
                                defaultValue={userData.email}
                                disabled
                            />
                        </div>
                        <div className="col-12">
                            <label htmlFor="joinedOn" className="form-label">Joined On</label>
                            <input id="joinedOn" className="form-control" type="datetime-local" value={toLocalDateTime(userData.createdAt.toDate())} disabled />
                        </div>
                        <div className="col-6 text-center">
                            <button className="btn btn-danger w-100" onClick={onClose} type="button">
                                Cancel
                            </button>
                        </div>
                        <div className="col-6 text-center">
                            <button className="btn btn-warning w-100" disabled={editLoading} type="button" onClick={handleEditProfile}>
                                {editLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    "Edit"
                                )}
                            </button>
                        </div>
                        <div className="col-12 text-center">
                            <button className="btn btn-primary w-100" disabled={deleteLoading} type="button" onClick={() => { setShowDeleteModal(true) }}>
                                {deleteLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    "Delete Account"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
            {showDeleteModal && (
                <div className="task-modal">
                    <h3 className="fs-3 fw-bold mb-3">Delete Profile</h3>
                    <form ref={formDeleteRef} className="row g-3 needs-validation" noValidate>
                        <div className="col-12">
                            <p className="alert alert-info mb-0">Please enter your password to delete your accaunt!</p>
                        </div>
                        <div className="col-12">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                id="password"
                                type="text"
                                className="form-control"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength='6'
                                required
                            />
                        </div>
                        <div className="col-12">
                            <p className="alert alert-warning mb-0">
                                ⚠️ Are you sure you want to delete your profile? This action <strong>cannot be undone</strong>. <br />
                                All your <strong>tasks will also be permanently deleted</strong>.
                            </p>
                        </div>
                        <div className="col-6 text-center">
                            <button className="btn btn-danger w-100" onClick={() => { setShowDeleteModal(false) }} type="button">
                                Cancel
                            </button>
                        </div>
                        <div className="col-6 text-center">
                            <button className="btn btn-primary w-100" disabled={deleteLoading} type="button" onClick={handleDeleteProfile}>
                                {deleteLoading ? (
                                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                ) : (
                                    "Delete Account"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
