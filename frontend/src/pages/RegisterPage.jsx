import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';

function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useUser(); // This method should properly update user state

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Include CSRF token if necessary:
                    // 'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ username, email, password }),
                credentials: 'include' // Including cookies with the request
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Registration successful, server data:", data);
                login(username); // Log the user in with the provided username
                navigate('/'); // Redirect to home page
                alert("Registration successful");
            } else {
                const errorData = await response.json();
                alert(`Registration failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error during registration: ", error);
            alert("Registration failed: " + error.message);
        }
    };

    return (
        <Layout>
            <div className="container mt-3">
                <div className="row">
                    <div className="col-md-3">
                        {/* Left column content can go here */}
                    </div>
                    <div className="col-md-6 justify-content-center" style={{ minHeight: 'calc(100vh - 56px)' }}>
                        <div className="text-center mt-5 bg-secondary ps-5 pe-5 pb-5 pt-3 rounded shadow">
                            <h2>Register a New Account</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input type="text" className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <input type="email" className="form-control" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Register</button>
                            </form>
                            <div className="mt-3">
                                Already have an account? <Link to="/login" className="btn btn-success mx-1">Log In</Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        {/* Right column content can go here */}
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default RegisterPage;
