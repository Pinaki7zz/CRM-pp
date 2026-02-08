
import { useEffect, useContext } from "react";
import Tips from "../../../components/Tips/Tips";
import { TipsPageHeaderContext } from "../../../contexts/TipsPageHeaderContext";
import TipsPageHeader from "../../../components/Layout/TipsPageHeader/TipsPageHeader";

const SalesOfficePage = () => {
	const { setCreateBtn, setEditBtn, setDisplayBtn, setCreateUrl, setEditUrl, setDisplayUrl } = useContext(TipsPageHeaderContext);

	useEffect(() => {
		setCreateBtn("Create Sales Office");
		setEditBtn("Edit Sales Office");
		setDisplayBtn("Display Sales Office");
		setCreateUrl("/createSalesOffice");
		setEditUrl("/editSalesOffice");
		setDisplayUrl("/displaySalesOffice");
	});

	return (
		<>
			<TipsPageHeader />
			<Tips />
		</>
	);
}

export default SalesOfficePage;