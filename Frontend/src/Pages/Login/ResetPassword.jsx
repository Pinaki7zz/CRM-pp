import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./ResetPassword.css";
import gal_logo1 from "../../assets/gal_logo1.png";
import image from "../../assets/image.png";
import { Lock, Mail, User, Eye, EyeOff } from "lucide-react"; // Importing icons from lucide-react
import { toast } from "react-toastify";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const ResetPassword = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const queryParams = new URLSearchParams(location.search);
	const token = queryParams.get("token");
	const [step, setStep] = useState(token ? 2 : 1);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [error, setError] = useState("");

	const togglePassword = () => setPasswordVisible((prev) => !prev);

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const response = await fetch(`${BASE_URL_UM}/auth/request-reset`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ email }),
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors) {
					setError(data.errors[0].msg);
					setEmail("");
					return;
				} else {
					toast.error(data.message || "Login failed");
					setEmail("");
					return;
				}
			}

			toast.info("A reset link has been sent to your mail.");
		} catch (err) {
			toast.error("Something went wrong. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	const handleResetSubmit = async (e) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Password confirmation does not match password");
			return;
		}
		setLoading(true);
		try {
			const response = await fetch(`${BASE_URL_UM}/auth/reset-password`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ token, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				if (data.errors) {
					setError(data.errors[0].msg);
					setPassword("");
					setConfirmPassword("");
					return;
				} else {
					toast.error(data.message || "Login failed");
					setPassword("");
					setConfirmPassword("");
					return;
				}
			}

			toast.success("Password has been reset successfully!");
			navigate("/login");
		} catch (err) {
			toast.error("Reset failed. Try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="main-container">
			<div className="login-card">
				<div className="left-panel1">
					<div className="logo">
						<img
							src={gal_logo1}
							alt="Logo"
							className="logo-image"
						/>
					</div>

					<h2 className="form-title montserrat">
						<i>
							{step === 1
								? "Forgot Password"
								: "Reset Your Password"}
						</i>
					</h2>

					{/* Error message if error occurs in form */}
					{error && <div className="error-box">{error}</div>}

					<form
						onSubmit={
							step === 1 ? handleEmailSubmit : handleResetSubmit
						}
					>
						{step === 1 ? (
							<div className="form-group1">
								<div className="input-container234">
									<Mail
										className="input-icon icon"
										size={20}
										strokeWidth={1.8}
									/>
									<input
										type="text"
										id="email"
										placeholder="Enter Your Email"
										value={email}
										onChange={(e) => {
											setEmail(e.target.value);
											setError(""); // clear error on input
										}}
										className="form-input montserrat"
									/>
								</div>
							</div>
						) : (
							<>
								<div className="form-group1">
									<div className="input-container234">
										<Lock
											className="input-icon icon"
											size={20}
											strokeWidth={1.8}
										/>
										<input
											type="password"
											id="password1"
											placeholder="New Password"
											value={password}
											onChange={(e) => {
												setPassword(e.target.value);
												setError(""); // clear error on input
											}}
											className="form-input montserrat"
										/>
									</div>
								</div>
								<div className="form-group1">
									<div className="input-container234">
										<Lock
											className="input-icon icon"
											size={20}
											strokeWidth={1.8}
										/>
										<input
											type={
												passwordVisible
													? "text"
													: "password"
											}
											id="password2"
											placeholder="Confirm New Password"
											value={confirmPassword}
											onChange={(e) => {
												setConfirmPassword(
													e.target.value
												);
												setError(""); // clear error on input
											}}
											className="form-input montserrat"
										/>
										<button
											type="button"
											className="password-toggle"
											onClick={togglePassword}
										>
											{passwordVisible ? (
												<EyeOff
													size={20}
													strokeWidth={1.8}
												/>
											) : (
												<Eye
													size={20}
													strokeWidth={1.8}
												/>
											)}
										</button>
									</div>
								</div>
							</>
						)}
						<button
							type="submit"
							disabled={loading}
							className="setpass-btn montserrat"
						>
							{loading
								? "Processing..."
								: step === 1
								? "Send Reset Link"
								: "Set New Password"}
						</button>
						<div className="form-row3">
							<Link
								className="forgot-link montserrat"
								to="/login"
							>
								Go Back to Login
							</Link>
						</div>
					</form>
				</div>

				<div className="right-panel1">
					<div className="right-panel-content">
						<h2 className="content-header montserrat">
							<i>Just one more step!</i>
						</h2>
						<p className="content-text montserrat">
							<i>
								You're almost done. Finish resetting your
								password and you're back in!
							</i>
						</p>
					</div>
					<img src={image} alt="deco-image" className="deco-image" />
				</div>
			</div>
		</div>
	);
};

export default ResetPassword;
