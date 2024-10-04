import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import axios from "../../utils/AxiosSetup"; // Adjust path if necessary
import MapSelector from "../MapSelector"; // Adjust path if necessary
import brand from "../../brand.png"; // Adjust path if necessary
import AuthContext from "../../context/AuthContext";
import { AuthContextProps } from "../../types/types";

const apiKey = "AIzaSyAvwlUzN8yS6W6oWei0anmvA_bTuao_ay0";
const mapId = "a76d6833c6f687c8";

const Register: React.FC = () => {
  const contextData = useContext(AuthContext);
  if (!contextData) return null;

  const navigate = useNavigate();

  const user = contextData?.user;
  if (user) {
    navigate("/");
  }
  const { loginUser }: AuthContextProps = contextData;

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
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
      const res = await axios.post("register/", {
        first_name: formData.firstName,
        last_name: formData.lastName,
        password: formData.password,
        phone_no: formData.phone_no,
        location_lat: selectedLat,
        location_lon: selectedLng,
      });
      const data = res.data;

      if (res.status === 201) {
        // console.log("Logging in");
        if (loginUser) {
          loginUser(e);
        }
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.log(error);
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.error);
      }
    } finally {
      setIsSubmitting(false); // Re-enable the button
    }
  };

  return (
    <div className="h-screen bg-gradient-to-r flex flex-col items-center justify-start">
      {/* Header Section with Brand Name and Logo */}
      <div className="w-full flex flex-col items-center mt-6 mb-8">
        <img src={brand} alt="Brand Logo" className="h-16 mb-4" />{" "}
        {/* Adjust path and size */}
        <h2 className="text-3xl font-bold text-black">
          Join us in our mission to save the farming community!
        </h2>
      </div>

      <div className="max-w-6xl w-full bg-white rounded-lg shadow-2xl p-6 flex flex-row gap-10">
        {/* Left Section: Form */}
        <div className="w-1/2">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />
            <input
              type="text"
              name="phone_no"
              placeholder="Phone Number"
              value={formData.phone_no}
              onChange={handleChange}
              className="w-full mb-4 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300"
              required
            />

            <div className="flex flex-col items-center justify-center mt-6">
              <button
                className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Register"}
              </button>
              <div className="mb-4">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:underline"
                >
                  Login
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Right Section: Map and Search for a Place */}
        <div className="w-1/2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Select your location on the map
          </h2>

          <MapSelector
            onSelect={(lat, lng) => {
              setSelectedLat(lat);
              setSelectedLng(lng);
            }}
            apiKey={apiKey}
            mapId={mapId}
          />

          <div className="mt-4">
            {selectedLat && selectedLng && (
              <p className="text-center text-gray-700">
                Selected Coordinates: Lat: {selectedLat}, Lng: {selectedLng}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
