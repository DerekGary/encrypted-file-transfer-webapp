import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext(null);

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (username, password) => {
        try {
            const response = await fetch('/api/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'  // Important for cookies to be sent and received
            });
            if (response.ok) {
                const data = await response.json();
                setUser({ username: data.username });  // Assume username is returned upon successful login
                console.log("Login successful:", data);
            } else {
                const errorData = await response.json();
                console.error("Login failed:", errorData);
                throw new Error(errorData.error || "An unknown error occurred during login.");
            }
        } catch (error) {
            console.error("Error during login:", error);
            throw error; // Propagate the error up for handling in UI components
        }
    };

    const logout = async () => {
        try {
            const response = await fetch('/api/logout/', {
                method: 'POST',
                credentials: 'include'
            });
            if (response.ok) {
                setUser(null);
                console.log("Logout successful");
            } else {
                const errorData = await response.json();
                console.error("Logout failed:", errorData);
                throw new Error(errorData.error || "An unknown error occurred during logout.");
            }
        } catch (error) {
            console.error("Error during logout:", error);
            throw error; // Propagate the error up for handling in UI components
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};
