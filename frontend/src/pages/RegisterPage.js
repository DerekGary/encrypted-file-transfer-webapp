import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import handleRegisterClick from '../components/RegistrationButtonHandler';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate(); // To redirect after successful registration

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        await handleRegisterClick(username, email, password);
        navigate('/login'); // Redirect to login page after registration
    };

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
                            <form onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button type="submit" className="btn btn-success mx-1">Register</button>
                            </form>
                            <Link to="/login" className="btn btn-primary mx-1">Login</Link>
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
