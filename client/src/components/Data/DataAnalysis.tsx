import { LineChart } from "@mui/x-charts";
import { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import html2canvas from 'html2canvas';
import MapSelector from "../MapSelector"; // Adjust the path as necessary
import DatePicker from "react-datepicker"; // Install react-datepicker with npm or yarn
import "react-datepicker/dist/react-datepicker.css";

// Define the parameter types as a union of string literals
type ParameterType = "Surface Temperature" | "Precipitation" | "Humidity";

interface WeatherDataProps {}

const parameterOptions: Record<ParameterType, string> = {
  "Surface Temperature": "TS",
  "Precipitation": "PRECTOTCORR",
  "Humidity": "QV2M",
};

const parameterStyles: Record<ParameterType, { color: string; unit: string }> = {
  "Surface Temperature": {
    color: "#ff6347", // tomato color
    unit: "°C",
  },
  "Precipitation": {
    color: "#1e90ff", // dodger blue
    unit: "mm",
  },
  "Humidity": {
    color: "#1eee", // lime green
    unit: "%",
  },
};

const DataAnalysis: React.FC<WeatherDataProps> = () => {
  const [latitude, setLatitude] = useState<number>(37.7749);
  const [longitude, setLongitude] = useState<number>(-122.4194);
  const [startDate, setStartDate] = useState<Date | null>(new Date("2021-01-01"));
  const [endDate, setEndDate] = useState<Date | null>(new Date("2021-01-31"));
  const [parameter, setParameter] = useState<string>("TS");
  const [dateData, setDateData] = useState<Array<string>>([]);
  const [weatherData, setWeatherData] = useState<Array<number>>([]);
  const [selectedParameter, setSelectedParameter] = useState<ParameterType>("Surface Temperature");
  const [learnMoreExpanded, setLearnMoreExpanded] = useState<boolean>(false);
  const [quizExpanded, setQuizExpanded] = useState<boolean>(false);
  const [mapExpanded, setMapExpanded] = useState<boolean>(false);

  const getWeatherData = async () => {
    try {
      const response = await axios.get(
        `weather-data/${parameter}/${startDate?.toISOString().slice(0, 10).replace(/-/g, "")}/${endDate?.toISOString().slice(0, 10).replace(/-/g, "")}/${longitude}/${latitude}/`
      );
      const data = response.data[parameter];
      setDateData(Object.keys(data));
      setWeatherData(Object.values(data));
    } catch (error) {
      console.error(`Error fetching ${parameter} data:`, error);
    }
  };

  const handleDownload = async () => {
    const content = document.querySelector('.content-to-download') as HTMLElement;
    if (content) {
      const canvas = await html2canvas(content);
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      // file name with timestamp and parameter
      link.download = `${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}-${selectedParameter}.png`;
      link.click();
    }
  };

  useEffect(() => {
    getWeatherData();
  }, [latitude, longitude, startDate, endDate, parameter]);

  const handleParameterChange = (param: ParameterType) => {
    setSelectedParameter(param);
    setParameter(parameterOptions[param]);
  };

  const maxValue = Math.max(...weatherData);
  const minValue = Math.min(...weatherData);

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
      <div className="flex w-full pt-16">
        <div className="w-full p-6">
          <h1 className="text-3xl font-bold text-center mb-6">Data Analysis</h1>

          {/* Parameter Options as Buttons */}
          <div className="mb-4 flex justify-center space-x-4">
            {Object.keys(parameterOptions).map((option) => (
              <button
                key={option}
                onClick={() => handleParameterChange(option as ParameterType)}
                className={`p-2 rounded transition-colors duration-300 ${
                  selectedParameter === option ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Entire content to be downloaded */}
          <div className="w-full mb-6 content-to-download">
            {/* Graph Centered Above Inputs */}
            <div className="w-full chart-container mb-6 flex justify-center">
              <LineChart
                xAxis={[{ data: dateData }]}
                series={[
                  {
                    data: weatherData,
                    label: selectedParameter,
                    area: true,
                    color: parameterStyles[selectedParameter].color,
                  },
                ]}
                width={800}
                height={500}
              />
            </div>

            {/* Download Info */}
            <div className="flex justify-center mb-4">
              <p className="mr-4">Start Date: {startDate?.toLocaleDateString()}</p>
              <p className="mr-4">End Date: {endDate?.toLocaleDateString()}</p>
              <p className="mr-4">Latitude: {latitude}</p>
              <p>Longitude: {longitude}</p>
              <p className="ml-4 font-bold">Max: {maxValue} {parameterStyles[selectedParameter].unit}</p>
              <p className="ml-4 font-bold">Min: {minValue} {parameterStyles[selectedParameter].unit}</p>
            </div>
          </div>

          {/* Date Selection */}
          <div className="flex justify-center mb-4">
            <label className="mr-4">
              Start Date:
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="block w-32 p-2 border rounded"
              />
            </label>
            <label className="mr-4">
              End Date:
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="block w-32 p-2 border rounded"
              />
            </label>
          </div>

          {/* Latitude & Longitude Inputs */}
          <div className="flex justify-center mb-4">
            <label className="mr-4">
              Latitude:
              <input
                type="number"
                value={latitude}
                onChange={(e) => setLatitude(Number(e.target.value))}
                className="block w-32 p-2 border rounded"
              />
            </label>
            <label className="mr-4">
              Longitude:
              <input
                type="number"
                value={longitude}
                onChange={(e) => setLongitude(Number(e.target.value))}
                className="block w-32 p-2 border rounded"
              />
            </label>
          </div>

          {/* Map Selector Button */}
          <div className="flex justify-center mb-4">
            <button onClick={() => setMapExpanded(!mapExpanded)} className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition">
              {mapExpanded ? "Hide Map" : "Select Location"}
            </button>
          </div>

          {/* Map Selector */}
          <div className="flex justify-center mb-4">
            {mapExpanded && (
              <div className="mb-4 w-1/3">
                <MapSelector onSelect={(lat, lng) => {
                  setLatitude(lat);
                  setLongitude(lng);
                }} apiKey="YOUR_GOOGLE_MAPS_API_KEY" />
              </div>
            )}
          </div>

          {/* Fetch Data & Download Buttons */}
          <div className="flex justify-center mb-4">
            <button onClick={getWeatherData} className="w-1/4 mb-4 p-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition">
              Fetch Data
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <button onClick={handleDownload} className="w-1/4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Download Data
            </button>
          </div>

          {/* Learn More About the Data Section */}
          <div className="p-6">
            <button className="text-blue-500 hover:underline" onClick={() => setLearnMoreExpanded(!learnMoreExpanded)}>
              Learn More About the Data
            </button>
            {learnMoreExpanded && (
              <div className="mt-4">
                <p>Your detailed content about the data goes here...</p>
              </div>
            )}
          </div>

          {/* Quiz Section */}
          <div className="p-6">
            <button className="text-blue-500 hover:underline" onClick={() => setQuizExpanded(!quizExpanded)}>
              Take a Quiz
            </button>
            {quizExpanded && (
              <div className="mt-4">
                <p>Your quiz questions will go here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;