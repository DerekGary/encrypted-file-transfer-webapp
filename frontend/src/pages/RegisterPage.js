import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import handleRegisterClick from '../components/RegistrationButtonHandler';

function RegisterPage() {
    return (
        <Layout>
            <div className="container mt-3">
                <div className="row">
                    <div className="col-md-3">
                        {/* Left column content */}
                    </div>
                    <div className="col-md-6 justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
                        <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
                            <h2>Registration</h2>
                            <p>Test<br></br>Login or register to get started!</p>
                            <Link to="/login" className="btn btn-primary mx-1">Login</Link>
                            <button onClick={handleRegisterClick}>Register</button>
                        </div>
                    </div>
                    <div className="col-md-3">
                        {/* Right column content */}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default RegisterPage;
