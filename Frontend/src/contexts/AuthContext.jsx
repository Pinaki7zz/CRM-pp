import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	const refreshSession = async () => {
		try {
			console.log("Attempting to refresh session...");

			const response = await fetch(`${BASE_URL_UM}/auth/refresh-token`, {
				method: "POST",
				credentials: "include", // ✅ send cookies
			});

			if (response.ok) {
				console.log("Session refreshed successfully");
				const data = await response.json();
				setUser(data.user); // 👈 store user info in context
			} else {
				console.log("No active session found");
				setUser(null);
			}
		} catch (err) {
			console.error("Auto refresh failed:", err);
			toast.error("Auto refresh failed");
			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	const hasPermission = (viewId) => {
		if (!user || !user.businessRole?.permissions) return false;
		return user.businessRole?.permissions.includes(viewId);
	};

	// Automatically try login on app start
	useEffect(() => {
		refreshSession();
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, loading, hasPermission }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
