import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../utils/AxiosSetup"; // Adjust path if necessary

const Login = () => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e : any) => {
        const { name, value } = e.target;
        setCredentials((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: any) => {
        e.preventDefault(); // Prevent default form submission
        setIsSubmitting(true); // Disable the button

        try {
            const res = await axios.post("/token/", {
                email: credentials.email,
                password: credentials.password,
            });

            // Assuming the response contains access and refresh tokens
            const { access, refresh } = res.data;

            // Store tokens in local storage
            localStorage.setItem("access_token", access);
            localStorage.setItem("refresh_token", refresh);

            toast.success("Login successful!"); // Show success message
            navigate("/"); // Redirect to home or any other page
        } catch (error) {
            console.error("Error during login:", error); // Log error for debugging
            toast.error("Login failed. Please check your credentials."); // Show error message
        } finally {
            setIsSubmitting(false); // Re-enable the button
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={credentials.email}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-gray-700" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                        />
                    </div>
                    <div className="mb-4">
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white p-2 rounded-md"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Logging in..." : "Login"}
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <Link to="/register" className="text-blue-500 hover:underline">
                        Don't have an account? Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
