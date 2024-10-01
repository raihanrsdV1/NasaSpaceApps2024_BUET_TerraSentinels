import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "../../utils/AxiosSetup"; // Adjust path if necessary
import MapSelector from "../MapSelector"; // Adjust path if necessary

const apiKey = "AIzaSyAvwlUzN8yS6W6oWei0anmvA_bTuao_ay0";
const mapId = "a76d6833c6f687c8";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone_no: "",
    });
    const [selectedLat, setSelectedLat] = useState<number | null>(null);
    const [selectedLng, setSelectedLng] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); // Prevent default form submission
        setIsSubmitting(true); // Disable the button

        try {
            console.log("Submitting the form with values:", formData); // Log values on submit
            const res = await axios.post("register/", {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email,
                password: formData.password,
                phone_no: formData.phone_no,
                location_lat: selectedLat,
                location_lon: selectedLng,
            }, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });

            console.log("Response received:", res.data);
            const username = res.data.username;
            toast.success(`Registration successful! Your username is: ${username}`);
            navigate(`/email-not-verified/${res.data.user.email}`, { replace: true });
        } catch (error) {
            console.error("Error during registration:", error);
            toast.error("Registration failed"); // Generic error message
        } finally {
            setIsSubmitting(false); // Re-enable the button
        }
    };

    return (
        <div className="h-screen bg-cover bg-center" style={{
            backgroundImage: 'url("https://example.com/background-image.jpg")',
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            marginTop: "50px",
        }}>
            <div className="max-w-[30rem] w-full rounded-lg shadow-md pt-4" style={{
                backgroundColor: "rgba(128, 128, 128, 0.8)",
                padding: "2rem",
                backdropFilter: "blur(5px)",
            }}>
                <p className="small-headings text-center text-white">
                    Join a world full of talented individuals. Teach them. Learn from them.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="firstName"
                        placeholder="First Name"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full mb-4 p-2"
                        required
                    />
                    <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full mb-4 p-2"
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full mb-4 p-2"
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full mb-4 p-2"
                        required
                    />
                    <input
                        type="text"
                        name="phone_no"
                        placeholder="Phone Number"
                        value={formData.phone_no}
                        onChange={handleChange}
                        className="w-full mb-4 p-2"
                        required
                    />

                    <MapSelector
                        onSelect={(lat, lng) => {
                            setSelectedLat(lat);
                            setSelectedLng(lng);
                        }}
                        apiKey={apiKey}
                        mapId={mapId}
                    />

                    <div>
                        {selectedLat && selectedLng && (
                            <p className="text-center text-white">
                                Selected Coordinates: Lat: {selectedLat}, Lng: {selectedLng}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center">
                        <div>
                            Already have an account?{" "}
                            <Link to="/login" className="font-medium text-green-500 hover:underline">
                                Login
                            </Link>
                        </div>
                        <button className="solid-btn" type="submit" disabled={isSubmitting}>
                            Register
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
