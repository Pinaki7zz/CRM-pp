
import { useEffect, useContext } from "react";
import Tips from "../../../components/Tips/Tips";
import { TipsPageHeaderContext } from "../../../contexts/TipsPageHeaderContext";
import TipsPageHeader from "../../../components/Layout/TipsPageHeader/TipsPageHeader";

const LineItemsPage = () => {
	const { setCreateBtn, setEditBtn, setDisplayBtn, setCreateUrl, setEditUrl, setDisplayUrl } = useContext(TipsPageHeaderContext);

	useEffect(() => {
		setCreateBtn("Create Business Unit");
		setEditBtn("Edit Business Unit");
		setDisplayBtn("Display Business Unit");
		setCreateUrl("/createBusinessUnit");
		setEditUrl("/editBusinessUnit");
		setDisplayUrl("/displayBusinessUnit");
	});

	return (
		<>
			<TipsPageHeader />
			<Tips />
		</>
	);
}

export default LineItemsPage;