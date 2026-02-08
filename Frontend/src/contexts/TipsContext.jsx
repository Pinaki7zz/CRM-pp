
import { useState, createContext } from "react";

export const TipsContext = createContext();

const TipsProvider = ({ children }) => {
	const [tips, setTips] = useState("");

	return (
		<TipsContext.Provider value={{tips, setTips}}>
			{ children }
		</TipsContext.Provider>
	);
}

export default TipsProvider;