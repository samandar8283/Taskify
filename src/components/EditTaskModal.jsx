import { useState, useRef } from "react";
import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function EditTaskModal({ task, onClose, onShowMessage }) {
    const [title, setTitle] = useState(task.title);
    const [category, setCategory] = useState(task.category);
    const [repeat, setRepeat] = useState(task.repeat);
    const toLocalDateTime = (date) => {
        const local = new Date(date);
        local.setMinutes(local.getMinutes() - local.getTimezoneOffset());
        return local.toISOString().slice(0, 16);
    };
    const getDefaultDeadline = () => {
        const now = new Date();
        return toLocalDateTime(now);
    };
    const [deadline, setDeadline] = useState(toLocalDateTime(task.deadline));
    const [loading, setLoading] = useState(false);
    const formRef = useRef();

    const handleEditTask = async (e) => {
        e.preventDefault();
        const form = formRef.current;
        if (!form.checkValidity()) {
            form.classList.add("was-validated");
            onShowMessage("Please fill in all required fields.", "danger");
            return;
        }
        setLoading(true);
        const adjustDeadline = (selectedTime) => {
            const now = new Date();
            const deadline = new Date(selectedTime);
            if (deadline <= task.createdAt.toDate()) {
                onShowMessage("Deadline must be later than the creation date!", "danger");
                return null;
            }
            return deadline;
        };
        try {
            const finalDeadline = deadline ? adjustDeadline(deadline) : null;
            if (!finalDeadline) return;

            const taskRef = doc(db, "tasks", task.id);
            await updateDoc(taskRef, {
                title,
                category,
                repeat,
                deadline: finalDeadline,
                status: task.status,
                updatedAt: serverTimestamp(),
            });

            onShowMessage("Task edited successfully!", "success");
            onClose();
        } catch (err) {
            onShowMessage("Error editing task! Please try again.", "danger");
            console.error("Error editing task:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="task-modal-container">
            <div className="task-modal">
                <h3 className="fs-3 fw-bold mb-3">Edit Task</h3>
                <form ref={formRef} className="row g-3 needs-validation" noValidate onSubmit={handleEditTask}>
                    <div className="col-12">
                        <input className="form-control" type="text" placeholder="Task title..." value={title} onChange={(e) => setTitle(e.target.value)} required />
                    </div>
                    <div className="col-12">
                        <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="personal">Personal</option>
                            <option value="study">Study</option>
                            <option value="work">Work</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <select className="form-select" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
                            <option value="none">One time</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <input className="form-control" type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
                    </div>
                    <div className="col-12">
                        <p className="mb-2">Created at</p>
                        <input className="form-control" type="datetime-local" disabled value={toLocalDateTime(task.createdAt.toDate())} onChange={(e) => setDeadline(e.target.value)} required />
                    </div>
                    <div className="col-6 text-center">
                        <button className="btn btn-danger w-100" onClick={onClose} type="button">Cancel</button>
                    </div>
                    <div className="col-6 text-center">
                        <button className="btn btn-warning w-100" disabled={loading} type="submit">
                            {loading ? <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> : "Edit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}