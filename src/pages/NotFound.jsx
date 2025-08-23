import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div className="d-flex align-items-center justify-content-center min-vh-100">
            <div className="text-center p-4 p-sm-0">
                <img src="/generals/page-not-found.svg" alt="404 illustration" className="mb-4" style={{ maxWidth: "300px" }} />
                <p className="fs-3">
                    😕 <span className="text-danger">Oops!</span> We couldn’t find that page.
                </p>
                <p className="lead">
                    The page you’re looking for might have been removed,<br /> had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/" className="btn btn-primary d-inline-flex align-items-center gap-2 px-4 py-2">
                    <i className="bi bi-house-door-fill"></i> Go Home
                </Link>
            </div>
        </div>
    );
}

export default NotFound;