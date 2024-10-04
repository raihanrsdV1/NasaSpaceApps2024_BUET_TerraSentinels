import { useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

const Sidebar = () => {
    const navigate = useNavigate();
    useEffect(() => {
        // no data is being fetched from the server
    }, []);
    
    return (
        <div className="w-[300px] min-h-full bg-gray-800 mt-20 pb-[1000px]"> {/* Add margin-top to account for navbar height */}
            <div className="fixed flex-col items-start p-4"> {/* Added padding for spacing */}
                <ul className="flex flex-col">
                    <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/")}
                    >
                        Dashboard
                    </li>
                    {/* <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/heat_map")}
                    >
                        Interactive Maps
                    </li> */}
                    <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/data")}
                    >
                        Data Analysis
                    </li>
                    <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/community")}
                    >
                        Community
                    </li>
                    <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/water_resources")}
                    >
                        Water Resource
                    </li>
                    <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/extremities")}
                    >
                        Extremity
                    </li>
                    <li 
                        className="m-2 p-3 text-white cursor-pointer transform transition-all duration-300 hover:translate-x-2 hover:text-yellow-400 hover:font-bold"
                        onClick={() => navigate("/quiz")}
                    >
                        Quiz
                    </li>
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
