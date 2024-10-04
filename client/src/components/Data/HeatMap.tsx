import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import axios from "../../utils/AxiosSetup";

type parameterType = "Surface Temperature" | "Precipitation" | "Humidity" | "Evapotranspiration" | "Soil Moisture" | "Vegetation Indices";

const parameterOptions = {
    "Surface Temperature": "TS",
    "Precipitation": "precipitation",
    "Humidity": "humidity",
    "Evapotranspiration": "evapotranspiration",
    "Soil Moisture": "soil_moisture",
    "Vegetation Indices": "vegetation_indices"
}

const HeatMap = () => {
    const [parameter, setParameter] = useState<parameterType>("Surface Temperature");
    const [startDate, setStartDate] = useState<Date | null>(new Date("2021-01-01"));
    const [endDate, setEndDate] = useState<Date | null>(new Date("2021-01-05"));
    const [selectedParameter, setSelectedParameter] = useState<string>(parameterOptions["Surface Temperature"]);
    const [htmlData, setHtmlData] = useState<string>('');

    const handleParameterChange = (parameter: parameterType) => {
        setParameter(parameter);
        setSelectedParameter(parameterOptions[parameter]);
    }

    useEffect(() => {
        const fetchData = async () => {
            const start = startDate ? startDate.toISOString().slice(0, 10) : null; // "YYYY-MM-DD"
            const end = endDate ? endDate.toISOString().slice(0, 10) : null; // "YYYY-MM-DD"
            const response = await axios.get('/heatmap/', {
                params: {
                    lat: 23.8103,
                    long: 90.4125,
                    parameter: selectedParameter,
                    start,
                    end,
                    zoom:5
                }
            });
            setHtmlData(response.data);
            console.log(response.data);
        };
        fetchData();
    }, [selectedParameter, startDate, endDate]);

    return (
        <div className="flex">
            <Navbar />
            <Sidebar />

            <div className="w-full p-6 mt-20">
                <h1 className="text-4xl font-bold text-center mb-6">Interactive Map</h1>
                <div className="mb-4 flex justify-center space-x-4">
                    {Object.keys(parameterOptions).map((option) => {
                        const typedOption = option as parameterType;
                        return (
                            <button
                                key={typedOption}
                                onClick={() => handleParameterChange(typedOption)}
                                className={`p-2 rounded transition-colors duration-300 ${
                                    selectedParameter === parameterOptions[typedOption] ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                                }`}
                            >
                                {typedOption}
                            </button>
                        );
                    })}
                </div>

                {/* Date Picker Section */}
                <div className="flex justify-center space-x-4 mt-8">
                    <DatePicker 
                        selected={startDate} 
                        onChange={(date) => setStartDate(date)} 
                        dateFormat="MM-dd-yyyy" // Changed to MM
                        className="border rounded p-2"
                    />
                    <DatePicker 
                        selected={endDate} 
                        onChange={(date) => setEndDate(date)} 
                        dateFormat="MM-dd-yyyy" // Changed to MM
                        className="border rounded p-2"
                    />
                </div>
                    
                    {/* Heatmap */}
                    <div className="mt-8" dangerouslySetInnerHTML={{ __html: htmlData }} />
            </div>
        </div>
    );
}

export default HeatMap;
