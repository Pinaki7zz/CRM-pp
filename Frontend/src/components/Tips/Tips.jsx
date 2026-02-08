
import React, { useContext } from "react";
import { TipsContext } from "../../contexts/TipsContext";
import "./Tips.css";

const Tips = () => {
	const { tips } = useContext(TipsContext);
	
	return (
		<div className="content-container">
			<div className="tips-container">
				<div className="tip">
					<span className="tip-icon">
						<i className="fa-solid fa-lightbulb"></i>
						Tips:
					</span>
					<p className="tip-text">{tips}</p>
				</div>
			</div>
		</div>
	);
}

export default Tips;