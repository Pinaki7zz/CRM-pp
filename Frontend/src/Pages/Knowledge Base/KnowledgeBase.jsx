import { Link } from "react-router-dom";
import "./KnowledgeBase.css";

const KnowledgeBase = () => {
	return (
		<div className="kb-container">
			<div className="kb-content-container">
				<h1 className="kb-header">Knowledge Base</h1>
				<h2 className="kb-description">How can we help you?</h2>
				<button className="kb-open-app-button">
					<Link to="/service/knowledgebase/details">Open App</Link>
				</button>
			</div>
		</div>
	);
};

export default KnowledgeBase;
