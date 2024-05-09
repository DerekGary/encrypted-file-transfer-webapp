// Authors: Derek Gary, Takaiya Jones

import React from 'react';
import { Link } from 'react-router-dom';

function Layout({ children }) {
    return (
        <div>
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <div className="container">
                    <Link className="navbar-brand" to="/">Encrypted File Transfer</Link>
                </div>
            </nav>
            {children}
        </div>
    );
}

export default Layout;
