import Sidebar from "./Sidebar/Sidebar";
import Header from "../components/Header/Header";

import { Outlet } from "react-router-dom";
import "./Layout.css";

const Layout = () => {
	return (
		<div className="layout-container">
			<div className="left-side">
				<Sidebar />
			</div>
			<div className="right-side">
				<div className="content-wrapper">
					<Header />
					{/* <Sidebar /> */}
					<main className="main-content">
						<Outlet />
					</main>
				</div>
			</div>
		</div>
	);
};

export default Layout;
