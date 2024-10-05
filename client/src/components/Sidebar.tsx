import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import brand from "../brand.png";

const Sidebar = () => {
  const navigate = useNavigate();
  useEffect(() => {
    // no data is being fetched from the server
  }, []);

  return (
    <div className="w-[250px] min-h-full bg-gray-800 pb-[1000px] mt-20">
      {/* Add margin-top to account for navbar height */}
      <div className="fixed flex-col items-start p-4">
        {/* Added padding for spacing */}
        <ul className="flex flex-col">
          {/* <li className="m-2 p-3">
            <div className="flex items-center h-full">
              <img src={brand} alt="brand logo" className="h-8 mr-4" />{" "}
            </div>
          </li> */}
          <li
            className="flex justify-left items-center font-bold m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
            onClick={() => navigate("/")}
          >
            <i className="bx bxs-dashboard pr-3 text-xl"></i>
            <p>Dashboard</p>
          </li>
          {/* <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/heat_map")}
                    >
                        Interactive Maps
                    </li> */}
          <li
            className="flex justify-left items-center font-bold m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
            onClick={() => navigate("/data")}
          >
            <i className="bx bx-line-chart pr-3 text-xl"></i>
            <p>Data Analysis</p>
          </li>
          <li
            className="flex justify-left items-center font-bold m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
            onClick={() => navigate("/community")}
          >
            <i className="bx bxs-group pr-3 text-xl"></i>
            <p>Community</p>
          </li>
          <li
            className="flex justify-left items-center font-bold m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
            onClick={() => navigate("/water_resources")}
          >
            <i className="bx bx-water pr-3 text-xl"></i>
            <p>Water Resource</p>
          </li>
          <li
            className="flex justify-left items-center font-bold m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
            onClick={() => navigate("/extremities")}
          >
            <i className="bx bxs-error pr-3 text-xl"></i>
            <p>Extremity</p>
          </li>
          <li
            className="flex justify-left items-center font-bold m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
            onClick={() => navigate("/quiz")}
          >
            <i className="bx bxs-book-reader pr-3 text-xl"></i>
            <p>Quiz</p>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
