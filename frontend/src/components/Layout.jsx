import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to="/">Home</Link>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        </ul>
                    </div>
                </div>
            </nav>
            {children}
        </div>
    );
}

export default Layout;
