import { useState } from "react";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function DeleteTaskModal({ task, onClose, onShowMessage }) {
    const toLocalDateTime = (date) => {
        const local = new Date(date);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0, 16);
    };

    const [loading, setLoading] = useState(false);

    const handleDeleteTask = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const taskRef = doc(db, "tasks", task.id);
            await deleteDoc(taskRef);

            onShowMessage("Task deleted successfully!", "success");
            onClose();
        } catch (err) {
            onShowMessage("Error deleting task! Please try again.", "danger");
            console.error("Error deleting task:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="task-modal-container">
            <div className="task-modal">
                <h3 className="fs-3 fw-bold mb-3">Delete Task</h3>
                <form className="row g-3 needs-validation" noValidate onSubmit={handleDeleteTask}>
                    <div className="col-12 fw-bold fs-5">
                        <div className="card px-3 py-2">
                            <p><span className="text-danger d-inline-block">Title:</span> <span className="text-success">{task.title}</span></p>
                            <p><span className="text-danger d-inline-block">Category:</span> <span className="text-success">{task.category}</span></p>
                            <p><span className="text-danger d-inline-block">Repeat:</span> <span className="text-success">{task.repeat}</span></p>
                            <p className="mb-0"><span className="text-danger d-inline-block">Deadline:</span> <span className="text-success">{toLocalDateTime(task.deadline).replace("T"," ")}</span></p>
                        </div>
                    </div>
                    <div className="col-12">
                        <p className="alert alert-warning">
                            ⚠️ Are you sure you want to delete this task? This action cannot be undone.
                        </p>
                    </div>
                    <div className="col-6 text-center">
                        <button className="btn btn-danger w-100" onClick={onClose} type="button">
                            Cancel
                        </button>
                    </div>
                    <div className="col-6 text-center">
                        <button className="btn btn-primary w-100" disabled={loading} type="submit">
                            {loading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                "Delete"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}