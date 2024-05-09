// Authors: Derek Gary, Takaiya Jones

// Import necessary components and libraries
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import LoadingAnimation from '../components/LoadingAnimation';
import Cookies from 'js-cookie'; // Used to handle browser cookies
import QRCode from 'qrcode.react'; // React component for generating QR codes
import { factorial } from '../components/CryptoOperations';

// Import cryptographic functions from libsodium
import {
    ready as sodiumReady, // Function to ensure sodium is loaded before use
    from_string, // Convert string to bytes
    to_hex, // Convert bytes to hexadecimal string
    from_hex, // Convert hexadecimal string to bytes
    to_string, // Convert bytes to string
    crypto_aead_xchacha20poly1305_ietf_encrypt, // Encrypt function for XChaCha20Poly1305
    crypto_aead_xchacha20poly1305_ietf_decrypt, // Decrypt function
    crypto_aead_xchacha20poly1305_ietf_keygen, // Generate a random key
} from '../../node_modules/libsodium-wrappers';

function LandingPage() {
    // State variables to manage component data. useState is used in React to create a local state for a function component. Each state variable declared with useState returns a pair: the current state value and a function that lets you update it. This preserves state between re-renders and enables React to update the component's output based on user actions or lifecycle events.  const [loading, setLoading] = useState(false); // Track loading state
    const [file, setFile] = useState(null); // Store the uploaded file object
    const [encrypted, setEncrypted] = useState(false); // Flag to check if the file has been encrypted
    const [fileLimits, setFileLimits] = useState({ totalFileSizeMb: 5 }); // Limits on file size
    const [key, setKey] = useState(null); // Encryption key
    const [ID, setID] = useState(null); // ID from server
    const [subId, setSubId] = useState(null); // Sub ID from server
    const [loading, setLoading] = useState(true);
    const [encryptedFileName, setEncryptedFileName] = useState(null); // Encrypted file name
    const [encryptedFileData, setEncryptedFileData] = useState(null); // Encrypted file data
    const [subKey, setSubKey] = useState(null); // Combination of subId and key

    // Effect to fetch file limits when component mounts

    /*
 * What's async and await about?
 * The 'async' keyword is used to declare a function as asynchronous, 
 * meaning it can perform asynchronous operations, such as fetching data over a network.
 * Inside this function, we use "await" to pause the execution until the "fetch" operation has completed.
 *
 * fetch(URL) - This is used to make network requests to the given URL. Fetch returns a Promise 
 * that resolves to the Response to that request, whether it is successful or not. Using await 
 * in front of fetch means execution of this function will pause until fetch has completed and 
 * the Promise resolves.
 * A Promise is an object representing the eventual completion or failure of an asynchronous operation in JavaScript.
 *
 * const response - Here, 'response' is the variable that will hold the Response object returned 
 * by the fetch operation. This response object includes various properties and methods to work 
 * with the data that was retrieved, including a method to convert the body of the response to JSON,
 * if it was returned in that format.
 *
 * Using async/await makes asynchronous code look and behave a little more like synchronous code, 
 * which can help make it more readable and understandable.
 */
 
 /*
  * What's a useEffect Hook?
  useEffect is a React Hook that allows you to perform side effects in functional components.

  Side effects are operations that affect things outside the scope of the current function, such as:

  - Fetching data from an API
  - Setting up subscriptions or timers
  - Manually changing the DOM (although it's generally recommended to let React handle DOM updates)

  useEffect takes two arguments:

  1. A function that contains the side effect logic. This function can be asynchronous (using async/await) and can perform any necessary actions.

  2. An optional dependency array. This array lists the values that the effect depends on. If any of these values change between renders, the effect will re-run. 
     - An empty array ([]) means the effect will only run once when the component mounts.

  Common Use Cases for useEffect:

  - Fetching data when a component mounts or when certain props change.
  - Setting up event listeners (e.g., for window resize or scroll events).
  - Performing cleanup tasks when a component unmounts (e.g., removing event listeners or clearing timers).
  */
  
  /*
  Hooks are functions in React that let you "hook into" React features like state and lifecycle management from functional components.

  Hooks provide a more concise and functional way to manage state, side effects, and other React features without writing class components.
*/
    useEffect(
        () => 
        {
            const fetchFileLimits = async () => {
                setLoading(true); // Start loading
                try {
                    // Fetch file limits from the server
                    const response = await fetch(
                        'https://api.test-server-0.click/api/file_limits/',
                        {
                            method: 'GET',
                            credentials: 'include',
                            headers:
                            {
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    const data = await response.json();
                    setFileLimits(data);
                }
                catch (error) {
                    console.error('Failed to fetch file limits:', error);
                }
                setLoading(false); // End loading
            };
            fetchFileLimits();
        },
        []
        /*
 * The brackets `[]` at the end of a useEffect hook are actually the dependency array for that hook.
 * The dependency array is a crucial feature of React's useEffect hook. It tells React which variables 
 * to keep track of between re-renders. When any variable in this array changes, the effect will re-run.
 *
 * - If you pass an empty array `[]`, it means that the useEffect hook will run exactly once after the initial render.
 *   This is useful for setup effects that should only execute once and do not depend on any props or state.
 */
    );

    // Handler for file input change
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile && selectedFile.size <= (fileLimits.totalFileSizeMb * 1024 * 1024)) {
            setFile(selectedFile); // Store the file if it's under the size limit
        } else {
            alert(`File size must be less than ${fileLimits.totalFileSizeMb} MB`);
            event.target.value = null; // Reset file input
        }
    };

    // Handler to upload and encrypt the file
    const handleUpload = async (event) => {
        event.preventDefault(); // Prevent form submission
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        setLoading(true); // Start loading
        try {
            // Fetch CSRF token for secure requests
            const csrfToken = Cookies.get('csrftoken');
            const response = await fetch('https://api.test-server-0.click/api/file_process/', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken }
            });
            const data = await response.json();

            console.log('Backend response:', data);

            if (data.id && data.subId) {
                // Handle encryption after successful server response
                handleEncryption(data.subId, file.name, file, data.id)
                    .then(() => {
                        console.log("Crypto operations completed successfully.");
                        setEncrypted(true); // Mark as encrypted
                        setSubId(data.subId); // Store sub ID
                        setID(data.id); // Store main ID
                    })
                    .catch(error => {
                        console.error("Error during crypto operations", error);
                    });
            } else {
                console.error("Error retrieving necessary data from backend for encryption.");
            }
        } catch (error) {
            console.error('Error during file processing:', error);
        } finally {
            setLoading(false); // End loading
        }
    };

    // Effect to handle file upload after ID and subId are set
    useEffect(() => {
        if (ID && subId) {
            uploadFileToS3(ID, subId);
        }
    }, [ID, subId]);

    // Function to upload encrypted file to AWS S3 using a presigned URL
    const uploadFileToS3 = async (ID, subId) => {
        const csrfToken = Cookies.get('csrftoken');
        setLoading(true); // Start loading
        try {
            const response = await fetch(`https://api.test-server-0.click/api/generate_presigned_url/${ID}/${subId}/`, {
                method: 'GET',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                }
            });

            if (!response.ok) throw new Error('Failed to fetch presigned URL');

            const data = await response.json();
            console.log("Presigned URL fetched:", data.url);

            const fileBlob = new Blob([encryptedFileData], { type: 'application/octet-stream' });
            const uploadResponse = await fetch(data.url, {
                method: 'PUT',
                body: fileBlob,
                headers: {
                    'Content-Type': 'application/octet-stream'
                }
            });

            if (uploadResponse.ok) {
                console.log("File uploaded successfully");
            } else {
                throw new Error('Failed to upload file');
            }
        } catch (error) {
            console.error("Error during file upload:", error);
        } finally {
            setLoading(false); // End loading
        }
    };

    // Function to handle file encryption
    const handleEncryption = async (subId, fileName, file, mainId) => {
        await sodiumReady; // Make sure sodium is ready for cryptographic functions
        const key = crypto_aead_xchacha20poly1305_ietf_keygen(); // Generate a random encryption key
        const fileNameIV = generateIV(subId, 0); // Generate initial vector for filename
        const encryptedFileName = crypto_aead_xchacha20poly1305_ietf_encrypt(
            new TextEncoder().encode(fileName), // Convert filename string to bytes
            null,
            null,
            fileNameIV,
            key
        );

        const fileData = await file.arrayBuffer(); // Convert file to array buffer for encryption
        const fileDataIV = generateIV(subId, 1); // Generate initial vector for file data
        const encryptedFileData = crypto_aead_xchacha20poly1305_ietf_encrypt(
            new Uint8Array(fileData), // Convert array buffer to Uint8Array
            null,
            null,
            fileDataIV,
            key
        );

        console.log("Encrypted File Name:", to_hex(encryptedFileName)); // Log encrypted filename in hex format
        console.log("Encrypted File Data:", to_hex(encryptedFileData)); // Log encrypted file data in hex format
        console.log("Encryption Key:", to_hex(key)); // Log encryption key in hex format
        console.log("File size:", file.size); // Log file size
        setKey(key); // Store encryption key
        setEncryptedFileName(encryptedFileName); // Store encrypted filename
        setEncryptedFileData(encryptedFileData); // Store encrypted file data
        setSubKey(subId + "#" + to_hex(key)); // Store combination of subID and key in hex format

        // Update backend with the encrypted data
        const updateResponse = await fetch(`https://api.test-server-0.click/api/update_file/${mainId}/${subId}`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                main_id: mainId,
                sub_id: subId,
                fileName: to_hex(encryptedFileName),
                fileSize: file.size
            })
        });
        const updateData = await updateResponse.json();
        console.log('Update response:', updateData);
    };

    // Function to generate a permutation based on subID and index
    const getPermutation = (subID, index, totalIVs = 2500) => {
        const size = 20; // Define size for permutation
        const numberOfDigits = 4; // Define number of digits
        const uniqueKey = createUniqueKey(subID, size); // Create a unique key from subID
        const factorials = Array.from({ length: size + 1 }, (_, i) => factorial(BigInt(i))); // Generate factorials up to size

        let permutationIndex = BigInt(index) * (factorials[size] / BigInt(totalIVs)); // Calculate permutation index
        let temp = uniqueKey.split(''); // Split unique key into characters
        let result = ''; // Initialize result string

        for (let i = size; i > 0; i--) {
            const selected = Number(permutationIndex / factorials[i - 1]); // Calculate selected index
            result += temp[selected]; // Add selected character to result
            permutationIndex %= factorials[i - 1]; // Update permutation index
            temp.splice(selected, 1); // Remove used character from temp
        }

        const indexString = index.toString().padStart(numberOfDigits, '0'); // Format index as string with padding
        return result + indexString; // Return permutation result
    };

    // Function to create a unique key from subID
    const createUniqueKey = (subID, size) => {
        let uniqueKey = ''; // Initialize unique key
        let seen = new Set(); // Initialize set to track seen characters

        for (let char of subID) {
            if (!seen.has(char) && uniqueKey.length < size) { // Check if char is not yet used and key is under size limit
                seen.add(char); // Add char to seen set
                uniqueKey += char; // Add char to unique key
            }
        }

        return uniqueKey; // Return unique key
    };

    // Function to generate an initial vector (IV) based on subID and index
    const generateIV = (subID, index) => {
        const permutedString = getPermutation(subID, index); // Get permutation based on subID and index
        return from_string(permutedString); // Convert permutation string to bytes and return as IV
    };

    // Render the component
    return (
        <Layout>
            <div className="container mt-12">
                {loading ? <LoadingAnimation /> : (
                    <div className="row justify-content-center">
                        <div className="col g-0">
                            <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
                                <h1>Welcome to Secure File Transfer</h1>
                                <p>This application allows you to securely send files to other users. Upload a file to create a secure QR code.</p>
                                {encrypted ? (
                                    <>
                                        <Link to={`/download/${ID}/${subKey}`} className="btn btn-success mt-2">Download</Link>
                                        <div>
                                            <p>Scan to download:</p>
                                            <QRCode value={`https://test-server-0.click/download/${ID}/${subKey}`} />
                                        </div>
                                    </>
                                ) : (
                                    <form onSubmit={handleUpload}>
                                        <input type="file" name="file" required onChange={handleFileChange} />
                                        <button type="submit" className="btn btn-success">Upload File</button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
}
export default LandingPage;