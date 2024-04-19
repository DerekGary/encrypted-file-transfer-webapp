import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import Cookies from 'js-cookie';

function LandingPage() {
  // This function handles the file upload and stores the presigned URL
  const handleUpload = async (event) => {
    
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('file', event.currentTarget.file.files[0]);

    try {
      const response = await fetch('https://api.test-server-0.click/api/file_process/', {
        
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': Cookies.get('csrftoken'), // Always pass the CSRF token, Derek! (-_-")
        },
      });
      
      const data = await response.json();
      
      if (data.url) {
        alert(`File uploaded! Download link: ${data.url}`);
        
        // Save the URL in local storage
        localStorage.setItem('fileDownloadLink', JSON.stringify({ url: data.url, timestamp: new Date().getTime() }));
      } else {
        alert('Failed to upload file.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('An error occurred while uploading the file.');
    }
  };


  useEffect(() => {
    async function checkS3Connection() {
      const csrfToken = Cookies.get('csrfToken');
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

  // Check and display the URL on page load if it's still valid
  useEffect(() => {
    const fileLinkData = JSON.parse(localStorage.getItem('fileDownloadLink'));
    if (fileLinkData && new Date().getTime() - fileLinkData.timestamp < 86400000) { // 24 hours check
      alert(`Your download link is still available: ${fileLinkData.url}`);
    }
  }, []);

  return (
    <Layout>
      <div className="container mt-12">
        <div className="row">
          <div className="col-md-1">
            {/* Left column content */}
          </div>
          <div className="col-md-10 justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
              <h1>Welcome to Secure File Transfer</h1>
              <p>This application allows you to securely send files to other users. Upload a file to create a secure QR code.</p>
              <form onSubmit={handleUpload} className="mt-4">
                <input type="file" name="file" required />
                <button type="submit" className="btn btn-success">Upload File</button>
              </form>
            </div>
          </div>
          <div className="col-md-1">
            {/* Right column content */}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default LandingPage;