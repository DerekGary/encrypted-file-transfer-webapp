// DownloadPage.js

import React from 'react';
import { useParams } from 'react-router-dom';

function DownloadPage() {
  const { mainId, subId } = useParams();
  
  React.useEffect(() => {
    // Example fetch to get the file or file details
    const fetchData = async () => {
      const response = await fetch(`https://api.test-server-0.click/api/download/${mainId}/${subId}`);
      const data = await response.json();
      console.log(data);
      // handle data
    };

    fetchData();
  }, [mainId, subId]);

  return (
    <div>
      <h1>Download Page</h1>
      <p>Downloading file with ID {mainId} and SubID {subId}</p>
    </div>
  );
}

export default DownloadPage;
