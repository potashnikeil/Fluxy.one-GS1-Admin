import React, { useState } from 'react';
import axios from 'axios';

const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file');
      return;
    }

    setStatus('Uploading...');
    const formData = new FormData();
    formData.append('file', file);

    const company_id = 1; // Example: replace with current company ID
    formData.append('company_id', company_id);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('File uploaded successfully');
    } catch (error) {
      setStatus('Error uploading file');
      console.error(error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload CSV</button>
      <p>{status}</p>
    </div>
  );
};

export default CSVUpload;
