import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function RequirePermission({ viewId, children }) {
	const { user, loading, hasPermission } = useAuth();

	if (loading) return null; // or spinner
	if (!user) return <Navigate to="/login" replace />;
	if (viewId && !hasPermission(viewId)) return <Navigate to="/" replace />;

	return children;
}
