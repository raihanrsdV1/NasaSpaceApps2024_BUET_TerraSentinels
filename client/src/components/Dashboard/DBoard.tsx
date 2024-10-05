import React, { useState, useContext } from "react";
import Weather from "./Weather";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import WeatherForecast from "./WeatherForecast";
import WeatherSummary from "./WeatherSummary";
import TaskManager from "./TaskManager";
import AuthContext from "../../context/AuthContext";


const DBoard = () => {
  const contextData = useContext(AuthContext);
  const user_lat = contextData?.user.location_lat || 23.8; 
  const user_lon = contextData?.user.location_lon || 90.5; 

  const [latitude, setLatitude] = useState<number>(user_lat);
  const [longitude, setLongitude] = useState<number>(user_lon);

  return (
    <div className="flex">
      <Sidebar />
      <Navbar />
      <div className="dashboard mt-20 ml-7">
        <div className="main-content">
          <div className="top-row full-width">
            <Weather />
          </div>
          <div className="middle-row flex justify-between mt-10 w-full h-[80%]">
            <div className="w-[48%] flex flex-col align-start items-start">
              <WeatherSummary
                latitude={latitude}
                longitude={longitude}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
              />
            </div>
            <div className="w-[48%] flex flex-col align-start items-start">
              <WeatherForecast
                latitude={latitude}
                longitude={longitude}
                setLatitude={setLatitude}
                setLongitude={setLongitude}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DBoard;
