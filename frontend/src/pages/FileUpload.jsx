import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

function FileUpload() {
  return (
    <Layout>
      <div className="container mt-12">
        <div className="row">
          <div className="col-md-1">
            {/* Left column content */}
          </div>
          <div className="col-md-10 justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
                <h3>File Upload</h3>
                <form action="/api/upload" method="post" encType="multipart/form-data">
                    <div className="mb-3">
                        <input type="file" name="file" className="form-control" required />
                    </div>
                    <button type="submit" className="btn btn-primary">Upload</button>
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

export default FileUpload;
