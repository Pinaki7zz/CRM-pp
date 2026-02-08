import { useParams, useNavigate } from "react-router-dom";
import "./SalesQuotePrintPreview.css";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;

const SalesQuotePrintPreview = () => {
	const { id } = useParams();
	const navigate = useNavigate();

	const pdfUrl = `${BASE_URL_SM}/sales-quote/${id}/pdf`;

	return (
		<div className="pdf-preview-container">
			{/* PDF Preview */}
			<iframe
				src={pdfUrl}
				className="pdf-iframe"
				title="Sales Quote PDF Preview"
			/>
		</div>
	);
};

export default SalesQuotePrintPreview;
