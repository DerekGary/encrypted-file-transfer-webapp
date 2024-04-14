import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { UserProvider } from './contexts/UserContext.jsx';

// BrowserRouter and UserProvider are used to provide routing and user context to the entire application.
// User context means that the user's login status is available to all components at all times (if logged in).
// When we give context to something, we are providing it with the ability to access the context's data.
// In this case, the UserProvider component provides the UserContext to all of its children.
// For us, this child is the entire application, which is wrapped in the UserProvider component.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <App />
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);
