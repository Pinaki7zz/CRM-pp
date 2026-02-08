import React from "react";
import { useNavigate } from "react-router-dom";
import "./NewOrganizationalCreation.css";

const NewOrganizationalCreation = () => {
  const navigate = useNavigate();

  const handleSave = (type) => {
    if (type === "save") {
      navigate("/business-structure/org-hub");
    } else if (type === "saveAndNew") {
      navigate("/business-structure/org-hub/createNewOrg");
    }
  };

  return (
    <>
      {/* Create Product Category Page Header Section */}
      <div className="header-container">
        <div className="header-container-heading">
          <h1 className="account-heading">New Organization</h1>
        </div>
        <div className="header-container-buttons">
          <button
            className="cancel-button"
            onClick={() => navigate("/business-structure/org-hub")}
          >
            Cancel
          </button>
          <button className="save-button" onClick={() => handleSave("save")}>
            Save
          </button>
          <button
            className="save-and-new-button"
            onClick={() => handleSave("saveAndNew")}
          >
            Save and New
          </button>
        </div>
      </div>

      {/* Product Container */}
      <div className="product-container">
        <div className="product-heading">
          <h1>ORG Information</h1>
        </div>
        <div className="product-form">
          <form>
            <div className="form-group productid">
              <label htmlFor="Valid From">Valid From</label>
              <input type="Date" placeholder="Valid From" id="validFrom" />
            </div>
            <div className="form-group productname">
              <label htmlFor="Valid To">Valid To</label>
              <input type="Date" placeholder="Valid To" id="validTo" />
            </div>
            <div className="form-group location">
              <label htmlFor="location">location</label>
              <input type="text" placeholder="Location" id="location" />
            </div>
            <div className="form-group status">
              <label htmlFor="Company Name">Country</label>
              <input type="text" placeholder="Country" id="Country" />
            </div>
            <div className="form-group companyName">
              <label htmlFor="Company Name">Company Name</label>
              <input type="text" placeholder="Company Name" id="companyName" />
            </div>

            <div className="form-group productcategory">
              <label htmlFor="Sales">Suggestion</label>
              <select id="sales">
                <option value="">Sales</option>
                <option value="">Service</option>
                <option value="">Marketing</option>
                <option value="">Service Org</option>
                <option value="">Sales Org</option>
                <option value="">Other</option>
              </select>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewOrganizationalCreation;
