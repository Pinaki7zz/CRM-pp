import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css"; // Make sure your styles are moved to this file
import gal_logo1 from "../../assets/gal_logo1.png"; // Adjust the path as necessary
import image from "../../assets/image.png";
import { useAuth } from "../../contexts/AuthContext";
import { User, Lock, Eye, EyeOff } from "lucide-react"; // Importing icons from lucide-react
import { toast } from "react-toastify";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const Login = () => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		password: "",
		rememberMe: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const navigate = useNavigate();
	const { setUser } = useAuth(); // ⬅️ get setUser from context

	const togglePassword = () => {
		setPasswordVisible(!passwordVisible);
	};

	const handleChange = (e) => {
		const { id, value, checked, type } = e.target;

		// Clear error on any input change
		if (error) setError("");

		setFormData({
			...formData,
			[id]: type === "checkbox" ? checked : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const response = await fetch(`${BASE_URL_UM}/auth/login`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // ⬅️ for sending cookies like refreshToken
				body: JSON.stringify({
					username: formData.username, // assuming username field is used for username
					password: formData.password,
					rememberMe: formData.rememberMe,
				}),
			});

			const data = await response.json();
			console.log("Login error:", data);
			if (!response.ok) {
				if (data.errors) {
					setError(data.errors[0].msg);
					setFormData({
						username: "",
						password: "",
						rememberMe: false,
					});
					return;
				} else {
					toast.error(data.message || "Login failed");
					setFormData({
						username: "",
						password: "",
						rememberMe: false,
					});
					return;
				}
			}

			// ✅ Save user to context
			setUser(data.user); // <-- this is the fix!

			toast.success("Login successful!");
			navigate("/"); // 👈 redirect after login
		} catch (err) {
			console.error("Login error:", err);
			toast.error("Something went wrong during login");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="main-container">
			<div className="login-card">
				{/* Left Panel */}
				<div className="left-panel1">
					{/* Logo */}
					<div className="logo">
						<img
							src={gal_logo1}
							alt="Logo"
							className="logo-image"
						/>
					</div>

					{/* Login Form */}
					<h2 className="form-title montserrat">Login</h2>

					{/* Error message if error occurs in form */}
					{error && <div className="error-box">{error}</div>}

					<form onSubmit={handleSubmit}>
						{/* Username Input */}
						<div className="form-group1">
							<div className="input-container-123 montserrat">
								<User
									className="input-icon icon"
									size={20}
									strokeWidth={1.8}
								/>
								<input
									type="text"
									id="username"
									className="form-input-123"
									placeholder="Enter Your Username"
									value={formData.username}
									onChange={handleChange}
									autoComplete="username"
								/>
							</div>
						</div>

						{/* Password Input */}
						<div className="form-group1">
							<div className="input-container-123">
								<Lock
									className="input-icon icon"
									size={20}
									strokeWidth={1.8}
								/>
								<input
									type={passwordVisible ? "text" : "password"}
									id="password"
									className="form-input-123"
									placeholder="Enter Your Password"
									value={formData.password}
									onChange={handleChange}
									autoComplete="current-password"
								/>
								<button
									type="button"
									className="password-toggle"
									onClick={togglePassword}
								>
									{passwordVisible ? (
										<EyeOff size={20} strokeWidth={1.8} />
									) : (
										<Eye size={20} strokeWidth={1.8} />
									)}
								</button>
							</div>
						</div>

						{/* Remember Me & Forgot Password */}
						<div className="form-row1">
							<label className="checkbox-container">
								<input
									type="checkbox"
									id="rememberMe"
									className="checkbox"
									checked={formData.rememberMe}
									onChange={handleChange}
								/>
								<span className="checkbox-label montserrat">
									Remember me
								</span>
							</label>
							<Link
								className="forgot-link montserrat"
								to="/reset"
							>
								<i>Forgot Password?</i>
							</Link>
						</div>

						{/* Login Button */}
						<button
							type="submit"
							className="login-btn montserrat"
							disabled={loading} // ✅ Disable while loading
						>
							{loading ? "Logging in..." : "Log In"}
						</button>

						{/* Sign Up */}
						<p className="signup-text montserrat">
							Haven't registered yet?{" "}
							<Link
								className="signup-link montserrat"
								to="/signup"
							>
								Sign Up
							</Link>
						</p>
					</form>
				</div>

				{/* Right Panel (Illustration & Info) */}
				<div className="right-panel1">
					<div className="right-panel-content">
						<h2 className="content-header montserrat">
							<i>Login</i>
						</h2>
						<p className="content-text montserrat">
							<i>
								Lorem ipsum dolor, sit amet consectetur
								adipisicing elit. Repellat omnis dicta ad vel
								odit at sed fugiat, labore eius ex.
							</i>
						</p>
					</div>
					<img src={image} alt="deco-image" className="deco-image" />
				</div>
			</div>

			{/* Footer (optional: separate component) */}
			<footer className="footer">
				{/* Footer content copied from HTML version */}
			</footer>
		</div>
	);
};

export default Login;
