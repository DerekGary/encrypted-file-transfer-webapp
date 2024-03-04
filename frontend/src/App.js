import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8000/upload/', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        alert('File uploaded successfully');
      } else {
        alert('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>File Encryption/Decryption using OpenSSL</p>
        <form onSubmit={handleSubmit}>
          <input type="file" onChange={handleFileChange} />
          <button type="submit">Upload File</button>
        </form>
      </header>
    </div>
  );
}

export default App;
