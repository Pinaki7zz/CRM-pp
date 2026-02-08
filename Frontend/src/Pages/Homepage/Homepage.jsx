import { useState, useEffect } from "react";
import {
	BarChart3,
	Users,
	User,
	CheckCircle2,
	Clock,
	AlertTriangle,
	Mail,
	FileText,
	Building,
	UserSquare2,
	RefreshCw,
	Plus,
	ShoppingBag,
	MessageCircle,
} from "lucide-react";
import "./Homepage.css";
import { useAuth } from "../../contexts/AuthContext";

const HomePage = () => {
	const [greeting, setGreeting] = useState("Good Morning");
	const [showActionMenu, setShowActionMenu] = useState(false);
	const { user, loading } = useAuth();

	// Set greeting based on time of day
	useEffect(() => {
		const hour = new Date().getHours();
		if (hour >= 5 && hour < 12) {
			setGreeting("Good Morning");
		} else if (hour >= 12 && hour < 18) {
			setGreeting("Good Afternoon");
		} else {
			setGreeting("Good Evening");
		}
	}, []);

	const toggleActionMenu = () => {
		setShowActionMenu(!showActionMenu);
	};

	return (
		<div className="hp_wrapper">
			{/* Welcome Message */}
			<div className="hp_welcome_card">
				<div className="hp_welcome_content">
					<div>
						<h1 className="hp_welcome_title">
							{greeting}, {user.firstName} {user.lastName}
						</h1>
						<p className="hp_welcome_subtitle">
							Your day just got easier with CRM Pro.
						</p>
					</div>
					<div className="hp_welcome_actions">
						<div className="hp_relative">
							<button
								onClick={toggleActionMenu}
								className="hp_primary_button"
							>
								<Plus className="hp_button_icon" />
								Create Action
							</button>
							{showActionMenu && (
								<div className="hp_dropdown_menu">
									<div className="hp_dropdown_content">
										<a
											href="#"
											className="hp_dropdown_item"
										>
											<UserSquare2 className="hp_dropdown_icon" />
											Client
										</a>
										<a
											href="#"
											className="hp_dropdown_item"
										>
											<User className="hp_dropdown_icon" />
											Contact
										</a>
										<a
											href="#"
											className="hp_dropdown_item"
										>
											<FileText className="hp_dropdown_icon" />
											Email Template
										</a>
										<a
											href="#"
											className="hp_dropdown_item"
										>
											<UserSquare2 className="hp_dropdown_icon" />
											Prospect
										</a>
									</div>
								</div>
							)}
						</div>
						<button className="hp_secondary_button">
							<RefreshCw className="hp_icon_small" />
						</button>
					</div>
				</div>
			</div>

			{/* Dashboard Content */}
			<div className="hp_dashboard_grid">
				{/* Card 1: Follow Up */}
				<div className="hp_card">
					<div className="hp_card_body">
						<div className="hp_card_header">
							<div className="hp_icon_container hp_icon_indigo">
								<CheckCircle2 className="hp_header_icon" />
							</div>
							<h3 className="hp_card_title">Follow Up</h3>
						</div>
						<ul className="hp_task_list">
							<li className="hp_task_item">
								<div className="hp_task hp_task_green">
									<div className="hp_task_header">
										<p className="hp_task_title">Task 1</p>
										<span className="hp_task_status_green">
											75% completed
										</span>
									</div>
									<div className="hp_progress_bar">
										<div
											className="hp_progress_bar_fill"
											style={{ width: "75%" }}
										></div>
									</div>
								</div>
							</li>
							<li className="hp_task_item">
								<div className="hp_task hp_task_blue">
									<div className="hp_task_header">
										<p className="hp_task_title">Task 2</p>
										<span className="hp_task_date">
											May 10 - May 15
										</span>
									</div>
									<div className="hp_task_info">
										<Clock className="hp_task_info_icon hp_icon_blue" />
										<span className="hp_task_info_text">
											3 days remaining
										</span>
									</div>
								</div>
							</li>
							<li className="hp_task_item hp_last_item">
								<div className="hp_task hp_task_orange">
									<div className="hp_task_header">
										<p className="hp_task_title">Task 3</p>
										<span className="hp_badge_orange">
											High Priority
										</span>
									</div>
									<div className="hp_task_info">
										<AlertTriangle className="hp_task_info_icon hp_icon_orange" />
										<span className="hp_task_info_text">
											Requires immediate attention
										</span>
									</div>
								</div>
							</li>
						</ul>
					</div>
					<div className="hp_card_footer">
						<div className="hp_card_footer_text">
							<a href="#" className="hp_link">
								View all tasks
							</a>
						</div>
					</div>
				</div>

				{/* Card 2: Knowledge Base */}
				<div className="hp_card">
					<div className="hp_card_body">
						<div className="hp_card_header">
							<div className="hp_icon_container hp_icon_purple">
								<FileText className="hp_header_icon" />
							</div>
							<h3 className="hp_card_title">Knowledge Base</h3>
						</div>
						<ul className="hp_kb_list">
							<li className="hp_kb_item">
								<a href="#" className="hp_kb_link">
									<Mail className="hp_kb_icon hp_icon_purple" />
									<div>
										<p className="hp_kb_title">
											How to integrate with email
										</p>
										<p className="hp_kb_desc">
											Learn how to connect your email
											accounts for seamless communication
										</p>
									</div>
								</a>
							</li>
							<li className="hp_kb_item">
								<a href="#" className="hp_kb_link">
									<Users className="hp_kb_icon hp_icon_purple" />
									<div>
										<p className="hp_kb_title">
											How to integrate with company Human
											Resource
										</p>
										<p className="hp_kb_desc">
											Sync employee data with your HR
											systems
										</p>
									</div>
								</a>
							</li>
							<li className="hp_kb_item hp_last_item">
								<a href="#" className="hp_kb_link">
									<Building className="hp_kb_icon hp_icon_purple" />
									<div>
										<p className="hp_kb_title">
											How to integrate with other business
											requirement
										</p>
										<p className="hp_kb_desc">
											Connect with third-party services
											and APIs
										</p>
									</div>
								</a>
							</li>
						</ul>
					</div>
					<div className="hp_card_footer">
						<div className="hp_card_footer_text">
							<a href="#" className="hp_link">
								Browse all articles
							</a>
						</div>
					</div>
				</div>

				{/* Card 3: Daily Insights */}
				<div className="hp_card">
					<div className="hp_card_body">
						<div className="hp_card_header">
							<div className="hp_icon_container hp_icon_green">
								<BarChart3 className="hp_header_icon" />
							</div>
							<h3 className="hp_card_title">Daily Insights</h3>
						</div>
						<ul className="hp_insights_list">
							<li className="hp_insight_item">
								<div className="hp_insight_content">
									<ShoppingBag className="hp_insight_icon hp_icon_green" />
									<div>
										<p className="hp_insight_title">
											Top performing products of the month
										</p>
										<div className="hp_tag_container">
											<span className="hp_tag hp_tag_green">
												One8
											</span>
											<span className="hp_tag hp_tag_green">
												Puma Shoe
											</span>
										</div>
									</div>
								</div>
							</li>
							<li className="hp_insight_item">
								<div className="hp_insight_content">
									<UserSquare2 className="hp_insight_icon hp_icon_green" />
									<div>
										<p className="hp_insight_title">
											Yesterday, 5 leads were converted
										</p>
										<p className="hp_insight_desc">
											Don't miss follow up today
										</p>
										<a href="#" className="hp_insight_link">
											Schedule follow-ups
										</a>
									</div>
								</div>
							</li>
							<li className="hp_insight_item hp_last_item">
								<div className="hp_insight_content">
									<BarChart3 className="hp_insight_icon hp_icon_green" />
									<div>
										<p className="hp_insight_title">
											Denmark's ecomm market grew by 15%
											in Q4
										</p>
										<p className="hp_insight_desc">
											Opportunity to expand in Nordic
											markets
										</p>
									</div>
								</div>
							</li>
						</ul>
					</div>
					<div className="hp_card_footer">
						<div className="hp_card_footer_text">
							<a href="#" className="hp_link">
								View all insights
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Recent Activity */}

			<div className="hp_recent_activity">
				<h2 className="hp_section_title">Recent Activity</h2>
				<div className="hp_activity_card">
					<ul className="hp_activity_list">
						{[1, 2, 3, 4, 5].map((item) => (
							<li key={item} className="hp_activity_item">
								<a href="#" className="hp_activity_link">
									<div className="hp_activity_content">
										<div className="hp_activity_header">
											<p className="hp_activity_title">
												New lead: Acme Corporation
											</p>
											<div className="hp_activity_status">
												<p className="hp_badge_green">
													New
												</p>
											</div>
										</div>
										<div className="hp_activity_footer">
											<div className="hp_activity_user">
												<p className="hp_activity_user_info">
													<User className="hp_activity_user_icon" />
													John Smith
												</p>
											</div>
											<div className="hp_activity_time">
												<p>
													Added {item} hour
													{item !== 1 ? "s" : ""} ago
												</p>
											</div>
										</div>
									</div>
								</a>
							</li>
						))}
					</ul>
				</div>
			</div>

			{/* Live Chat Button */}
			<div className="hp_chat_button_container">
				<button className="hp_chat_button">
					<MessageCircle className="hp_chat_icon" />
				</button>
			</div>
		</div>
	);
};

export default HomePage;
