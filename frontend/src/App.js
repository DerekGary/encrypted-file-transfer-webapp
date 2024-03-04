// App.js
import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleActionChange = (selectedAction) => {
    setAction(selectedAction);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !action) {
      alert('Please select a file and an action (encrypt/decrypt)!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);

    try {
      const response = await fetch('http://localhost:8000/process-file/', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        // Assuming the response contains a blob representing the processed file
        const blob = await response.blob();
        // Create a URL for the blob
        const downloadUrl = window.URL.createObjectURL(blob);
        // Create a link to download it
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = action === 'encrypt' ? 'encrypted_file' : 'decrypted_file';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert('Failed to process file');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>AES-256 CBC File Encryption</p>
        <input type="file" onChange={handleFileChange} />
        <button onClick={() => handleActionChange('encrypt')}>Encrypt</button>
        <button onClick={() => handleActionChange('decrypt')}>Decrypt</button>
        <button type="submit" onClick={handleSubmit}>Submit</button>
      </header>
    </div>
  );
}

export default App;
