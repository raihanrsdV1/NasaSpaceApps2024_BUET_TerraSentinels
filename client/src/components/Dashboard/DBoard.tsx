import React, { useState } from "react";
import Weather from "./Weather";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import WeatherForecast from "./WeatherForecast";
import WeatherSummary from "./WeatherSummary";
import TaskManager from "./TaskManager";

const DBoard = () => {
  const [latitude, setLatitude] = useState<number>(23.2);
  const [longitude, setLongitude] = useState<number>(-88.5);

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
