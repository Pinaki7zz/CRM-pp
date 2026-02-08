import { useState } from "react";
import "./DetailsPopUp.css";
import EmbedCodePopup from "./EmbedCodePopup.jsx";

const BASE_URL_CM = import.meta.env.VITE_API_BASE_URL_CM;

const DEFAULT_MESSAGE = "Thank you for your response.";

const DetailsPopup = ({ onClose, formName, formFields, module, onSave }) => {
	const [locationUrl, setLocationUrl] = useState("");
	const [locationUrls, setLocationUrls] = useState([]);
	const [action, setAction] = useState("redirect");
	const [message, setMessage] = useState(DEFAULT_MESSAGE);
	const [customRedirectUrl, setCustomRedirectUrl] = useState("");
	const [assignedOwner] = useState("Swarupa Paul");
	const [enableContactCreation, setEnableContactCreation] = useState(false);
	const [tags, setTags] = useState("");
	const [showEmbedCode, setShowEmbedCode] = useState(false);
	const [embedCode, setEmbedCode] = useState("");

	const handleActionChange = (e) => setAction(e.target.value);

	const handleMessageChange = (e) => {
		if (e.target.value.length <= 100) setMessage(e.target.value);
	};

	const handleReset = () => setMessage(DEFAULT_MESSAGE);

	const handleAddUrl = () => {
		if (locationUrl.trim() && locationUrl.startsWith("https://")) {
			setLocationUrls([...locationUrls, locationUrl]);
			setLocationUrl("");
		} else {
			alert("Please enter a valid URL starting with https://");
		}
	};

	const handleRemoveUrl = (index) => {
		setLocationUrls(locationUrls.filter((_, i) => i !== index));
	};

	const generateEmbedCode = (webformData) => {
		const formId = `webform${Date.now()}`;
		const fieldsHtml = webformData.fields
			.map((field) => {
				const fieldId = field.label.replace(/\s+/g, "_");
				return `
  <div class='zcwf_row'>
    <div class='zcwf_col_lab' style='font-size:12px; font-family: Arial;'>
      <label for='${fieldId}'>${field.label}${
					field.required ? " <span style='color:red;'>*</span>" : ""
				}</label>
    </div>
    <div class='zcwf_col_fld'>
      ${
			field.label === "Email Opt Out"
				? `<input type='checkbox' id='${fieldId}' name='${field.label}'></input>`
				: field.label === "Description"
				? `<textarea id='${fieldId}' name='${field.label}' rows='4' maxlength='500'></textarea>`
				: `<input type='text' id='${fieldId}' ${
						field.required ? "aria-required='true'" : ""
				  } name='${field.label}' maxlength='200'></input>`
		}
      <div class='zcwf_col_help'></div>
    </div>
  </div>`;
			})
			.join("");

		const mandatoryFields = webformData.fields
			.filter((f) => f.required)
			.map((f) => `'${f.label.replace(/\s+/g, "_")}'`)
			.join(", ");

		const mandatoryLabels = webformData.fields
			.filter((f) => f.required)
			.map((f) => `'${f.label}'`)
			.join(", ");

		return `<!-- Webform Embed Code -->
      <div id='crmWebToEntityForm' class='zcwf_lblLeft crmWebToEntityForm' style='background-color: white;color: black;max-width: 600px;'>
        <meta name='viewport' content='width=device-width, initial-scale=1.0'>
        <META HTTP-EQUIV='content-type' CONTENT='text/html;charset=UTF-8'>
        <form id='${formId}' action='${BASE_URL_CM}/lead-form-submissions' name='WebTo${module}${formId}' method='POST' onSubmit='javascript:return checkMandatory${formId}()' accept-charset='UTF-8'>
          <input type='hidden' name='webformId' value='{WEBFORM_ID}'></input>
          <input type='hidden' name='returnURL' value='${
				customRedirectUrl || "https://www.google.com"
			}'></input>
          
          <style>
            html,body{ margin: 0px; }
            .formsubmit.zcwf_button{ color: white !important; background: linear-gradient(0deg, #0279FF 0%, #00A3F3 100%); }
            #crmWebToEntityForm.zcwf_lblLeft{ width: 100%; padding: 25px; margin: 0 auto; box-sizing: border-box; }
            #crmWebToEntityForm.zcwf_lblLeft *{ box-sizing: border-box; }
            #crmWebToEntityForm {text-align: left; }
            .zcwf_lblLeft .zcwf_title{ word-wrap: break-word; padding: 0px 6px 10px; font-weight: bold; }
            .zcwf_lblLeft .zcwf_col_fld input[type=text], .zcwf_lblLeft .zcwf_col_fld textarea{ 
              width: 60%; border: 1px solid #c0c6cc !important; resize: vertical; 
              border-radius: 2px; float: left; padding: 8px;
            }
            .zcwf_lblLeft .zcwf_col_lab{ 
              width: 30%; word-break: break-word; padding: 0px 6px 0px; 
              margin-right: 10px; margin-top: 5px; float: left; min-height: 1px; 
            }
            .zcwf_lblLeft .zcwf_col_fld{ float: left; width: 68%; padding: 0px 6px 0px; position: relative; margin-top: 5px; }
            .zcwf_lblLeft .zcwf_row:after, .zcwf_lblLeft .zcwf_col_fld:after{ content: ''; display: table; clear: both; }
            .zcwf_lblLeft .zcwf_row {margin: 15px 0px; }
            .zcwf_lblLeft .formsubmit{ margin-right: 5px; cursor: pointer; color: #313949; font-size: 12px; }
            .zcwf_lblLeft .zcwf_button{ 
              font-size: 12px; color: #313949; border: 1px solid #c0c6cc; 
              padding: 8px 16px; border-radius: 4px; cursor: pointer; 
            }
            @media all and (max-width: 600px){
              .zcwf_lblLeft .zcwf_col_lab, .zcwf_lblLeft .zcwf_col_fld{ width: auto; float: none !important; }
            }
          </style>
          
          <div class='zcwf_title' style='max-width: 600px;color: black; font-family:Arial;'>${
				webformData.name
			}</div>
          ${fieldsHtml}
          
          <div class='zcwf_row'>
            <div class='zcwf_col_lab'></div>
            <div class='zcwf_col_fld'>
              <input type='submit' id='formsubmit' role='button' class='formsubmit zcwf_button' value='Submit' title='Submit'>
              <input type='reset' class='zcwf_button' role='button' name='reset' value='Reset' title='Reset'>
            </div>
          </div>
          
          <script>
            function checkMandatory${formId}(){
              var mndFileds = new Array(${mandatoryFields});
              var fldLangVal = new Array(${mandatoryLabels});
              for(i=0;i<mndFileds.length;i++){
                var fieldObj=document.forms['WebTo${module}${formId}'][mndFileds[i]];
                if(fieldObj){
                  if(((fieldObj.value).replace(/^\\s+|\\s+$/g,'')).length==0){
                    alert(fldLangVal[i]+' cannot be empty.');
                    fieldObj.focus();
                    return false;
                  }else if(fieldObj.nodeName=='SELECT'){
                    if(fieldObj.options[fieldObj.selectedIndex].value=='-None-'){
                      alert(fldLangVal[i]+' cannot be none.');
                      fieldObj.focus();
                      return false;
                    }
                  }else if(fieldObj.type=='checkbox'){
                    if(fieldObj.checked==false){
                      alert('Please accept '+fldLangVal[i]);
                      fieldObj.focus();
                      return false;
                    }
                  }
                }
              }
              document.querySelector('.crmWebToEntityForm .formsubmit').setAttribute('disabled', true);
            }
          </script>
        </form>
      </div>`;
	};

	const handleSave = () => {
		const formData = {
			name: formName,
			module: module,
			fields: formFields,
			formLocationUrls: locationUrls,
			actionOnSubmission: action,
			customRedirectUrl: action === "redirect" ? customRedirectUrl : null,
			thankYouMessage:
				action === "thankyou" || action === "splash"
					? message
					: DEFAULT_MESSAGE,
			assignedOwner,
			enableContactCreation,
			tags: tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag),
		};

		// Generate embed code
		const code = generateEmbedCode(formData);
		setEmbedCode(code);
		setShowEmbedCode(true);
	};

	const handleFinalSave = () => {
		const formData = {
			formLocationUrls: locationUrls,
			actionOnSubmission: action,
			customRedirectUrl: action === "redirect" ? customRedirectUrl : null,
			thankYouMessage:
				action === "thankyou" || action === "splash"
					? message
					: DEFAULT_MESSAGE,
			assignedOwner,
			enableContactCreation,
			tags: tags
				.split(",")
				.map((tag) => tag.trim())
				.filter((tag) => tag),
		};

		if (onSave) {
			onSave(formData);
		}
	};

	if (showEmbedCode) {
		return (
			<EmbedCodePopup
				embedCode={embedCode}
				onClose={() => {
					setShowEmbedCode(false);
					handleFinalSave();
				}}
			/>
		);
	}

	return (
		<div className="details-popup-overlay">
			<div className="details-popup-container">
				<h2>{formName} Details</h2>

				<div className="details-popup-row">
					<label>Form Location URL</label>
					<input
						type="text"
						placeholder="https://"
						value={locationUrl}
						onChange={(e) => setLocationUrl(e.target.value)}
					/>
					<button style={{ marginLeft: 8 }} onClick={handleAddUrl}>
						Add
					</button>
				</div>

				<div className="details-popup-row">
					<label>Location URL:</label>
					{locationUrls.length === 0 ? (
						<span style={{ marginLeft: 12, color: "#888" }}>
							No URL Found.
						</span>
					) : (
						<div
							style={{
								marginLeft: 12,
								display: "flex",
								flexDirection: "column",
								gap: 4,
							}}
						>
							{locationUrls.map((url, index) => (
								<div
									key={index}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
									}}
								>
									<span style={{ color: "#333" }}>{url}</span>
									<button
										onClick={() => handleRemoveUrl(index)}
										style={{
											fontSize: 12,
											padding: "2px 8px",
											cursor: "pointer",
											background: "#f44336",
											color: "white",
											border: "none",
											borderRadius: 4,
										}}
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				<div className="details-popup-row">
					<label>Action on Submission</label>
					<div
						style={{
							marginLeft: 12,
							display: "flex",
							alignItems: "center",
							gap: 16,
						}}
					>
						<label>
							<input
								type="radio"
								name="action"
								value="redirect"
								checked={action === "redirect"}
								onChange={handleActionChange}
							/>{" "}
							Redirect to Custom URL
						</label>
						<label>
							<input
								type="radio"
								name="action"
								value="thankyou"
								checked={action === "thankyou"}
								onChange={handleActionChange}
							/>{" "}
							Thank you Page
						</label>
						<label>
							<input
								type="radio"
								name="action"
								value="splash"
								checked={action === "splash"}
								onChange={handleActionChange}
							/>{" "}
							Splash Message
						</label>
					</div>
				</div>

				{(action === "thankyou" || action === "splash") && (
					<div
						className="details-popup-row"
						style={{
							flexDirection: "column",
							alignItems: "flex-start",
						}}
					>
						<textarea
							value={message}
							onChange={handleMessageChange}
							maxLength={100}
							rows={4}
							style={{ width: "100%", marginBottom: 4 }}
						/>
						<div
							style={{
								display: "flex",
								width: "100%",
								justifyContent: "space-between",
							}}
						>
							<span
								onClick={handleReset}
								style={{
									color: "#888",
									textDecoration: "underline",
									cursor: "pointer",
									fontSize: 14,
								}}
							>
								Reset to Default
							</span>
							<span style={{ color: "#888", fontSize: 14 }}>
								{message.length}/100
							</span>
						</div>
					</div>
				)}

				{action === "redirect" && (
					<div className="details-popup-row">
						<label>Redirect URL</label>
						<input
							type="text"
							placeholder="https://"
							value={customRedirectUrl}
							onChange={(e) =>
								setCustomRedirectUrl(e.target.value)
							}
						/>
					</div>
				)}

				<div className="details-popup-row">
					<label>
						Assign Owner <span style={{ color: "red" }}>*</span>
					</label>
					<span style={{ marginLeft: 12 }}>
						Default Owner : {assignedOwner}
					</span>
				</div>

				<div className="details-popup-row">
					<label>Enable Contact Creation</label>
					<input
						type="checkbox"
						style={{ marginLeft: 12 }}
						checked={enableContactCreation}
						onChange={(e) =>
							setEnableContactCreation(e.target.checked)
						}
					/>
				</div>

				<div className="details-popup-row">
					<label>Add Tags</label>
					<input
						type="text"
						placeholder="Enter Tags (comma separated)"
						value={tags}
						onChange={(e) => setTags(e.target.value)}
					/>
				</div>

				<div className="details-popup-actions">
					<button onClick={onClose}>Cancel</button>
					<button className="save-btn" onClick={handleSave}>
						Save
					</button>
				</div>
			</div>
		</div>
	);
};

export default DetailsPopup;
