import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import ImageResize from "quill-image-resize-module-react";
import DOMPurify from "dompurify";
import "react-quill/dist/quill.snow.css";
import "./DisplayTemplate.css";

const BASE_URL_SER = import.meta.env.VITE_API_BASE_URL_SER;

Quill.register("modules/imageResize", ImageResize);

const placeholders = [
	"Customer First Name",
	"Customer Last Name",
	"User Email",
	"User First name",
	"User Last name",
	"Contact first name",
	"Contact last name",
	"Ticket ID",
	"Organisation",
	"User Job",
	"Organisation website",
	"User Phone",
];

// Custom Toolbar Component
const CustomToolbar = () => (
	<div id="custom-toolbar">
		<select className="ql-header" defaultValue="">
			<option value="1"></option>
			<option value="2"></option>
			<option value=""></option>
		</select>
		<button className="ql-bold"></button>
		<button className="ql-italic"></button>
		<button className="ql-underline"></button>
		<button className="ql-link"></button>
		<button className="ql-image"></button>
		<button className="ql-list" value="ordered"></button>
		<button className="ql-list" value="bullet"></button>
		<button className="ql-clean"></button>
	</div>
);

const DisplayTemplate = () => {
	const location = useLocation();
	const navigate = useNavigate();

	// 🔥 Use state to store template data and update on location change
	const [templateData, setTemplateData] = useState(
		location.state?.templateData || {}
	);
	const quillRef = useRef(null);

	// 🔥 FIXED: Watch for location.state changes more reliably
	useEffect(() => {
		console.log("🔍 Location state changed:", location.state?.templateData);
		if (location.state?.templateData) {
			const newTemplateData = location.state.templateData;

			// Only update if the data is actually different (by ID or timestamp)
			if (
				JSON.stringify(newTemplateData) !== JSON.stringify(templateData)
			) {
				console.log("🔥 Updating template data");
				setTemplateData(newTemplateData);
			}
		}
	}, [location.state, location.pathname]); // Watch location.state and pathname instead of key

	const [emailBody, setEmailBody] = useState("");
	const [uploadStatus, setUploadStatus] = useState("");
	const [selectedFile, setSelectedFile] = useState(null);
	const [showReplaceConfirm, setShowReplaceConfirm] = useState(false);
	const [loading, setLoading] = useState(false);

	// 🔥 FIXED: Better template type detection that also checks for files
	const isDocumentBased = useMemo(() => {
		const templateType = templateData.templateType
			?.toLowerCase()
			.replace(/[_-]/g, " ");
		const hasFile = templateData.fileName || selectedFile;

		// Check both templateType AND presence of file
		const isDocBased =
			templateType === "document based" ||
			templateType?.includes("document") ||
			hasFile; // 🔥 If there's a file, it's document-based

		console.log("🔍 Template Type (raw):", templateData.templateType);
		console.log("🔍 Template Type (normalized):", templateType);
		console.log("🔍 Has File:", hasFile);
		console.log("🔍 File Name:", templateData.fileName);
		console.log("🔍 Is Document Based:", isDocBased);

		return isDocBased;
	}, [templateData.templateType, templateData.fileName, selectedFile]);

	// 🔥 Debug logs to check what's happening
	useEffect(() => {
		console.log("🔍 Template Data Updated:", templateData);
		console.log("🔍 Template ID:", templateData.id);
		console.log("🔍 Template Type:", templateData.templateType);
		console.log("🔍 Is Document Based:", isDocumentBased);
	}, [templateData, isDocumentBased]);

	// Load existing template content when templateData changes
	useEffect(() => {
		console.log("🔍 Loading template content...");

		if (templateData.content) {
			// For text-based templates
			const sanitizedContent = DOMPurify.sanitize(templateData.content);
			setEmailBody(sanitizedContent);
			console.log("✅ Text content loaded");
		} else if (templateData.fileData && templateData.fileName) {
			// ✅ FIXED: For document-based templates with uploaded HTML files
			try {
				console.log("🔍 Loading HTML file content from database...");

				let htmlContent = "";

				// Convert object with numeric keys to array
				if (
					typeof templateData.fileData === "object" &&
					!Array.isArray(templateData.fileData)
				) {
					// Convert {0: 60, 1: 33, 2: 68, ...} to [60, 33, 68, ...]
					const keys = Object.keys(templateData.fileData)
						.map(Number)
						.sort((a, b) => a - b);
					const byteArray = keys.map(
						(key) => templateData.fileData[key]
					);
					const uint8Array = new Uint8Array(byteArray);
					htmlContent = new TextDecoder("utf-8").decode(uint8Array);
				} else if (templateData.fileData.data) {
					// Handle Buffer format
					const uint8Array = new Uint8Array(
						templateData.fileData.data
					);
					htmlContent = new TextDecoder("utf-8").decode(uint8Array);
				} else if (Array.isArray(templateData.fileData)) {
					// Handle array format
					const uint8Array = new Uint8Array(templateData.fileData);
					htmlContent = new TextDecoder("utf-8").decode(uint8Array);
				}

				console.log(
					"🔍 Decoded HTML content:",
					htmlContent.substring(0, 200)
				);

				// Clean and set the HTML content
				const sanitizedHtml = DOMPurify.sanitize(htmlContent);
				setEmailBody(sanitizedHtml);
				console.log("✅ HTML file content set in ReactQuill");
			} catch (error) {
				console.error("❌ Failed to load HTML file content:", error);
				setEmailBody(
					'<p style="color: red;">Error loading HTML file content.</p>'
				);
			}
		} else {
			setEmailBody("");
			console.log("⚠️ No content found, clearing editor");
		}

		// Set file reference
		if (templateData.fileName) {
			setSelectedFile({ name: templateData.fileName });
		} else {
			setSelectedFile(null);
		}
	}, [templateData]);

	// React to templateData changes

	const handleEditorChange = (content, delta, source, editor) => {
		setEmailBody(content);
	};

	// Image insertion handler
	const imageHandler = () => {
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", "image/*");
		input.click();

		input.onchange = async () => {
			const file = input.files[0];
			if (!file) return;

			if (file.size > 2 * 1024 * 1024) {
				alert("Image size should be less than 2MB");
				return;
			}

			setUploadStatus("Uploading image...");
			try {
				const base64 = await convertToBase64(file);
				const quill = quillRef.current?.getEditor();
				if (!quill) return;

				let range = quill.getSelection();
				if (!range) range = { index: quill.getLength(), length: 0 };

				quill.insertEmbed(range.index, "image", base64);
				quill.setSelection(range.index + 1);

				setUploadStatus("Image uploaded successfully!");
				setTimeout(() => setUploadStatus(""), 3000);
			} catch (error) {
				console.error("Image upload failed:", error);
				setUploadStatus("Failed to upload image");
				setTimeout(() => setUploadStatus(""), 3000);
			}
		};
	};

	// Load HTML file content into editor (for document-based templates)
	const loadHtmlFileIntoEditor = (file) => {
		const reader = new FileReader();
		reader.onload = (e) => {
			const htmlContent = e.target.result;
			const sanitizedHtml = DOMPurify.sanitize(htmlContent);
			setEmailBody(sanitizedHtml);
		};
		reader.readAsText(file);
	};

	// File browse handler for document templates
	const handleFileBrowse = () => {
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", ".html,.htm,text/html");
		input.click();

		input.onchange = (e) => {
			const file = e.target.files[0];
			if (file) {
				setSelectedFile(file);
				loadHtmlFileIntoEditor(file);
				console.log("Selected file:", file.name);
			}
		};
	};

	// Replace file handler
	const handleReplaceFile = () => {
		setShowReplaceConfirm(true);
	};

	// Confirm replace - removes the file and clears content
	const confirmReplace = () => {
		setSelectedFile(null);
		setEmailBody("");
		setShowReplaceConfirm(false);
		console.log("File removed successfully");
	};

	// Cancel replace
	const cancelReplace = () => {
		setShowReplaceConfirm(false);
	};

	// Download file handler
	const handleDownloadFile = () => {
		if (selectedFile) {
			const url = URL.createObjectURL(selectedFile);
			const a = document.createElement("a");
			a.href = url;
			a.download = selectedFile.name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	// Convert file to base64
	const convertToBase64 = (file) => {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result);
			reader.onerror = reject;
			reader.readAsDataURL(file);
		});
	};

	// Backend Integration - Save/Update Template with fresh data handling
	const handleUpdate = async () => {
		if (!templateData.id) {
			alert("Template ID is missing");
			return;
		}

		setLoading(true);

		try {
			const formData = new FormData();

			// Add all template fields
			formData.append("name", templateData.name || "");
			formData.append("object", templateData.object || "");
			formData.append("language", templateData.language || "English");
			formData.append(
				"templateType",
				templateData.templateType || "Text Based"
			);
			formData.append("usage", templateData.usage || "Template");
			formData.append("subject", templateData.subject || "");

			// Add the rich text content (HTML)
			formData.append("content", emailBody);

			// Add file if exists
			if (selectedFile && selectedFile instanceof File) {
				formData.append("file", selectedFile);
				formData.append("fileName", selectedFile.name);
			}

			console.log(
				"🔍 Updating template with content:",
				emailBody.substring(0, 100) + "..."
			);

			// Make API call to update template
			const response = await fetch(
				`${BASE_URL_SER}/templates/${templateData.id}`,
				{
					method: "PUT",
					body: formData,
				}
			);

			const result = await response.json();

			if (response.ok) {
				const updatedTemplate = result.data || result;
				console.log(
					"✅ Template updated successfully:",
					updatedTemplate
				);

				// Update local state with fresh data
				setTemplateData(updatedTemplate);

				setUploadStatus("Template updated successfully!");
				setTimeout(() => {
					setUploadStatus("");
					// Navigate back with updated data
					navigate("/service/templates");
				}, 2000);
			} else {
				console.error("❌ Failed to update template:", result);
				alert(result.message || "Failed to update template");
			}
		} catch (error) {
			console.error("❌ Update failed:", error);
			alert("Failed to update template. Please try again later.");
		} finally {
			setLoading(false);
		}
	};

	// Quill modules configuration
	const modules = useMemo(
		() => ({
			toolbar: {
				container: "#custom-toolbar",
				handlers: {
					image: imageHandler,
				},
			},
			imageResize: {
				parchment: Quill.import("parchment"),
				modules: ["Resize", "DisplaySize"],
			},
		}),
		[]
	);

	const formats = [
		"header",
		"bold",
		"italic",
		"underline",
		"list",
		"bullet",
		"link",
		"image",
	];

	// Insert placeholder into editor
	const insertPlaceholder = (placeholder) => {
		const formattedPlaceholder = `#${placeholder}#`;
		const quill = quillRef.current?.getEditor();
		if (!quill) return;

		let range = quill.getSelection();
		if (!range) {
			range = { index: quill.getLength(), length: 0 };
		}

		quill.insertText(range.index, formattedPlaceholder);
		quill.setSelection(range.index + formattedPlaceholder.length);
	};

	return (
		<div className="display-template-container">
			<div className="editor-left">
				{/* Template Header */}
				<div className="template-header">
					<h2>
						{isDocumentBased
							? " Document-Based Template"
							: " Text-Based Template"}
					</h2>
					<div className="template-info">
						<p>
							<strong>Name:</strong> {templateData.name}
						</p>
						<p>
							<strong>Object:</strong> {templateData.object}
						</p>
						<p>
							<strong>Language:</strong> {templateData.language}
						</p>
						<p>
							<strong>Usage:</strong> {templateData.usage}
						</p>
						{templateData.subject && (
							<p>
								<strong>Subject:</strong> {templateData.subject}
							</p>
						)}
					</div>
				</div>

				{/* 🔥 CONDITIONAL LAYOUTS BASED ON TEMPLATE TYPE */}
				{isDocumentBased ? (
					/* ========== DOCUMENT-BASED LAYOUT ========== */
					<div className="document-based-layout">
						{/* Document File Section */}
						<div className="document-file-section">
							<div className="file-controls">
								<button
									className="browse-file-btn"
									onClick={handleFileBrowse}
									disabled={loading}
								>
									📁 Browse HTML File
								</button>

								<div className="file-info">
									<span className="file-name">
										{selectedFile
											? selectedFile.name
											: templateData.fileName ||
											  "No file selected"}
									</span>
								</div>

								<div className="file-actions">
									<button
										className="replace-btn"
										onClick={handleReplaceFile}
										disabled={
											(!selectedFile &&
												!templateData.fileName) ||
											loading
										}
									>
										🔄 Replace
									</button>
									<button
										className="download-btn"
										onClick={handleDownloadFile}
										disabled={!selectedFile || loading}
									>
										⬇️ Download
									</button>
								</div>
							</div>
						</div>

						{/* Rich Text Editor for Document */}
						<label>Document Content Editor</label>
						<CustomToolbar />
						<ReactQuill
							ref={quillRef}
							value={emailBody}
							onChange={handleEditorChange}
							modules={modules}
							formats={formats}
							className="editor document-editor"
							placeholder="Upload an HTML file or start editing your document content..."
							theme="snow"
							readOnly={loading}
						/>
					</div>
				) : (
					/* ========== TEXT-BASED LAYOUT ========== */
					<div className="text-based-layout">
						{/* Simple Rich Text Editor for Text */}
						<label>Template Content</label>
						<CustomToolbar />
						<ReactQuill
							ref={quillRef}
							value={emailBody}
							onChange={handleEditorChange}
							modules={modules}
							formats={formats}
							className="editor text-editor"
							placeholder="Start typing your template content..."
							theme="snow"
							readOnly={loading}
						/>
					</div>
				)}

				{/* Upload Status */}
				{uploadStatus && (
					<div
						className={`upload-status ${
							uploadStatus.includes("Failed")
								? "error"
								: "success"
						}`}
					>
						{uploadStatus}
					</div>
				)}

				{/* Action Buttons */}
				<div className="form-actions">
					<button
						className="cancel-btn"
						onClick={() => navigate("/service/templates")}
						disabled={loading}
					>
						Cancel
					</button>
					<button
						className="update-btn"
						onClick={handleUpdate}
						disabled={loading}
					>
						{loading ? "Saving..." : "Save"}
					</button>
				</div>
			</div>

			{/* Right Sidebar - Placeholders */}
			<div className="editor-right">
				<h4 className="placeholders-title">Placeholders</h4>
				<div className="placeholders-list">
					{placeholders.map((ph, index) => (
						<div key={index} className="placeholder-item">
							<span className="placeholder-text">
								<span className="hash">#</span>
								<span className="content">{ph}</span>
								<span className="hash">#</span>
							</span>
							<div className="placeholder-actions">
								<button
									className="insert-btn"
									onClick={() => insertPlaceholder(ph)}
									title="Insert into template content"
									disabled={loading}
								>
									Add
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Replace Confirmation Modal */}
			{showReplaceConfirm && (
				<div
					className="replace-confirm-overlay"
					onClick={cancelReplace}
				>
					<div
						className="replace-confirm-dialog"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="dialog-header">
							<h3>Replace File</h3>
							<p>
								Do you want to replace the current file? This
								will remove the file and clear the content.
							</p>
						</div>
						<div className="dialog-buttons">
							<button
								className="confirm-cancel-button"
								onClick={cancelReplace}
								disabled={loading}
							>
								No
							</button>
							<button
								className="confirm-replace-button"
								onClick={confirmReplace}
								disabled={loading}
							>
								Yes
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DisplayTemplate;
