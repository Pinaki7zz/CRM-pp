
import { useContext } from "react";
import "./TipsPageHeader.css";
import { Link } from "react-router-dom";
import { TipsPageHeaderContext } from "../../../contexts/TipsPageHeaderContext";

const TipsPageHeader = () => {
	const { createBtn, editBtn, displayBtn, createUrl, editUrl, displayUrl } = useContext(TipsPageHeaderContext);

	return (
		<div className="content-area-navbar">
			<Link to={createUrl} className="icon-button">
				<i className="fas fa-plus" />
				{createBtn}
			</Link>

			<Link to={editUrl} className="icon-button">
				<i className="fas fa-edit" />
				{editBtn}
			</Link>

			<Link to={displayUrl} className="icon-button">
				<i className="fa-solid fa-tv"></i>
				{displayBtn}
			</Link>
		</div>
	);
}

export default TipsPageHeader;