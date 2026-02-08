import { useNavigate } from "react-router-dom";
import { Save, CircleX } from "lucide-react";
import "./CreateNewCategory.css";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const BASE_URL_SM = import.meta.env.VITE_API_BASE_URL_SM;

const CreateNewCategory = () => {
    const navigate = useNavigate();

    // Helper to generate IDs
    const generateId = () => {
        return `CAT-${Math.floor(100000 + Math.random() * 900000)}`;
    };

    const [formData, setFormData] = useState({
        productCategoryId: "",
        productCategoryName: "",
        productAssignmentAllowed: false,
        status: "",
        numberOfSubCategories: 0,
        subCategories: [],
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [subCategoryCountInput, setSubCategoryCountInput] = useState("");
    const MAX_SUBCATEGORIES = 50;

    // Auto-generate Main ID on mount
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            productCategoryId: generateId()
        }));
    }, []);

    const getError = (field, index = null) => {
        if (index !== null) {
            const key = `subCategories.${index}.${field}`;
            return errors[key] ? errors[key].join(", ") : null;
        }
        return errors[field] ? errors[field].join(", ") : null;
    };

    const FIELD_MAP = {
        "parent.categoryId": "productCategoryId",
        "parent.name": "productCategoryName",
        "parent.status": "status",
        categoryId: "subCategoryId",
        name: "subCategoryName",
        status: "subCategoryStatus",
    };

    const handleChange = (e) => {
        const { id, type, checked, value } = e.target;

        if (errors[id]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        }

        setFormData((prev) => ({
            ...prev,
            [id]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSave = async (type) => {
        try {
            setLoading(true);
            setErrors({});

            // 1️⃣ Build MAIN payload
            const parentPayload = {
                categoryId: formData.productCategoryId || "",
                name: formData.productCategoryName || "",
                status: formData.status || "",
                productAssignmentAllowed: formData.productAssignmentAllowed,
                parentCategoryId: null,
                type: "MAIN",
            };

            // 2️⃣ Build SUB-Categories payload
            const subPayloads = formData.subCategories.map((sub) => ({
                categoryId: sub.subCategoryId || "",
                name: sub.subCategoryName || "",
                status: sub.subCategoryStatus || "",
                productAssignmentAllowed: sub.subCategoryAssignmentAllowed,
                type: "SUB",
            }));

            // 3️⃣ Consolidated request
            const response = await fetch(`${BASE_URL_SM}/product-category`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    parent: parentPayload,
                    subCategories: subPayloads,
                }),
            });

            const result = await response.json().catch(() => null);

            // 4️⃣ Handle validation errors
            if (!response.ok) {
                if (result?.errors) {
                    const map = {};
                    result.errors.forEach((err) => {
                        let key = err.path;
                        if (FIELD_MAP[key]) key = FIELD_MAP[key];

                        const match = key.match(/^subCategories\[(\d+)\]\.(.+)$/);
                        if (match) {
                            const index = match[1];
                            let field = match[2];
                            if (FIELD_MAP[field]) field = FIELD_MAP[field];
                            key = `subCategories.${index}.${field}`;
                        }

                        if (!map[key]) map[key] = [];
                        map[key].push(err.msg);
                    });

                    setErrors(map);
                    toast.error("Validation error");
                    return;
                }
                toast.error("Failed to create product category");
                return;
            }

            // 5️⃣ SUCCESS
            toast.success("Product category created successfully!");

            if (type === "save") {
                return navigate("/products/productcategories");
            } else {
                // Reset for Save & New
                setFormData({
                    productCategoryId: generateId(), // Generate new ID
                    productCategoryName: "",
                    productAssignmentAllowed: false,
                    status: "",
                    numberOfSubCategories: 0,
                    subCategories: [],
                });
                setSubCategoryCountInput("");
            }
        } catch (error) {
            console.error("Error saving product category:", error);
            toast.error("Unexpected error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handleNumberChange = (e) => {
        const value = e.target.value;
        setSubCategoryCountInput(value);

        setErrors((prev) => {
            const updated = { ...prev };
            delete updated.numberOfSubCategories;
            return updated;
        });

        if (value === "") return;

        let newCount = parseInt(value, 10);
        if (isNaN(newCount) || newCount < 0) return;

        if (newCount > MAX_SUBCATEGORIES) {
            newCount = MAX_SUBCATEGORIES;
            setSubCategoryCountInput(String(MAX_SUBCATEGORIES));
            setErrors((prev) => ({
                ...prev,
                numberOfSubCategories: [`Maximum ${MAX_SUBCATEGORIES} sub-categories allowed`],
            }));
            return;
        }

        setFormData((prev) => {
            const current = [...prev.subCategories];
            const oldCount = current.length;

            if (newCount > oldCount) {
                // Create blanks with AUTO-GENERATED IDs
                const blanks = Array.from(
                    { length: newCount - oldCount },
                    () => ({
                        subCategoryId: generateId(), 
                        subCategoryName: "",
                        subCategoryStatus: "",
                        subCategoryAssignmentAllowed: false,
                    })
                );

                return {
                    ...prev,
                    numberOfSubCategories: newCount,
                    subCategories: [...current, ...blanks],
                };
            }

            if (newCount < oldCount) {
                return {
                    ...prev,
                    numberOfSubCategories: newCount,
                    subCategories: current.slice(0, newCount),
                };
            }

            return prev;
        });
    };

    const handleSubCategoryChange = (index, field, value) => {
        const updated = [...formData.subCategories];
        updated[index][field] = value;
        setFormData((prev) => ({
            ...prev,
            subCategories: updated,
        }));
    };

    const clearSubError = (field, index) => {
        const key = `subCategories.${index}.${field}`;
        if (errors[key]) {
            setErrors((prev) => {
                const updated = { ...prev };
                delete updated[key];
                return updated;
            });
        }
    };

    return (
        <div className="prodcat-create-container">
            <div className="prodcat-create-header-container">
                <h1 className="prodcat-create-heading">New Product Category</h1>
                <div className="prodcat-create-header-container-buttons">
                    <button className="prodcat-create-save-button" onClick={() => handleSave("save")}>
                        <Save size={17} strokeWidth={1} color="#dcf2f1" />
                        {loading ? "Saving..." : "Save"}
                    </button>
                    <button className="prodcat-create-save-and-new-button" onClick={() => handleSave("saveAndNew")}>
                        <Save size={17} strokeWidth={1} color="#0f1035" />
                        {loading ? "Saving..." : "Save and New"}
                    </button>
                    <button className="prodcat-create-cancel-button" onClick={() => navigate("/products/productcategories")}>
                        <CircleX size={17} strokeWidth={1} color="#0f1035" />
                        Cancel
                    </button>
                </div>
            </div>

            <div className="prodcat-create-form-container">
                <h1 className="prodcat-create-form-heading">Product Category Information</h1>
                <div className="prodcat-create-form">
                    <form>
                        {/* Row 1 */}
                        <div className="prodcat-create-form-row">
                            <div className="prodcat-create-form-group productCategoryId">
                                <label htmlFor="productCategoryId">Product Category ID *</label>
                                <input
                                    type="text"
                                    id="productCategoryId"
                                    placeholder="Primary Key (Locked)"
                                    value={formData.productCategoryId}
                                    disabled={true} 
                                    style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                                />
                                {getError("productCategoryId") && <div className="field-error">{getError("productCategoryId")}</div>}
                            </div>
                            <div className="prodcat-create-form-group productCategoryName">
                                <label htmlFor="productCategoryName">Product Category Name *</label>
                                <input
                                    type="text"
                                    id="productCategoryName"
                                    value={formData.productCategoryName}
                                    onChange={handleChange}
                                    placeholder="Enter Category Name"
                                />
                                {getError("productCategoryName") && <div className="field-error">{getError("productCategoryName")}</div>}
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="prodcat-create-form-row">
                            <div className="prodcat-create-form-group status">
                                <label htmlFor="status">Status *</label>
                                <select id="status" value={formData.status} onChange={handleChange}>
                                    <option value="">Select Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="CLOSED">Closed</option>
                                </select>
                                {getError("status") && <div className="field-error">{getError("status")}</div>}
                            </div>
                            <div className="prodcat-create-form-group productAssignmentAllowed">
                                <input
                                    type="checkbox"
                                    id="productAssignmentAllowed"
                                    checked={formData.productAssignmentAllowed}
                                    onChange={handleChange}
                                />
                                <label htmlFor="productAssignmentAllowed">Product Assignment Allowed</label>
                            </div>
                        </div>

                        {/* Sub-Category Count */}
                        <div className="prodcat-create-form-row">
                            <div className="prodcat-create-form-group numberOfSubCategories">
                                <label htmlFor="numberOfSubCategories">Number of Sub-Category</label>
                                <input
                                    type="number"
                                    id="numberOfSubCategories"
                                    min={0}
                                    max={50}
                                    value={subCategoryCountInput}
                                    onChange={handleNumberChange}
                                />
                                {getError("numberOfSubCategories") && <div className="field-error">{getError("numberOfSubCategories")}</div>}
                            </div>
                        </div>

                        {/* Sub-Category Fields */}
                        {formData.numberOfSubCategories > 0 && formData.subCategories.map((subCat, index) => (
                            <div className="prodcat-create-sub-category-block" key={index}>
                                <div className="prodcat-create-form-row">
                                    <div className={`prodcat-create-form-group subCategoryId-${index}`}>
                                        <label>Sub-Category ID *</label>
                                        <input
                                            type="text"
                                            placeholder="Primary Key (Locked)"
                                            value={subCat.subCategoryId}
                                            disabled={true} 
                                            style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                                            id={`subCategoryId-${index}`}
                                        />
                                        {getError("subCategoryId", index) && <div className="field-error">{getError("subCategoryId", index)}</div>}
                                    </div>
                                    <div className={`prodcat-create-form-group subCategoryName-${index}`}>
                                        <label htmlFor={`subCategoryName-${index}`}>Sub-Category Name *</label>
                                        <input
                                            type="text"
                                            id={`subCategoryName-${index}`}
                                            value={subCat.subCategoryName}
                                            onChange={(e) => {
                                                handleSubCategoryChange(index, "subCategoryName", e.target.value);
                                                clearSubError("subCategoryName", index);
                                            }}
                                            placeholder="Enter Sub-Category Name"
                                        />
                                        {getError("subCategoryName", index) && <div className="field-error">{getError("subCategoryName", index)}</div>}
                                    </div>
                                </div>

                                <div className="prodcat-create-form-row">
                                    <div className={`prodcat-create-form-group subCategoryStatus-${index}`}>
                                        <label htmlFor={`subCategoryStatus-${index}`}>Status *</label>
                                        <select
                                            id={`subCategoryStatus-${index}`}
                                            value={subCat.subCategoryStatus}
                                            onChange={(e) => {
                                                handleSubCategoryChange(index, "subCategoryStatus", e.target.value);
                                                clearSubError("subCategoryStatus", index);
                                            }}
                                        >
                                            <option value="">Select Status</option>
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="CLOSED">Closed</option>
                                        </select>
                                        {getError("subCategoryStatus", index) && <div className="field-error">{getError("subCategoryStatus", index)}</div>}
                                    </div>
                                    <div className={`prodcat-create-form-group subCategoryAssignmentAllowed-${index}`}>
                                        <input
                                            type="checkbox"
                                            id={`subCategoryAssignmentAllowed-${index}`}
                                            checked={subCat.subCategoryAssignmentAllowed}
                                            onChange={(e) => {
                                                handleSubCategoryChange(index, "subCategoryAssignmentAllowed", e.target.checked);
                                                clearSubError("subCategoryAssignmentAllowed", index);
                                            }}
                                        />
                                        <label htmlFor={`subCategoryAssignmentAllowed-${index}`}>Sub-Category Assignment Allowed</label>
                                        {getError("subCategoryAssignmentAllowed", index) && <div className="field-error">{getError("subCategoryAssignmentAllowed", index)}</div>}
                                    </div>
                                </div>
                            </div>
                        ))}

                        <span className="prodcat-create-required-field-text">* Required Field</span>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateNewCategory;