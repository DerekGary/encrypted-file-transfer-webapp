// ./frontend/src/components/handleUpload.jsx

import Cookies from 'js-cookie';
//import { handleCryptoOperations } from '../pages/LandingPage';

const handleUpload = async (event) => {
  event.preventDefault();

  try {
    // Send the POST request to the backend
    const response = await fetch('https://api.test-server-0.click/api/file_process/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': Cookies.get('csrftoken'),
      },
    });

    const data = await response.json();
    console.log('Response from backend:', data); // Log the response

    // You can further process the data here (e.g., display it to the user)

  } catch (error) {
    console.error('Error:', error);
    // Handle errors appropriately (e.g., display an error message)
  }
};

// const handleUpload = async (event) => {
//   event.preventDefault();

//   try {
//     // Send the initial "create" request to the backend
//     const createResponse = await fetch('https://api.test-server-0.click/api/file_process/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'X-CSRFToken': Cookies.get('csrftoken'),
//       },
//     });

//     const createData = await createResponse.json();
//     const { id, subId } = createData;

//     // Get the file and file name from the input
//     const fileInput = event.target.elements.file;
//     const file = fileInput.files[0];
//     const fileName = file.name;

//     // Encrypt the file and file name using the provided encryption routine
//     const { encryptedFile, encryptedFileName } = await handleCryptoOperations(subId, fileName, file);

//     // Make a PUT request to the signed URL to upload the encrypted file
//     const uploadResponse = await fetch(createData.signedUrl, {
//       method: 'PUT',
//       body: encryptedFile,
//     });

//     if (uploadResponse.ok) {
//       // Inform the backend about the file upload completion
//       await fetch(`https://api.test-server-0.click/api/${id}/${subId}/upload-complete`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           'X-CSRFToken': Cookies.get('csrftoken'),
//         },
//         body: JSON.stringify({
//           fileName: encryptedFileName,
//           fileSize: encryptedFile.size,
//         }),
//       });

//       alert('File uploaded successfully!');
//     } else {
//       alert('Failed to upload file.');
//     }
//   } catch (error) {
//     console.error('Upload error:', error);
//     alert('An error occurred while uploading the file.');
//   }
// };

const handleFileChange = async (event, fileLimits) => {
  event.preventDefault();
  const file = event.target.files[0];

  if (file) {
    const fileSize = file.size;

    if (fileLimits && fileSize > fileLimits.totalFileSizeMb * 1024 * 1024) {
      event.target.value = '';
      alert(`File size exceeds the limit of ${fileLimits.totalFileSizeMb} MB.`);
      return;
    }
  }
};

export { handleFileChange, handleUpload };