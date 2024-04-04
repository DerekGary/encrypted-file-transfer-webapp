// frontend/src/components/RegistrationButtonHandler.js
const handleRegisterClick = async () => {
    try {
        const response = await fetch('/api/generate_username/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Username received: ", data.username);
    } catch (error) {
        console.error("Error fetching username: ", error);
    }
};

export default handleRegisterClick;
