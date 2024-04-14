import React, { useState } from 'react';
//import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import '../styles/LandingPage.css';

function Layout({ children }) {
    const { user, logout } = useUser();
    const [darkMode, setDarkMode] = useState(true);
    const toggleDarkMode = () => setDarkMode(!darkMode);

    return (
        <div className={`min-vh-100 ${darkMode ? 'dark-mode' : ''}`}>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container-fluid">
                    <Link className="navbar-brand" to="/">Encrypted File Transfer</Link>
                    <Link className="nav-link text-secondary" to="/about">About</Link>
                    <div className="d-flex align-items-center">
                        {user ? (
                            <>
                                <span className="navbar-text">
                                    Logged in as {user.username}
                                </span>
                                <button onClick={logout} className="btn btn-secondary ms-2">Logout</button>
                            </>
                        ) : (
                            <div className="ms-auto d-flex align-items-center">
                                <Link className="nav-link text-secondary" to="/login">Login</Link>
                                <Link className="nav-link text-secondary" to="/register">Register</Link>
                                <Link className="nav-link text-secondary" to="/file_upload">File Upload</Link>
                            </div>
                        )}
                        <button onClick={toggleDarkMode} className="btn btn-sm btn-dark-mode-toggle ms-2">
                            {darkMode ? 'Light Mode' : 'Dark Mode'}
                        </button>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    );
}

export default Layout;
