
import { useState, createContext } from "react";

export const TipsPageHeaderContext = createContext();

const TipsPageHeaderProvider = ({ children }) => {
	const [createBtn, setCreateBtn] = useState("");
	const [editBtn, setEditBtn] = useState("");
	const [displayBtn, setDisplayBtn] = useState("");
	const [createUrl, setCreateUrl] = useState("");
	const [editUrl, setEditUrl] = useState("");
	const [displayUrl, setDisplayUrl] = useState("");

	return (
		<TipsPageHeaderContext.Provider value={
			{createBtn, setCreateBtn, editBtn, setEditBtn, displayBtn, setDisplayBtn, createUrl, setCreateUrl, editUrl, setEditUrl, displayUrl, setDisplayUrl}
		}>
			{ children }
		</TipsPageHeaderContext.Provider>
	);
}

export default TipsPageHeaderProvider;