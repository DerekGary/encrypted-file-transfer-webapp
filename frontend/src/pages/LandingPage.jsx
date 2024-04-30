import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import LoadingAnimation from '../components/LoadingAnimation';
import Cookies from 'js-cookie';
import {
  ready as sodiumReady,
  from_string,
  to_hex,
  to_string,
  crypto_aead_xchacha20poly1305_ietf_encrypt,
  crypto_aead_xchacha20poly1305_ietf_keygen,
} from '../../node_modules/libsodium-wrappers';

function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileLimits, setFileLimits] = useState({ totalFileSizeMb: 5 });

  useEffect(() => {
    const fetchFileLimits = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://api.test-server-0.click/api/file_limits/', {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        setFileLimits(data);
      } catch (error) {
        console.error('Failed to fetch file limits:', error);
      }
      setLoading(false);
    };
    fetchFileLimits();
  }, []);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.size <= (fileLimits.totalFileSizeMb * 1024 * 1024)) {
      setFile(selectedFile);
    } else {
      alert(`File size must be less than ${fileLimits.totalFileSizeMb} MB`);
      event.target.value = null;
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file) {
      alert('Please select a file to upload.');
      return;
    }

    setLoading(true);
    try {
      const csrfToken = Cookies.get('csrftoken');
      const response = await fetch('https://api.test-server-0.click/api/file_process/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
      });
      const data = await response.json();

      console.log('Backend response:', data); // Log to check what the backend returns

      if (data.mainId) {
        const updateResponse = await fetch(`https://api.test-server-0.click/api/update_file/${data.mainId}/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken,
          },
          body: JSON.stringify({ fileName: file.name, fileSize: file.size })  // Assuming these are the details you want to update
        });
        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);
      } else {
        console.log('No mainId received from backend');  // Check if mainId is missing
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
    setLoading(false);
  };

  
  const handleCryptoOperations = async (subId, fileName, file, mainId) => {
    await sodiumReady;
    const key = crypto_aead_xchacha20poly1305_ietf_keygen();
    const fileNameIV = generateIV(subId, 0);
    const encryptedFileName = crypto_aead_xchacha20poly1305_ietf_encrypt(
      new TextEncoder().encode(fileName),
      null,
      null,
      fileNameIV,
      key
    );

    const fileData = await file.arrayBuffer();
    const fileDataIV = generateIV(subId, 1);
    const encryptedFileData = crypto_aead_xchacha20poly1305_ietf_encrypt(
      new Uint8Array(fileData),
      null,
      null,
      fileDataIV,
      key
    );

    console.log("Encrypted File Name:", to_hex(encryptedFileName));
    console.log("Encrypted File Data:", to_hex(encryptedFileData));
    console.log("Encryption Key:", to_hex(key));

    // Sending encrypted data to the backend
    const updateResponse = await fetch(`https://api.test-server-0.click/api/update_file/${mainId}/`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subId: subId,
        fileName: to_hex(encryptedFileName),
        fileSize: file.size
      })
    });
    const updateData = await updateResponse.json();
    console.log('Update response:', updateData);
  };

  const factorial = (n) => {
    let result = BigInt(1);
    for (let i = 1n; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  
  const getPermutation = (subID, index, totalIVs = 2500) => {
    const size = 20;
    const numberOfDigits = 4;
    const uniqueKey = createUniqueKey(subID, size);
    const factorials = Array.from({ length: size + 1 }, (_, i) => factorial(BigInt(i)));

    let permutationIndex = BigInt(index) * (factorials[size] / BigInt(totalIVs));
    let temp = uniqueKey.split('');
    let result = '';

    for (let i = size; i > 0; i--) {
      const selected = Number(permutationIndex / factorials[i - 1]);
      result += temp[selected];
      permutationIndex %= factorials[i - 1];
      temp.splice(selected, 1);
    }

    const indexString = index.toString().padStart(numberOfDigits, '0');
    return result + indexString;
  };

  const createUniqueKey = (subID, size) => {
    let uniqueKey = '';
    let seen = new Set();

    for (let char of subID) {
      if (!seen.has(char) && uniqueKey.length < size) {
        seen.add(char);
        uniqueKey += char;
      }
    }

    return uniqueKey;
  };

  const generateIV = (subID, index) => {
    const permutedString = getPermutation(subID, index);
    return from_string(permutedString);
  };

  return (
    <Layout>
      <div className="container mt-12">
        {loading ? <LoadingAnimation /> : (
          <div className="row justify-content-center">
            <div className="col g-0">
              <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
                <h1>Welcome to Secure File Transfer</h1>
                <p>This application allows you to securely send files to other users. Upload a file to create a secure QR code.</p>
                <form onSubmit={handleUpload}>
                  <input type="file" name="file" required onChange={handleFileChange} />
                  <button type="submit" className="btn btn-success">Upload File</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default LandingPage;
