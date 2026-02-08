import { useContext } from "react";
import "./FormPageHeader.css";
import { Link } from "react-router-dom";
import { FormPageHeaderContext } from "../../../contexts/FormPageHeaderContext";

const FormPageHeader = () => {
	const { btn, url, goBackUrl } = useContext(FormPageHeaderContext);

	return (
		<div className="form-page-header-container">
			{btn.includes("Save") && (
				<Link to={url} className="form-page-header-save-btn">
					<i className="fa-solid fa-floppy-disk"></i>
					{btn}
				</Link>
			)}

			{(!btn.includes("Display") || btn.includes("NoBtn")) && (
				<Link to={goBackUrl} className="form-page-header-cancel-btn">
					<i className="fa-solid fa-xmark"></i>
					Cancel
				</Link>
			)}
		</div>
	);
};

export default FormPageHeader;
