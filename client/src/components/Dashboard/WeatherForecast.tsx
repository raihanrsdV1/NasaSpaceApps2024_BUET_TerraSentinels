import React, { useEffect, useState } from "react";
import axios from "../../utils/AxiosSetup";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WeatherData {
  dates: string[];
  temperatures: number[];
  humidities: number[];
  precipitations: number[];
}

interface WeatherForecastProps {
  latitude: number;
  longitude: number;
  setLatitude: (lat: number) => void;
  setLongitude: (lon: number) => void;
}

const WeatherForecast: React.FC<WeatherForecastProps> = ({
  latitude,
  longitude,
  setLatitude,
  setLongitude,
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedParameter, setSelectedParameter] =
    useState<string>("temperature");

  const getWeatherData = async () => {
    try {
      const response = await axios.get(
        `weather-forecast/${latitude}/${longitude}/`
      );
      if (response.data) {
        setWeatherData(response.data);
        if (response.data.dates.length > 0) {
          setSelectedDate(response.data.dates[1]);
          setSelectedParameter("temperature");
        }
      }
    } catch (error) {
      console.error(`Error fetching data:`, error);
    }
  };

  useEffect(() => {
    getWeatherData();
  }, [latitude, longitude]);

  if (!weatherData) {
    return <div>Loading...</div>;
  }

  const handleFetchData = () => {
    getWeatherData();
  };

  const filteredData = weatherData.dates
    .map((date, index) => ({
      date,
      temperature: weatherData.temperatures[index],
      humidity: weatherData.humidities[index],
      precipitation: weatherData.precipitations[index],
    }))
    .filter((data) => data.date.startsWith(selectedDate));

  const uniqueDates = Array.from(
    new Set(weatherData.dates.map((date) => date.split(" ")[0]))
  ).slice(1);

  const y_domain =
    selectedParameter === "temperature"
      ? [
          Math.floor(Math.min(...weatherData.temperatures)) - 1,
          Math.ceil(Math.max(...weatherData.temperatures)) + 1,
        ]
      : selectedParameter === "precipitation"
      ? [
          Math.floor(Math.min(...weatherData.precipitations)) - 1,
          Math.ceil(Math.max(...weatherData.precipitations)) + 1,
        ]
      : [
          Math.floor(Math.min(...weatherData.humidities)) - 1,
          Math.ceil(Math.max(...weatherData.humidities)) + 1,
        ];

  return (
    <div
      style={{
        fontSize: "20px",
        backgroundColor: "#f9f9f9", // Light background color
        padding: "20px",
        borderRadius: "10px", // Rounded corners
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
        border: "1px solid #ddd", // Light border for structure
        width: "100%",
        margin: "20px 0",
        height: "575px",
      }}
    >
      <div
        style={{
          fontSize: "25px",
          fontWeight: "bold",
          marginBottom: "15px",
          textAlign: "center",
        }}
      >
        Weather Forecast Details
      </div>

      <div className="flex justify-between items-center">
        <div>
          <label
            htmlFor="latitude-input"
            style={{ marginRight: "10px", fontWeight: "bold" }}
          >
            Latitude:
          </label>
          <input
            type="number"
            id="latitude-input"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100px",
            }}
          />
        </div>
        <div>
          <label
            htmlFor="longitude-input"
            style={{ marginRight: "10px", fontWeight: "bold" }}
          >
            Longitude:
          </label>
          <input
            type="number"
            id="longitude-input"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "100px",
            }}
          />
        </div>
        <div>
          <button
            onClick={handleFetchData}
            className="see-more-button font-bold text-lg mx-1 pb-[.65rem]"
          >
            Get Forecast
          </button>
        </div>
      </div>

      <div className=""></div>

      <div className="flex justify-between mb-4">
        <div>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>
            Select Date:{" "}
          </label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "200px",
            }}
          >
            {uniqueDates.map((date) => (
              <option key={date} value={date}>
                {date}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ marginRight: "10px", fontWeight: "bold" }}>
            Select Parameter:{" "}
          </label>
          <select
            value={selectedParameter}
            onChange={(e) => setSelectedParameter(e.target.value)}
            style={{
              padding: "8px 12px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              width: "200px",
            }}
          >
            <option value="temperature">Temperature</option>
            <option value="humidity">Humidity</option>
            <option value="precipitation">Precipitation</option>
          </select>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={filteredData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis domain={y_domain} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey={selectedParameter}
            stroke="#8884d8"
            strokeWidth={4}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherForecast;
