import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css"; // Make sure your styles are moved to this file
import gal_logo1 from "../../assets/gal_logo1.png"; // Adjust the path as necessary
import image from "../../assets/image.png";
import { useAuth } from "../../contexts/AuthContext";
import { User, Lock, Eye, EyeOff } from "lucide-react"; // Importing icons from lucide-react
import { toast } from "react-toastify";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const Signup = () => {
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [formData, setFormData] = useState({
		username: "",
		tempPassword: "",
		password: "",
		confirmPassword: "",
		termsAccepted: false,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const navigate = useNavigate();
	const { setUser } = useAuth(); // ⬅️ get setUser from context

	const togglePassword = () => {
		setPasswordVisible(!passwordVisible);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			setError("Password confirmation does not match password");
			return;
		}
		setLoading(true);

		try {
			const payload = {
				username: formData.username.trim(),
				tempPassword: formData.tempPassword,
				password: formData.password,
				termsAccepted: formData.termsAccepted,
			};

			const response = await fetch(`${BASE_URL_UM}/auth/register`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include", // Only needed if backend sets cookies immediately
				body: JSON.stringify(payload),
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors) {
					setError(data.errors[0].msg);
					console.log(data.errors[0].msg);
					setFormData({
						username: "",
						tempPassword: "",
						password: "",
						confirmPassword: "",
						termsAccepted: false,
					});
					return;
				} else {
					if (data.message) {
						toast.error(data.message);
					} else {
						toast.error("Sign Up failed");
					}
					setFormData({
						username: "",
						tempPassword: "",
						password: "",
						confirmPassword: "",
						termsAccepted: false,
					});
					return;
				}
			}

			// ✅ Save user to context
			setUser(data.user); // <-- this is the fix!

			toast.success("Sign Up successful!");
			navigate("/"); // 👈 redirect after login
		} catch (err) {
			toast.error("Something went wrong. Please try again.");
			console.error(err);
		} finally {
			setLoading(false);
		}
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
					<h2 className="form-title montserrat">Register</h2>

					{/* Error message if error occurs in form */}
					{error && <div className="error-box">{error}</div>}

					<form onSubmit={handleSubmit}>
						{/* Username Input */}
						<div className="form-group1">
							<div className="input-container-123">
								<User
									className="input-icon icon"
									size={20}
									strokeWidth={1.8}
								/>
								<input
									type="text"
									id="username"
									className="form-input-123 montserrat"
									placeholder="Enter Your Username"
									value={formData.username}
									onChange={handleChange}
								/>
							</div>
						</div>

						{/* Email Input */}
						<div className="form-group1">
							<div className="input-container-123">
								<Lock
									className="input-icon icon"
									size={20}
									strokeWidth={1.8}
								/>
								<input
									type="password"
									id="tempPassword"
									className="form-input-123 montserrat"
									placeholder="Enter Temporary Password"
									value={formData.tempPassword}
									onChange={handleChange}
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
									className="form-input-123 montserrat"
									placeholder="Enter New Password"
									value={formData.password}
									onChange={handleChange}
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

						{/* Confirm Password Input */}
						<div className="form-group1">
							<div className="input-container-123">
								<Lock
									className="input-icon icon"
									size={20}
									strokeWidth={1.8}
								/>
								<input
									type="password"
									id="confirmPassword"
									className="form-input-123 montserrat"
									placeholder="Confirm New Password"
									value={formData.confirmPassword}
									onChange={handleChange}
								/>
								{/* <button
									type="button"
									className="password-toggle"
									onClick={togglePassword}
								>
									{passwordVisible ? (
										<EyeOff size={20} strokeWidth={1.8} />
									) : (
										<Eye size={20} strokeWidth={1.8} />
									)}
								</button> */}
							</div>
						</div>

						{/* Terms and Conditions */}
						<div className="form-row1">
							<label className="checkbox-container">
								<input
									type="checkbox"
									id="termsAccepted"
									className="checkbox"
									checked={formData.termsAccepted}
									onChange={handleChange}
								/>
								<span className="checkbox-label montserrat">
									I agree to the Terms & Conditions and
									Privacy Policy
								</span>
							</label>
						</div>

						{/* Login Button */}
						<button
							type="submit"
							className="signup-btn montserrat"
							disabled={loading} // ✅ Disable while loading
						>
							{loading ? "Signing up..." : "Sign Up"}
						</button>

						{/* Login if already have an account */}
						<div className="form-row montserrat">
							Already have an account?{" "}
							<Link
								className="forgot-link montserrat"
								to="/login"
							>
								<i>Login here</i>
							</Link>
						</div>

						{/* Divider */}
						{/* <div className="divider1">
							<span className="divider-text montserrat">or</span>
						</div> */}

						{/* Google Login */}
						{/* <button
							type="button"
							className="google-btn montserrat"
							onClick={handleGoogleLogin}
						>
							<svg className="google-icon" viewBox="0 0 24 24">
								<path
									fill="#4285F4"
									d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								/>
								<path
									fill="#34A853"
									d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								/>
								<path
									fill="#FBBC05"
									d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								/>
								<path
									fill="#EA4335"
									d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								/>
							</svg>
							Continue with Google
						</button> */}
					</form>
				</div>

				{/* Right Panel (Illustration & Info) */}
				<div className="right-panel1">
					<div className="right-panel-content">
						<h2 className="content-header montserrat">
							<i>Register</i>
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

export default Signup;
