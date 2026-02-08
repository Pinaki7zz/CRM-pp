import { useState, useContext, useEffect } from "react";
import { FormPageHeaderContext } from "../../../../contexts/FormPageHeaderContext";
import FormPageHeader from "../../../../components/Layout/FormPageHeader/FormPageHeader";
import "../../../../components/Layout/Styles/BoxFormStyles.css";
import { FaEdit, FaSave } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

export default function EditSalesTeamForm() {
  const { setGoBackUrl } = useContext(FormPageHeaderContext);
  const { salesTeamCode } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    salesTeamCode: "",
    salesTeamName: "",
  });

  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalData, setOriginalData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setGoBackUrl("/displaySalesTeamPage");
    fetchSalesTeamData();
  }, [setGoBackUrl, salesTeamCode]);

  const fetchSalesTeamData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3003/api/sales-teams/${salesTeamCode}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch sales team data");
      }
      const data = await response.json();
      setFormData({
        salesTeamCode: data.salesTeamCode,
        salesTeamName: data.salesTeamName,
      });
      setOriginalData({
        salesTeamCode: data.salesTeamCode,
        salesTeamName: data.salesTeamName,
      });
    } catch (error) {
      console.error("Error fetching sales team:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case "salesTeamCode":
        if (!/^[a-zA-Z0-9]{4}$/.test(value)) {
          return "Sales Team Code must be exactly 4 alphanumeric characters";
        }
        break;
      case "salesTeamName":
        if (value.length > 30 || !/^[a-zA-Z0-9 ]+$/.test(value)) {
          return "Sales Team Name must be alphanumeric and up to 30 characters";
        }
        break;
      default:
        return "";
    }
    return "";
  };

  const handleChange = (e) => {
    if (!isEditing) return;

    const { name, value } = e.target;

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEditing) return; // Prevent submission when not in edit mode

    setIsSubmitting(true);

    let formValid = true;
    const newErrors = {};

    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        formValid = false;
      }
    });

    setErrors(newErrors);

    if (!formValid) {
      setIsSubmitting(false);
      alert("Please fix the errors in the form before submitting.");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3003/api/sales-teams/${salesTeamCode}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            salesTeamName: formData.salesTeamName,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update sales team");
      }

      const result = await response.json();
      alert("Sales Team updated successfully!");
      setOriginalData(formData);
      setIsEditing(false);
      await fetchSalesTeamData();
      navigate("/displaySalesTeamPage");
    } catch (error) {
      console.error("Error updating sales team:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault(); // Prevent form submission
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormData(originalData);
    setErrors({});
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <>
      <div className="container">
        {/* Move edit controls outside the form */}
        <div className="edit-controls">
          {isEditing ? (
            <button
              type="submit"
              form="salesTeamForm"
              className="save-button-edit-page"
              disabled={isSubmitting}
            >
              <FaSave /> {isSubmitting ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              type="button"
              className="edit-button-edit-page"
              onClick={handleEdit}
            >
              <FaEdit /> Edit
            </button>
          )}
        </div>

        <form id="salesTeamForm" onSubmit={handleSubmit}>
          <div className="header-box">
            <h2>Sales Team Details</h2>
            <div className="data-container">
              <div className="data">
                <label htmlFor="salesTeamCode">Sales Team Code*</label>
                <span className="info-icon-tooltip">
                  <i className="fas fa-info-circle" />
                  <span className="tooltip-text">
                    1- Sales Team Code must be exactly 4 digits. <br />
                    2- Sales Team Code must be unique. <br />
                    3- Sales Team Code must not contain any special characters.{" "}
                    <br />
                    4- Sales Team Code must not contain any spaces. <br />
                    5- Sales Team Code cannot be changed after creation. <br />
                  </span>
                </span>
                <input
                  type="text"
                  id="salesTeamCode"
                  name="salesTeamCode"
                  value={formData.salesTeamCode}
                  onChange={handleChange}
                  maxLength={4}
                  required
                  readOnly
                  className="read-only"
                />
              </div>
              <div className="data">
                <label htmlFor="salesTeamName">Sales Team Name*</label>
                <span className="info-icon-tooltip">
                  <i className="fas fa-info-circle" />
                  <span className="tooltip-text">
                    Sales Team Name must be alphanumeric and up to 30
                    characters.
                  </span>
                </span>
                <input
                  type="text"
                  id="salesTeamName"
                  name="salesTeamName"
                  value={formData.salesTeamName}
                  onChange={handleChange}
                  maxLength={30}
                  required
                  readOnly={!isEditing}
                  className={!isEditing ? "read-only" : ""}
                />
                {errors.salesTeamName && (
                  <span className="error">{errors.salesTeamName}</span>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
      <FormPageHeader onCancel={handleCancelEdit} />
    </>
  );
}
