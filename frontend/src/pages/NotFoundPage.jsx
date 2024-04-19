import React from 'react';
import Layout from '../components/Layout';

function NotFoundPage() {
  return (
    <Layout>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 text-center">
            <h1>404 Not Found</h1>
            <p>The page you are looking for does not exist.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default NotFoundPage;
