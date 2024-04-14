import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { login } = useUser();  // This function should authenticate using your backend

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    // Include CSRF token if necessary:
                    // 'X-CSRFToken': getCSRFToken()
                },
                body: JSON.stringify({ username, password }),
                credentials: 'include' // Necessary to include cookies with the request
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Login successful, server data:", data);
                login(username); // Update context state to reflect user is logged in
                navigate('/'); // Redirect to home page after login
                alert("Login successful");
            } else {
                const errorData = await response.json();
                alert(`Login failed: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error("Error during login: ", error);
            alert("Login failed: " + error.message);
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
                            <h2>Login to Your Account</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input type="text" className="form-control" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
                                </div>
                                <div className="mb-3">
                                    <input type="password" className="form-control" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary">Login</button>
                            </form>
                            <div className="mt-3">
                                Don't have an account? <Link to="/register" className="btn btn-success mx-1">Register Now</Link>
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

export default LoginPage;
