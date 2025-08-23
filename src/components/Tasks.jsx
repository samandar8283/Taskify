import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy, doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";

export default function Tasks({ onShowMessage }) {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [showDeleteTaskModal, setShowDeleteTaskModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    const [timeFilter, setTimeFilter] = useState("today");
    const [statusFilter, setStatusFilter] = useState("in progress");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [repeatFilter, setRepeatFilter] = useState("all");

    useEffect(() => {
        const q = query(
            collection(db, "tasks"),
            where("userId", "==", auth?.currentUser?.uid),
        );
        setLoading(true);
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = new Date();

            const updatedTasks = snapshot.docs.map(doc => {
                const data = doc.data();
                const deadline = data.deadline?.toDate ? data.deadline.toDate() : data.deadline ? new Date(data.deadline) : null;
                const isOverdue = deadline && deadline < now && data.status !== "completed";

                return {
                    id: doc.id,
                    ...data,
                    deadline,
                    isOverdue
                };
            });
            updatedTasks.sort((a, b) => {
                // 1. Completed bo‘lmaganlar oldinda
                if (a.status !== "completed" && b.status === "completed") return -1;
                if (a.status === "completed" && b.status !== "completed") return 1;

                // Agar ikkalasi ham completed bo‘lsa -> completedAt kamayuvchi
                if (a.status === "completed" && b.status === "completed") {
                    return b.completedAt.toDate().getTime() - a.completedAt.toDate().getTime();
                }

                // 2. Overdue bo‘lmaganlar oldinda
                if (a.isOverdue !== b.isOverdue) {
                    return a.isOverdue ? 1 : -1;
                }

                // 3. Agar ikkalasi ham overdue bo‘lmasa -> deadline o‘suvchi
                if (!a.isOverdue && !b.isOverdue) {
                    return new Date(a.deadline) - new Date(b.deadline);
                }

                // 4. Agar ikkalasi ham overdue bo‘lsa -> deadline kamayuvchi
                if (a.isOverdue && b.isOverdue) {
                    return new Date(b.deadline) - new Date(a.deadline);
                }

                return 0;
            });
            setTasks(updatedTasks);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const now = new Date();

        const filtered = tasks.filter(task => {
            let matchesTime = true;
            let matchesStatus = true;
            let matchesCategory = true;
            let matchesRepeat = true;

            // Time filter
            if (timeFilter === "today") {
                matchesTime = task.deadline?.toDateString() === now.toDateString();
            } else if (timeFilter === "upcoming") {
                matchesTime = task.deadline && task.deadline > now; //  && task.repeat === "none"
            } else if (timeFilter === "overdue") {
                if (statusFilter === "completed") {
                    matchesTime = task.deadline && task.completedAt && task.completedAt.toDate().getTime() > task.deadline.getTime();
                } else if (statusFilter === "all") {
                    matchesTime = task.deadline && (
                        (task.status === "completed" && task.completedAt && task.completedAt.toDate().getTime() > task.deadline.getTime()) ||
                        (task.status !== "completed" && task.deadline < now)
                    );
                } else {
                    matchesTime = task.deadline && task.deadline < now && task.status !== "completed";
                }
            }

            // Status filter
            if (statusFilter !== "all") {
                matchesStatus = task.status === statusFilter;
            }

            // Category filter
            if (categoryFilter !== "all") {
                matchesCategory = task.category === categoryFilter;
            }

            // Repeat filter
            if (repeatFilter !== "all") {
                matchesRepeat = task.repeat === repeatFilter;
            }
            return matchesTime && matchesStatus && matchesCategory && matchesRepeat;
        });

        setFilteredTasks(filtered);
    }, [timeFilter, statusFilter, categoryFilter, repeatFilter, tasks]);

    const [actionLoading, setActionLoading] = useState(null);

    const handleStatusToggle = async (taskId) => {
        try {
            setActionLoading(taskId);
            const taskRef = doc(db, "tasks", taskId);

            const taskSnap = await getDoc(taskRef);
            if (taskSnap.exists()) {
                const currentStatus = taskSnap.data().status;

                await updateDoc(taskRef, {
                    status: currentStatus === "completed" ? "in progress" : "completed",
                    completedAt: currentStatus === "completed" ? null : new Date(),
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="border-top border-3 pt-3">
            <h2 className="fs-3 fw-bold">Your Tasks</h2>
            <div className="filters row g-2">
                <div className="col-6 col-md-3">
                    <p className="mb-1 fw-bold">Time filter:</p>
                    <select className="form-select fs-6" value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
                        <option value="all">📅 All</option>
                        <option value="today">⏰ Today</option>
                        <option value="upcoming">🔜 Upcoming</option>
                        <option value="overdue">⚠️ Overdue</option>
                    </select>
                </div>
                <div className="col-6 col-md-3">
                    <p className="mb-1 fw-bold">Status filter:</p>
                    <select className="form-select fs-6" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="all">🟢 All</option>
                        <option value="in progress">⏳ In Progress</option>
                        <option value="completed">✅ Completed</option>
                    </select>
                </div>
                <div className="col-6 col-md-3">
                    <p className="mb-1 fw-bold">Category filter:</p>
                    <select className="form-select fs-6" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                        <option value="all">📂 All</option>
                        <option value="personal">👤 Personal</option>
                        <option value="study">📚 Study</option>
                        <option value="work">💼 Work</option>
                    </select>
                </div>
                <div className="col-6 col-md-3">
                    <p className="mb-1 fw-bold">Repeat filter:</p>
                    <select className="form-select fs-6" value={repeatFilter} onChange={e => setRepeatFilter(e.target.value)}>
                        <option value="all">📋 All</option>
                        <option value="none">1️⃣ One time</option>
                        <option value="daily">🔄 Daily</option>
                        <option value="weekly">7️⃣ Weekly</option>
                        <option value="monthly">🗓️ Monthly</option>
                        <option value="yearly">🎉 Yearly</option>
                    </select>
                </div>
            </div>

            <div className="mt-3 tasks">
                {loading ? (
                    <div className="alert alert-info text-center d-flex gap-2 justify-content-center align-items-center">
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <h2 className="fs-4 fw-bold d-inline-block m-0">
                            <span>Loading...</span>
                        </h2>
                    </div>
                ) : (
                    filteredTasks.length === 0 ? (
                        <div className="alert alert-info text-center d-flex gap-2 justify-content-center align-items-center">
                            <span className="fs-3">😊</span>
                            <span className="fs-5 fw-bold">No tasks found</span>
                        </div>
                    ) : (
                        filteredTasks.map(task => {
                            const categoryMap = {
                                personal: { title: "Personal", color: "purple", icon: "👨🏻‍💼" },
                                study: { title: "Study", color: "blue", icon: "📚" },
                                work: { title: "Work", color: "green", icon: "💼" },
                            };
                            const statusMap = {
                                inProgress: { title: "In progress", icon: "⏳" },
                                completed: { title: "Completed", icon: "✅" },
                            }
                            const repeatType = {
                                none: "",
                                daily: "Daily",
                                weekly: "Weekly",
                                monthly: "Monthly",
                                yearly: "Yearly"
                            }
                            const category = categoryMap[task.category] || { color: "gray", icon: "📂" };
                            const status = statusMap[task.status === "in progress" ? "inProgress" : "completed"];
                            return (
                                <div key={task.id} className={`task card p-3 pe-0 mb-3 shadow-sm ${task.status === "completed" ? "border-success bg-success-subtle bg-gradient" : task.isOverdue ? "border-danger bg-danger-subtle bg-gradient" : "border-primary bg-primary-subtle bg-gradient"}`}>
                                    <div className="row g-0 align-items-center">
                                        <div className="col-2 col-sm-1 fs-4">
                                            <input
                                                type="checkbox"
                                                className="form-check-input ms-0 ms-md-2"
                                                checked={task.status === "completed"}
                                                disabled={actionLoading === task.id}
                                                onChange={() => handleStatusToggle(task.id)}
                                            />
                                        </div>
                                        <div className="col-7 col-sm-9">
                                            <div className="fs-4 fw-bold d-flex lh-sm align-items-start align-items-sm-center justify-content-between flex-column flex-sm-row">
                                                <span className="mb-1">
                                                    {task.title}
                                                </span>
                                                <span className={`fs-6 badge p-1 p-sm-2 mb-1 border border-2 ${task.status === "completed" ? "border-success" : "border-warning"}`}>
                                                    {status.icon} {status.title}
                                                </span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                {task.completedAt && (
                                                    <div>
                                                        <div>
                                                            <small className={`mb-1 me-2 me-md-3 fw-bold d-inline-block-450 d-sm-block d-md-inline-block ${task.isOverdue ? "text-danger-emphasis" : "text-success-emphasis"}`}>
                                                                ✅ {new Date(task.completedAt.toDate()).toLocaleDateString()}
                                                            </small>
                                                            <small className={`mb-1 me-2 me-md-3 fw-bold d-block-400 d-sm-block d-md-inline-block ${task.isOverdue ? "text-danger-emphasis" : "text-success-emphasis"}`}>
                                                                ✅ {new Date(task.completedAt.toDate()).toLocaleTimeString([], {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                    hour12: false
                                                                })}
                                                            </small>
                                                            <small className={`mb-1 fw-bold bg-primary px-3 py-1 rounded ${task.repeat === "none" ? "d-none" : "d-block-450 d-sm-block d-md-inline-block "}`}>
                                                                {repeatType[task.repeat]}
                                                            </small>
                                                        </div>
                                                    </div>
                                                )}
                                                {!task.completedAt && (
                                                    <div>
                                                        <small className={`mb-1 me-2 me-md-3 fw-bold d-inline-block-450 d-sm-block d-md-inline-block ${task.isOverdue ? "text-danger-emphasis" : "text-success-emphasis"}`}>
                                                            📅 {new Date(task.deadline).toLocaleDateString()}
                                                        </small>
                                                        <small className={`mb-1 me-2 me-md-3 fw-bold d-block-400 d-sm-block d-md-inline-block ${task.isOverdue ? "text-danger-emphasis" : "text-success-emphasis"}`}>
                                                            ⏰ {new Date(task.deadline).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                                hour12: false
                                                            })}
                                                        </small>
                                                        <small className={`mb-1 fw-bold bg-primary px-3 py-1 rounded ${task.repeat === "none" ? "d-none" : "d-block-450 d-sm-block d-md-inline-block "}`}>
                                                            {repeatType[task.repeat]}
                                                        </small>
                                                    </div>
                                                )}
                                                <div className="d-none d-sm-block btns px-0 px-xl-4">
                                                    <button className="btn btn-sm btn-outline-primary me-2" disabled={task.status === "completed"} onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowEditTaskModal(true);
                                                    }}>✏️</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => {
                                                        setSelectedTask(task);
                                                        setShowDeleteTaskModal(true);
                                                    }}>🗑️</button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-3 col-sm-2 text-center">
                                            <span className="lh-sm fs-1 d-block">
                                                {category.icon}
                                            </span>
                                            <span className="lh-sm fs-6 d-block fw-semibold">
                                                {category.title}
                                            </span>
                                            <div className="px-0 d-block d-sm-none mt-2">
                                                <button className="btn btn-sm btn-outline-primary" disabled={task.status === "completed"} onClick={() => {
                                                    setSelectedTask(task);
                                                    setShowEditTaskModal(true);
                                                }}>✏️</button>
                                                <button className="btn btn-sm btn-outline-danger" onClick={() => {
                                                    setSelectedTask(task);
                                                    setShowDeleteTaskModal(true);
                                                }}>🗑️</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )
                )
                }
            </div>
            {showEditTaskModal && (
                <EditTaskModal
                    task={selectedTask}
                    onClose={() => setShowEditTaskModal(false)}
                    onShowMessage={onShowMessage}
                />
            )}
            {showDeleteTaskModal && (
                <DeleteTaskModal
                    task={selectedTask}
                    onClose={() => setShowDeleteTaskModal(false)}
                    onShowMessage={onShowMessage}
                />
            )}
        </div>
    );
}
