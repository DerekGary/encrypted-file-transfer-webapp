// ./frontend/src/pages/LandingPage.jsx

import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { handleFileChange, handleUpload } from '../components/handleUpload'
import LoadingAnimation from '../components/LoadingAnimation'
import Cookies from 'js-cookie';
const csrfToken = Cookies.get('csrfToken');
// import {
//     ready as sodiumReady, from_string, to_hex, to_string, crypto_aead_xchacha20poly1305_ietf_encrypt,
//     crypto_aead_xchacha20poly1305_ietf_keygen, crypto_aead_xchacha20poly1305_ietf_decrypt
// } from 'libsodium-wrappers';


function LandingPage() {
    // const handleUpload = async (event) => {

    //     event.preventDefault();
    //     const formData = new FormData(event.currentTarget);
    //     formData.append('file', event.currentTarget.file.files[0]);
    //     try {
    //         const response = await fetch('https://api.test-server-0.click/api/file_process/',
    //             {
    //                 method: 'POST',
    //                 body: formData,
    //                 headers:

    //                 {
    //                     'X-CSRFToken': Cookies.get('csrftoken'), // Always pass the CSRF token, Derek! (-_-")
    //                 },
    //             }
    //         );

    //         const data = await response.json();

    //         if (data.url) {
    //             alert(`File uploaded! Download link: ${data.url}`);

    //             // Save the URL in local storage
    //             localStorage.setItem('fileDownloadLink', JSON.stringify({ url: data.url, timestamp: new Date().getTime() }));
    //         } else {
    //             alert('Failed to upload file.');
    //         }
    //     } catch (error) {
    //         console.error('Upload error:', error);
    //         alert('An error occurred while uploading the file.');
    //     }
    // };


    // Sort of serves as an on/off switch for our loading.
    // Starts in the Off State
    const [loading, setLoading] = useState(false);
    const [fileLimits, setFileLimits] = useState(null);

    useEffect(() => {
        const csrfToken = Cookies.get('csrfToken'); // Properly retrieve the CSRF token
        async function fetchFileLimits() {
            setLoading(true);
            try {
                const response = await fetch('https://api.test-server-0.click/api/file_limits/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                });
                const data = await response.json();
                console.log('List of file limits:', data);
                setFileLimits(data);
            } catch (error) {
                console.error('Error returning file limits:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFileLimits();
    }, []);

    // useEffect(() => {
    //     async function handleCryptoOperations(subId, fileName, file) {
    //         await sodiumReady;

    //         function shuffleString(str) {
    //             let arr = str.split("");
    //             for (let i = arr.length - 1; i > 0; i--) {
    //                 let j = Math.floor(Math.random() * (i + 1));
    //                 [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    //             }
    //             return arr.join("");
    //         }

    //         function generateIV(baseString, index) {
    //             const encodedString = Array.from(baseString).map(char =>
    //                 String.fromCharCode((char.charCodeAt(0) - 32) % 95 + 32)
    //             ).join('');
    //             const shuffled = shuffleString(encodedString);
    //             const permutation = shuffled.substring(0, 20);
    //             const indexStr = index.toString().padStart(4, '0');
    //             let resultString = permutation + indexStr;

    //             for (let i = 0; i < 3; i++) {
    //                 if (resultString[20 + i] === '0') {
    //                     resultString = resultString.substring(0, 20 + i) +
    //                         shuffled.charAt(Math.floor(Math.random() * 20)) +
    //                         resultString.substring(20 + i + 1);
    //                 }
    //             }
    //             return from_string(resultString); // Convert to bytes for IV
    //         }

    //         const fileNameIndex = 0;
    //         const fileDataIndex = 1;

    //         const key = crypto_aead_xchacha20poly1305_ietf_keygen();

    //         const fileNameIV = generateIV(subId, fileNameIndex);
    //         const encryptedFileName = crypto_aead_xchacha20poly1305_ietf_encrypt(
    //             fileName, null, null, fileNameIV, key
    //         );

    //         const fileDataIV = generateIV(subId, fileDataIndex);
    //         const fileData = await file.arrayBuffer();
    //         const encryptedFileData = crypto_aead_xchacha20poly1305_ietf_encrypt(
    //             fileData, null, null, fileDataIV, key
    //         );

    //         return {
    //             encryptedFileName: to_hex(encryptedFileName),
    //             encryptedFile: new Blob([encryptedFileData], { type: file.type }),
    //             key: to_hex(key),
    //         };
    //     }
    // }, []);

    useEffect(() => {
        const csrfToken = Cookies.get('csrfToken'); // Ensure to get CSRF token
        async function checkS3Connection() {
            try {
                const response = await fetch('https://api.test-server-0.click/api/test_s3/', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': csrfToken,
                    },
                });
                const data = await response.json();
                console.log('S3 Connection Test:', data);
            } catch (error) {
                console.error('Error testing S3 connection:', error);
            }
        }

        checkS3Connection();
    }, []);

    return (
        <Layout>
            <div className="container mt-12">
                {loading ? <LoadingAnimation /> : (
                    <div className="row justify-content-center">
                        <div className="col g-0">
                            <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
                                <h1>Welcome to Secure File Transfer</h1>
                                <p>This application allows you to securely send files to other users. Upload a file to create a secure QR code.</p>
                                <form onSubmit={handleUpload} className="mt-4">
                                    <input type="file" name="file" required onChange={(event) => handleFileChange(event, fileLimits)} />
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