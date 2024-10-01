import { Link } from "react-router-dom";
import brand from "../brand.png";

const Navbar = () => {
    return (
        <nav className="bg-gray-800 text-white h-20 fixed top-0 w-full flex items-center justify-between px-6 z-50">
            <div className="flex items-center h-full">
                <img src={brand} alt="brand logo" className="h-8 mr-4" /> {/* Adjusted logo height */}
            </div>
            <ul className="flex space-x-6 items-center h-full">
                <li><Link to="/" className="hover:text-gray-400">Home</Link></li>
                <li><Link to="/about" className="hover:text-gray-400">About</Link></li>
                <li><Link to="/contact" className="hover:text-gray-400">Contact</Link></li>
            </ul>
        </nav>
    );
};

export default Navbar;
