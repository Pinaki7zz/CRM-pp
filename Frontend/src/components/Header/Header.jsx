import { useState } from "react";
import { Bell, Search, Grid, Settings } from "lucide-react";
import "./Header.css";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL_UM = import.meta.env.VITE_API_BASE_URL_UM;

const Header = ({ pendingRequests }) => {
	const [showDropdown, setShowDropdown] = useState(false);
	const [showSystemsDropdown, setShowSystemsDropdown] = useState(false);
	const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
	const [showLogoutModal, setShowLogoutModal] = useState(false);
	const navigate = useNavigate();
	const { setUser } = useAuth();

	const toggleDropdown = () => {
		setShowDropdown(!showDropdown);
		setShowSystemsDropdown(false);
		setShowSettingsDropdown(false);
	};

	const toggleSystemsDropdown = () => {
		setShowSystemsDropdown(!showSystemsDropdown);
		setShowDropdown(false);
		setShowSettingsDropdown(false);
	};

	const toggleSettingsDropdown = () => {
		setShowSettingsDropdown(!showSettingsDropdown);
		setShowDropdown(false);
		setShowSystemsDropdown(false);
	};

	const LogoutModal = ({ onClose, onConfirm }) => {
		return (
			<div className="logout-modal-backdrop">
				<div className="logout-modal">
					<h3>Confirm Logout</h3>
					<p>Are you sure you want to log out?</p>
					<div className="modal-actions">
						<button onClick={onConfirm} className="confirm-btn">
							Yes, Logout
						</button>
						<button onClick={onClose} className="cancel-btn">
							Cancel
						</button>
					</div>
				</div>
			</div>
		);
	};

	const handleLogout = async () => {
		try {
			await fetch(`${BASE_URL_UM}/auth/logout`, {
				method: "POST",
				credentials: "include",
			});
			setUser(null);
			localStorage.removeItem("accessToken");
			navigate("/login");
		} catch (err) {
			console.error("Logout failed:", err);
		}
	};

	return (
		<header className="unique-navbar-container">
			<div className="unique-navbar-left">
				<div className="unique-search-container">
					<Search
						className="unique-navbar-search-icon"
						strokeWidth={1}
					/>
					<input
						type="text"
						placeholder="Search"
						className="unique-navbar-search-input"
						aria-label="Search"
					/>
				</div>
			</div>

			<div className="unique-navbar-right">
				<div className="unique-navbar-icons">
					<button
						className="header-icon-btn"
						onClick={toggleSettingsDropdown}
						title="Settings"
					>
						<Settings className="unique-navbar-settings-icon" />
					</button>

					<button
						className="header-icon-btn notifications-btn"
						onClick={() => {}}
						title="Notifications"
					>
						<Bell className="unique-navbar-bell-icon" />
						{pendingRequests > 0 && (
							<span className="unique-notification-badge">
								{pendingRequests}
							</span>
						)}
					</button>

					<div
						className="unique-navbar-profile"
						onClick={toggleDropdown}
						role="button"
						tabIndex={0}
					>
						<img
							src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
							alt="User Profile"
							className="unique-navbar-profile-pic"
						/>
					</div>

					<button
						className="header-icon-btn"
						title="Apps"
						onClick={toggleSystemsDropdown}
					>
						<Grid className="unique-navbar-grid-icon" />
					</button>

					{showSettingsDropdown && (
						<div className="unique-settings-dropdown">
							<p
								className="unique-profile-dropdown-item"
								onClick={() => {
									navigate("/settings");
									setShowSettingsDropdown(false);
								}}
							>
								Settings
							</p>
							<p className="unique-profile-dropdown-item">
								Notifications
							</p>
							<p className="unique-profile-dropdown-item">
								Appearance
							</p>
							<p className="unique-profile-dropdown-item">
								Security
							</p>
							<p className="unique-profile-dropdown-item">
								Integrations
							</p>
						</div>
					)}

					{showDropdown && (
						<div className="unique-profile-dropdown">
							<p className="unique-profile-dropdown-item">
								Rohan Roy
							</p>
							<p className="unique-profile-dropdown-item unique-profile-role-item">
								HR Administrator
							</p>
							<p className="unique-profile-dropdown-item unique-profile-email-item">
								rohan.roy@galvinus.com
							</p>
							<hr />
							<p className="unique-profile-dropdown-item">
								Reset Password
							</p>
							<p
								className="unique-profile-dropdown-item"
								onClick={() => setShowLogoutModal(true)}
							>
								Logout
							</p>
						</div>
					)}

					{showSystemsDropdown && (
						<div className="unique-systems-dropdown">
							<p className="unique-profile-dropdown-item">
								HR System
							</p>
							<p className="unique-profile-dropdown-item">
								Ecommerce System
							</p>
							<p className="unique-profile-dropdown-item">
								CRM System
							</p>
							<p className="unique-profile-dropdown-item">
								Inventory System
							</p>
							<p className="unique-profile-dropdown-item">
								Analytics Dashboard
							</p>
						</div>
					)}

					{showLogoutModal && (
						<LogoutModal
							onClose={() => setShowLogoutModal(false)}
							onConfirm={handleLogout}
						/>
					)}
				</div>
			</div>
		</header>
	);
};

export default Header;
