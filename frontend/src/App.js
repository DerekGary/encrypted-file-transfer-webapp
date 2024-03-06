import React, { useState } from 'react';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [action, setAction] = useState('');
  const [uuid, setUuid] = useState('');
  const [downloadLink, setDownloadLink] = useState('');
  const [fileName, setFileName] = useState('');

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file || !action) {
      alert('Please select a file and an action!');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('action', action);
    if (action === 'decrypt') {
      formData.append('uuid', uuid);
    }

    try {
      const response = await fetch('http://localhost:8000/process_file/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (action === 'encrypt') {
          setUuid(data.uuid); // Set UUID for possible decryption later
          // No need to change fileName, it's set on file selection
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
          <li>Choose file to encrypt.</li>
          <li>Click Encrypt and Submit.</li>
          <li>Copy and store the UUID generated.</li>
          <li>Choose the encrypted file.</li>
          <li>Enter the UUID associated with the encrypted file.</li>
          <li>Click Decrypt and Submit.</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
