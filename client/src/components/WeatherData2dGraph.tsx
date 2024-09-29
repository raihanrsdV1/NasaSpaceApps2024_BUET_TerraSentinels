// weatherData2dGraph.tsx
import { LineChart } from "@mui/x-charts";
import { useState, useEffect } from "react";
import axios from "../utils/AxiosSetup";

// pass the following for different data
// TS - Surface Temperature
// PS - Surface Pressure
// PRECTOTCORR - Total Precipitation
// QV2M - Specific Humidity at 2 meters
// T2M - Temperature at 2 meters
// RH2M - Relative Humidity at 2 meters
// WS10M - Wind Speed at 10 meters
// more parameters can be found at `https://github.com/kdmayer/nasa-power-api`

interface WeatherDataProps {
  latitude: number; // Latitude to fetch weather data for
  longitude: number; // Longitude to fetch weather data for
  startDate: string; // Start date for the data in 'YYYYMMDD' format
  endDate: string; // End date for the data in 'YYYYMMDD' format
  parameter: string; // Parameter to fetch, e.g., 'TS' for temperature or 'PS' for pressure etc
  label: string; // Label for the graph
}

const WeatherData2DGraph: React.FC<WeatherDataProps> = ({
  latitude,
  longitude,
  startDate,
  endDate,
  parameter,
  label,
}) => {
  const [dateData, setDateData] = useState<Array<string>>([]);
  const [weatherData, setWeatherData] = useState<Array<number>>([]);

  const getWeatherData = async () => {
    try {
      const response = await axios.get(
        `weather-data/${parameter}/${startDate}/${endDate}/${longitude}/${latitude}/`
      );
      const data = response.data[parameter]; // Access the data based on the passed parameter

      setDateData(Object.keys(data));
      setWeatherData(Object.values(data));
    } catch (error) {
      console.error(`Error fetching ${parameter} data:`, error);
    }
  };

  useEffect(() => {
    getWeatherData();
  }, [latitude, longitude, startDate, endDate, parameter]);

  return (
    <div className="flex justify-center items-center">
      <LineChart
        xAxis={[{ data: dateData }]}
        series={[
          {
            data: weatherData,
            label: label,
            area: true,
          },
        ]}
        width={1000}
        height={500}
      />
    </div>
  );
};

export default WeatherData2DGraph;
