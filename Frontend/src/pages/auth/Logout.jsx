import { logoutUser } from "../../api/authService";

export default function Logout() {
    const handleLogout = async () => {
        await logoutUser();
        localStorage.clear();
        window.location.href = "/login";
    };

    return <button onClick={handleLogout}>Logout</button>;
}