import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../utils/AxiosSetup"; // Adjust path if necessary
import brand from "../../brand.png"; // Adjust path if necessary

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setIsSubmitting(true); // Disable the button

        try {
            const res = await axios.post("login/", {
                email: formData.email,
                password: formData.password,
            });

            toast.success("Login successful!");
            navigate("/dashboard"); // Adjust route based on your app
        } catch (error) {
            toast.error("Login failed. Please check your credentials.");
        } finally {
            setIsSubmitting(false); // Re-enable the button
        }
    };

    return (
        <div className="h-screen bg-gradient-to-r flex flex-col items-center justify-start">
            {/* Header Section with Brand Name and Logo */}
            <div className="w-full flex flex-col items-center mt-6 mb-8">
                <img src={brand} alt="Brand Logo" className="h-16 mb-4" /> {/* Adjust path and size */}
                <h2 className="text-3xl font-bold text-black">
                    Welcome back to our farming community!
                </h2>
            </div>

            <div className="max-w-4xl w-1/3 bg-white rounded-lg shadow-2xl p-6 flex flex-col md:flex-row gap-10">
                
                {/* Form Section */}
                <div className="flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                            required
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
                            required
                        />

                        <div className="flex flex-col items-center justify-center mt-6">
                            <button
                                className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                                type="submit"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Logging in..." : "Login"}
                            </button>
                            <div className="mb-4">
                                Don't have an account yet?{" "}
                                <Link to="/register" className="font-medium text-green-600 hover:underline">
                                    Register
                                </Link>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;