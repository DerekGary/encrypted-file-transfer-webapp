// encrypted-file-transfer/frontend/src/App.js
// Frontend for the AES-256 CBC File Encryption project
// This file contains the main React component for the frontend
// It allows users to select a file, choose an action (encrypt or decrypt),
// and submit the file for processing. It does this by sending a POST request
// to the backend API, which processes the file and returns the result.

import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const [uuid, setUuid] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [fileName, setFileName] = useState('');
  const apiBaseUrl = 'api/';

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    if (action === 'decrypt') {
      setFileName(event.target.files[0].name.replace('.enc', ''));
    } else {
      setFileName(event.target.files[0].name + '.enc');
    }
  };

  const handleActionChange = (event) => {
    setAction(event.target.value);
    if (event.target.value === 'decrypt' && uuid) {
      setDownloadLink('');
    }
  };

  const handleUUIDChange = (event) => {
    setUuid(event.target.value);
  };

  // Event handler for the submit button.
  // Checks whether a file and action have been selected
  // for encryption or decryption.
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !action) {
      alert('Please select a file and an action!');
      return;
    }

    // If the file and action have been chosen,
    // 
    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);
    if (action === 'decrypt') {
      formData.append('uuid', uuid);
    }

    
    try {
      const response = await fetch(`${apiBaseUrl}/process_file/`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (action === 'encrypt') {
          setUuid(data.uuid); // Set UUID for possible decryption later
        } else {
          setFileName(data.original_name); // Set the original file name for the download
        }
        const downloadBlob = new Blob([Uint8Array.from(atob(data.encrypted_file || data.decrypted_file), c => c.charCodeAt(0))], { type: 'application/octet-stream' });
        setDownloadLink(URL.createObjectURL(downloadBlob));
      } else {
        alert('Failed to process file.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file.');
    }
  };

  // This section dictates the HTML for the frontend. It includes
  // the file input, action selection, submit button, UUID input,
  // and download link for the encrypted or decrypted file.
  // It could also be thought of as being the entry point for the
  // frontend application, as it is the main component rendered by
  // the React application.

  // If we would like to change the styling up for our applications,
  // then we would need to modify the CSS file 'App.css' in the same
  // directory as this file, and that would link up with the HTML found
  // in this section. HTML is for the structure of the page, CSS is for
  // the styling, and JavaScript (React-JS in this case) is for the interactivity.
  // The JS code in this file is found above in the 'App' function.
  return (
    <div className="App">
      <header className="App-header">
        <p>AES-256 CBC File Encryption</p>
        <div className="inline-container">
          <input type="file" onChange={handleFileChange} />
          <div>
            <label className="radio-btn">
              <input type="radio" value="encrypt" checked={action === 'encrypt'} onChange={handleActionChange} /> Encrypt
            </label>
            <label className="radio-btn">
              <input type="radio" value="decrypt" checked={action === 'decrypt'} onChange={handleActionChange} /> Decrypt
            </label>
          </div>
        </div>
        <div className="submit-button-container">
          <button onClick={handleSubmit}>Submit</button>
        </div>
      </header>
      <div className="uuid-input-container">
        <input
          type="text"
          placeholder="Enter UUID for Decryption"
          value={uuid}
          onChange={handleUUIDChange}
        />
      </div>
      {downloadLink && (
        <a href={downloadLink} download={fileName}>Download {action === 'encrypt' ? 'Encrypted' : 'Decrypted'} File</a>
      )}
      <div className="tips-section">
        <p className="tips-title">How to Use</p>
        <ol>
          <li>Choose file to encrypt or decrypt.</li>
          <li>Click 'Encrypt' or 'Decrypt' and 'Submit'.</li>
          <li>For decryption, enter the UUID generated during encryption.</li>
          <li>Download the resulting file.</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
