import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const PrivateRoute = () => {
	const { user, loading } = useAuth();

	if (loading) return <p>Loading...</p>; // or a spinner component

	return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;