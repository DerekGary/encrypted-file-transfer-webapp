// frontend/src/components/RegistrationButtonHandler.js
const handleRegisterClick = async (username, email, password) => {
    try {
        const response = await fetch('/api/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Registration response: ", data);
        alert(data.message); // Show success message
        // Optionally, redirect to login page or show a success message
    } catch (error) {
        console.error("Error during registration: ", error);
        alert(error); // Show error message
    }
};

export default handleRegisterClick;
