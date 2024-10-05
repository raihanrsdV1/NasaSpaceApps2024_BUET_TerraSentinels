import { Link } from "react-router-dom";
import brand from "../brand.png";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white h-20 fixed top-0 w-full flex items-center justify-between px-6 z-50 border-b-4 border-green-600">
      <div className="flex items-center h-full">
        <img src={brand} alt="brand logo" className="h-8 mr-4" />{" "}
      </div>
      <ul className="flex space-x-6 items-center h-full">
        <li>
          <Link to="/" className="hover:text-gray-400 font-bold">
            Home
          </Link>
        </li>
        <li>
          <Link to="/about" className="hover:text-gray-400 font-bold">
            About
          </Link>
        </li>
        <li>
          <Link to="/contact" className="hover:text-gray-400 font-bold">
            Contact
          </Link>
        </li>
        <li>
          <Link to="/profile">
            <i className="bx bx-user-circle text-4xl"></i>
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
