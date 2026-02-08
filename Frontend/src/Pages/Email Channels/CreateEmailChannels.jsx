import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateEmailChannelForm from './CreateEmailChannelForm';

const CreateEmailChannels = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    console.log('CreateEmailChannels back button clicked');
    navigate('/channels/emails');
  };

  return (
    <div>
      <button 
        onClick={handleBack}
        style={{
          marginBottom: "1.5rem",
          padding: "8px 20px",
          background: "#f3f4f6",
          border: "1px solid #d1d5db",
          borderRadius: "4px",
          cursor: "pointer",
          fontSize: "14px",
          color: "#374151"
        }}
      >
        ← Back to Email Channels
      </button>
      <CreateEmailChannelForm />
    </div>
  );
};

export default CreateEmailChannels;
