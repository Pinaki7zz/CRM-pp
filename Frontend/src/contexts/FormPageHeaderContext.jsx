import { useState, createContext } from "react";

export const FormPageHeaderContext = createContext();

const FormPageHeaderProvider = ({ children }) => {
	const [btn, setBtn] = useState("");
	const [url, setUrl] = useState("");
	const [goBackUrl, setGoBackUrl] = useState("");

	return (
		<FormPageHeaderContext.Provider
			value={{ btn, setBtn, url, setUrl, goBackUrl, setGoBackUrl }}
		>
			{children}
		</FormPageHeaderContext.Provider>
	);
};

export default FormPageHeaderProvider;
