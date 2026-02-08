import React, { useState, useEffect } from "react";
import "./ParticipantPopup.css";

const categoryTitles = ["Contacts", "Leads", "Users"];

const ParticipantPopup = ({
  open,
  onClose,
  contacts = [],
  leads = [],
  users = [],
  selectedParticipants = [],
  onAddParticipants,
}) => {
  // Map participants to a consistent format with a guaranteed unique key
  const formatParticipants = (list) =>
    list.map((item) => ({
      ...item,
      // Use a consistent ID property for the key
      id: item.id || item.contactId || item.userId || item.leadId,
      // Use a consistent name property
      name: item.name || `${item.firstName || ""} ${item.lastName || ""}`.trim(),
      // Use a consistent email property
      email: item.email || item.emailId,
    }));

  const categoryData = {
    Contacts: formatParticipants(contacts),
    Leads: formatParticipants(leads),
    Users: formatParticipants(users),
  };

  const [dropdownValue, setDropdownValue] = useState(categoryTitles[0]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([...selectedParticipants]);
  const [inviteInput, setInviteInput] = useState("");
  const [listFilter, setListFilter] = useState("All");

  // This useEffect ensures that the local `selected` state is in sync
  // with the parent component's `selectedParticipants` prop only when the popup opens.
  useEffect(() => {
    if (open) {
      setSelected(selectedParticipants);
    }
  }, [open, selectedParticipants]);

  if (!open) return null;

  const currentCategoryData = categoryData[dropdownValue] || [];

  const filteredList = currentCategoryData.filter(
    (p) =>
      // Check if p.email is not null or undefined before calling toLowerCase
      p.email &&
      (!search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.email.toLowerCase().includes(search.toLowerCase())) &&
      (listFilter === "All" || selected.includes(p.email))
  );

  const handleToggle = (email) => {
    setSelected((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const handleDone = () => {
    let updated = [...selected];
    if (inviteInput.trim() && !updated.includes(inviteInput.trim())) {
      updated.push(inviteInput.trim());
    }
    onAddParticipants(updated);
    onClose();
  };

  return (
    <div className="participant-popup-backdrop">
      <div className="participant-popup-content">
        <h3>Add Participants</h3>

        <div className="popup-search-bar">
          <select
            className="popup-dropdown"
            value={dropdownValue}
            onChange={(e) => {
              setDropdownValue(e.target.value);
              setSearch("");
              setListFilter("All");
            }}
          >
            {categoryTitles.map((opt) => (
              <option value={opt} key={opt}>
                {opt}
              </option>
            ))}
          </select>

          <input
            className="popup-search-input"
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="popup-select-links">
            <span
              className={listFilter === "All" ? "active-filter" : ""}
              onClick={() => setListFilter("All")}
              style={{ cursor: "pointer", marginRight: 10 }}
            >
              All
            </span>
            <span
              className={listFilter === "Selected" ? "active-filter" : ""}
              onClick={() => setListFilter("Selected")}
              style={{ cursor: "pointer" }}
            >
              Selected ({selected.length})
            </span>
          </div>
        </div>

        <ul className="participant-list">
          {filteredList.length > 0 ? (
            filteredList.map((p) => (
              <li className="participant-list-item blue-style" key={p.id}>
                <input
                  type="checkbox"
                  id={`chk-${p.id}`}
                  checked={selected.includes(p.email)}
                  onChange={() => handleToggle(p.email)}
                />
                <label htmlFor={`chk-${p.id}`}>
                  <span className="participant-name">{p.name}</span>
                  <span className="participant-email">{p.email}</span>
                </label>
              </li>
            ))
          ) : (
            <li className="participant-list-item" style={{ color: "#888" }}>
              No results found
            </li>
          )}
        </ul>

        <div className="invite-email-section">
          <label>
            Invite by Email Address:
            <input
              className="invite-email-input"
              type="email"
              value={inviteInput}
              onChange={(e) => setInviteInput(e.target.value)}
              placeholder="Add Email"
            />
          </label>
        </div>

        <div className="popup-actions">
          <button className="popup-done-btn" onClick={handleDone}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantPopup;