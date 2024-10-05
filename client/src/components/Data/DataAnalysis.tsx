import { useState, useEffect, useContext } from "react";
import axios from "../../utils/AxiosSetup";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import html2canvas from "html2canvas";
import MapSelector from "../MapSelector"; // Adjust the path as necessary
import DatePicker from "react-datepicker"; // Install react-datepicker with npm or yarn
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, XAxis, YAxis, Tooltip } from "recharts";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";

import brand_logo from "./brand.png";
import { Link } from "react-router-dom";

import AuthContext from "../../context/AuthContext";

// We will fetch from nasapower api and gee api

type APITypes = "nasapower" | "gee";

const nasapower = ["Surface Temperature", "Precipitation", "Humidity"];
// will degine the gee api types later
const gee = ["Evapotranspiration", "Soil Moisture", "Vegetation Indices"];

const dataSources = {
  "Surface Temperature":
    "We obtained this data through the NASA POWER API, leveraging sources such as the GEWEX SRB R4-IP (January 1, 1984 - December 31, 2000), CERES SYN1deg Edition 4.1 (from January 1, 2001, with a latency of approximately 3-4 months), and CERES FLASHFlux Version 4A (providing near real-time data.).Link to the site : https://power.larc.nasa.gov/docs/services/api/",
  Precipitation:
    "We obtained this data through the NASA POWER API, leveraging sources such as the GEWEX SRB R4-IP (January 1, 1984 - December 31, 2000), CERES SYN1deg Edition 4.1 (from January 1, 2001, with a latency of approximately 3-4 months), and CERES FLASHFlux Version 4A (providing near real-time data). Link to the site : https://power.larc.nasa.gov/docs/services/api/",
  Humidity:
    "We obtained this data through the NASA POWER API, leveraging sources such as the GEWEX SRB R4-IP (January 1, 1984 - December 31, 2000), CERES SYN1deg Edition 4.1 (from January 1, 2001, with a latency of approximately 3-4 months), and CERES FLASHFlux Version 4A (providing near real-time data). Link to the site : https://power.larc.nasa.gov/docs/services/api/",
  Evapotranspiration:
    "We obtained this data through the Google Earth Engine API, leveraging sources such as the Global Land Evaporation Amsterdam Model (GLEAM) dataset. Data source provider : NASA LP DAAC at the USGS EROS Center. Link to the site : https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD16A2",
  "Soil Moisture":
    "We obtained this data through the Google Earth Engine API, leveraging sources such as the Global Land Evaporation Amsterdam Model (GLEAM) dataset. Data source provider : NASA GSFC. Link to the site : https://developers.google.com/earth-engine/datasets/catalog/NASA_USDA_HSL_SMAP10KM_soil_moisture",
  "Vegetation Indices":
    "We obtained this data through the Google Earth Engine API, leveraging sources such as the Global Land Evaporation Amsterdam Model (GLEAM) dataset. Data source provider : NASA LP DAAC at the USGS EROS Center. Link to the site : https://developers.google.com/earth-engine/datasets/catalog/MODIS_061_MOD13A1",
};

// Define the parameter types as a union of string literals
type ParameterType =
  | "Surface Temperature"
  | "Precipitation"
  | "Humidity"
  | "Evapotranspiration"
  | "Soil Moisture"
  | "Vegetation Indices";

interface WeatherDataProps {}

const parameterOptions: Record<ParameterType, string> = {
  "Surface Temperature": "TS",
  Precipitation: "PRECTOTCORR",
  Humidity: "QV2M",
  Evapotranspiration: "ET",
  "Soil Moisture": "SM",
  "Vegetation Indices": "NDVI",
};

const parameterStyles: Record<ParameterType, { color: string; unit: string }> =
  {
    "Surface Temperature": {
      color: "#ff6347", // tomato color
      unit: "°C",
    },
    Precipitation: {
      color: "#1e90ff", // dodger blue
      unit: "mm",
    },
    Humidity: {
      color: "#1eee", // lime green
      unit: "%",
    },
    Evapotranspiration: {
      color: "#ff69b4", // hot pink
      unit: "mm",
    },
    "Soil Moisture": {
      color: "#ffd700", // gold
      unit: "m³/m³",
    },
    "Vegetation Indices": {
      color: "#32cd32", // lime green
      unit: "NDVI",
    },
  };

const DataAnalysis: React.FC<WeatherDataProps> = () => {
  const contextData = useContext(AuthContext);
  const user_lat = contextData?.user.location_lat || 23.8; 
  const user_lon = contextData?.user.location_lon || 90.5; 

  const [latitude, setLatitude] = useState<number>(user_lat);
  const [longitude, setLongitude] = useState<number>(user_lon);
  const [startDate, setStartDate] = useState<Date | null>(
    new Date("2021-01-01")
  );
  const [endDate, setEndDate] = useState<Date | null>(new Date("2021-01-31"));
  const [parameter, setParameter] = useState<string>("TS");
  const [dateData, setDateData] = useState<Array<string>>([]);
  const [weatherData, setWeatherData] = useState<Array<number>>([]);
  const [selectedParameter, setSelectedParameter] = useState<ParameterType>(
    "Surface Temperature"
  );
  const [learnMoreExpanded, setLearnMoreExpanded] = useState<boolean>(false);
  const [quizExpanded, setQuizExpanded] = useState<boolean>(false);
  const [mapExpanded, setMapExpanded] = useState<boolean>(false);
  const [showTable, setShowTable] = useState(false); // State for toggling the table

  const toggleTable = () => {
    setShowTable(!showTable); // Toggle show/hide table
  };

  const getWeatherData = async () => {
    try {
      const response = await axios.get(
        `weather-data/${parameter}/${startDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}/${endDate
          ?.toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}/${longitude}/${latitude}/`
      );
      const data = response.data[parameter];
      setDateData(Object.keys(data));
      setWeatherData(Object.values(data));
    } catch (error) {
      console.error(`Error fetching ${parameter} data:`, error);
    }
  };

  const getGEEData = async () => {
    try {
      // Prepare date strings in the desired format
      const start = startDate ? startDate.toISOString().slice(0, 10) : null; // "YYYY-MM-DD"
      const end = endDate ? endDate.toISOString().slice(0, 10) : null; // "YYYY-MM-DD"

      // Fetch data from the API
      const response = await axios.get("/gee-data/", {
        params: {
          parameter,
          start,
          end,
          lat: latitude,
          long: longitude,
        },
      });

      // Log the response data
      // console.log("Response:", response.data); // Log the response data

      // Extract the data and set the state
      const data = response.data;

      console.log(data);

      setDateData(data.map((item: any) => item.date));
      setWeatherData(data.map((item: any) => item.value));
    } catch (error) {
      console.error(`Error fetching GEE ${parameter} data:`, error);
    }
  };

  const handleDownload = async () => {
    // Select the content to download
    const content = document.querySelector(
      ".content-to-download"
    ) as HTMLElement;

    if (content) {
      // Create a canvas from the content
      const canvas = await html2canvas(content);
      const imgData = canvas.toDataURL("image/png");

      // Create a new jsPDF instance
      const pdf = new jsPDF();

      // Add the NASA logo to the PDF
      const logoX = 10;
      const logoY = 10;
      const logoWidth = 30;
      const logoHeight = 8;
      pdf.addImage(brand_logo, "PNG", logoX, logoY, logoWidth, logoHeight);

      // Add the title text below the logo

      pdf.text(`${selectedParameter} Data Analysis`, 50, logoY);
      pdf.text("powered by NASA Earth Data", 50, logoY + 10);

      // Add the chart image to the PDF
      const chartX = 10;
      const chartY = logoY + logoHeight + 30; // Set Y position below the logo and text
      const chartWidth = 190;
      const chartHeight = 100;
      pdf.addImage(imgData, "PNG", chartX, chartY, chartWidth, chartHeight);

      // Prepare dataset in tabular format
      const tableData = weatherData.map((value, index) => ({
        date: dateData[index].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"), // Format date as yyyy-mm-dd
        value,
      }));

      const headers = ["Date", "Value"];
      const rows = tableData.map((row) => [row.date, row.value]);

      // Set the starting Y position for the table below the chart with additional spacing
      const tableStartY = chartY + chartHeight + 20;

      // Add table headers and data using autoTable
      pdf.autoTable({
        head: [headers],
        body: rows,
        startY: tableStartY,
      });

      // Calculate statistics
      const maxValue = Math.max(...weatherData);
      const minValue = Math.min(...weatherData);
      const medianValue = calculateMedian(weatherData);
      const mostRecurringRange = calculateMostRecurringRange(weatherData);
      const extremeValueInfo = getExtremeValueInfo(weatherData, dateData);

      // Add key statistics to the PDF
      pdf.setFontSize(12);
      let statsYPosition = pdf.autoTable.previous.finalY + 10; // Start below the table
      pdf.text(`Max Value: ${maxValue}`, 10, statsYPosition);
      pdf.text(`Min Value: ${minValue}`, 10, statsYPosition + 10);
      pdf.text(`Median Value: ${medianValue}`, 10, statsYPosition + 20);
      pdf.text(
        `Most Recurring Range: ${mostRecurringRange}`,
        10,
        statsYPosition + 30
      );

      // Add extreme value information
      pdf.text("Extreme Value Information", 10, statsYPosition + 50);
      const extremeValueHeaders = ["Date", "Value"];
      const extremeValueRows = [
        [extremeValueInfo.date, extremeValueInfo.value],
      ];
      pdf.autoTable({
        head: [extremeValueHeaders],
        body: extremeValueRows,
        startY: statsYPosition + 60, // Start below the extreme value header
      });

      // Add the data source information
      const dataSourceYPosition = pdf.autoTable.previous.finalY + 10;
      pdf.text("Data Sources", 10, dataSourceYPosition);
      pdf.text(dataSources[selectedParameter], 10, dataSourceYPosition + 10, {
        maxWidth: 190,
      });

      // save time stamp and user name
      pdf.text(
        `Downloaded by: ${localStorage.getItem("username")}`,
        5,
        dataSourceYPosition + 30
      );
      pdf.text(
        `Downloaded on: ${new Date().toLocaleString()}`,
        5,
        dataSourceYPosition + 40
      );

      // Save the PDF with a dynamic name based on the selected parameter and date range
      pdf.save(
        `nasa-data-${selectedParameter}-${startDate
          ?.toISOString()
          .slice(0, 10)}-${endDate?.toISOString().slice(0, 10)}.pdf`
      );
    }
  };

  const calculateMedian = (data: Array<number>) => {
    const sortedData = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 !== 0
      ? sortedData[mid]
      : (sortedData[mid - 1] + sortedData[mid]) / 2;
  };

  const calculateMostRecurringRange = (data: Array<number>) => {
    const frequency: Record<number, number> = {};
    data.forEach((value) => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const mostRecurringValue = Object.keys(frequency).reduce((a, b) =>
      frequency[a] > frequency[b] ? a : b
    );
    return `${mostRecurringValue} (${frequency[mostRecurringValue]} occurrences)`;
  };

  const getExtremeValueInfo = (data: Array<number>, dates: Array<string>) => {
    const maxIndex = data.indexOf(Math.max(...data));
    return {
      value: Math.max(...data),
      date: dates[maxIndex].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3"), // Format date as yyyy-mm-dd
    };
  };

  useEffect(() => {
    if (nasapower.includes(selectedParameter)) {
      getWeatherData();
    } else if (gee.includes(selectedParameter)) {
      getGEEData();
    }
  }, [latitude, longitude, startDate, endDate, parameter]);

  const handleParameterChange = (param: ParameterType) => {
    setSelectedParameter(param);
    setParameter(parameterOptions[param]);
  };

  const formatDate = (date: string) => {
    // make it month date like Jan 01
    return dayjs(date, "YYYYMMDD").format("DD-MMM-YYYY");
  };

  const formatDate2 = (date: string, coloredData: Array<any>) => {
    // make it month date like Jan 01
    const formattedDate = dayjs(date, "YYYYMMDD").format("MMM DD");

    // Check the date range to decide the format
    const firstDate = dayjs(coloredData[0].date, "YYYYMMDD");
    const lastDate = dayjs(
      coloredData[coloredData.length - 1].date,
      "YYYYMMDD"
    );

    const totalDays = lastDate.diff(firstDate, "days");

    // if month january then show year also

    if (totalDays < 180) {
      // Less than 60 days: Show full date
      return formattedDate;
    } else if (totalDays <= 365 * 5) {
      // Less than 2 years: Show month and year
      if (dayjs(date).format("MMM") === "Jan") {
        return dayjs(date).format("YYYY");
      }
      return dayjs(date).format("MMM"); // e.g., "Feb 2021"
    } else {
      // More than 2 years: Show year only
      return dayjs(date).format("YYYY"); // e.g., "2021"
    }
  };

  const maxValue = Math.max(...weatherData);
  const minValue = Math.min(...weatherData);

  // Dynamic yAxis label based on selectedParameter
  const yAxisLabel = selectedParameter;

  const chartSetting = {
    width: 1200, // Larger chart width
    height: 500,
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
  };

  const getColor = (value: number, minValue: number, maxValue: number) => {
    // Ensure value is within min and max to prevent errors
    const clampedValue = Math.max(minValue, Math.min(value, maxValue));

    // Calculate the ratio based on the normalized value between 0 and 1
    const ratio = (clampedValue - minValue) / (maxValue - minValue);

    // Define the threshold for the red color
    var threshold = maxValue * 0.95; // 95% of the maximum value

    // If too many values are above the threshold, adjust the threshold

    // If the value exceeds the threshold, return red
    if (clampedValue > threshold) {
      if (selectedParameter === "Vegetation Indices") {
        return "rgb(0, 255, 0)"; // Green color for values > 95%
      }
      return "rgb(255, 0, 0)"; // Red color for values > 95%
    }

    // If below the threshold, interpolate between light blue and deep blue
    const lightBlue = { r: 173, g: 216, b: 230 }; // Light blue color
    const deepBlue = { r: 0, g: 0, b: 139 }; // Deep blue color

    // Calculate the interpolated color
    const red = Math.floor(lightBlue.r + (deepBlue.r - lightBlue.r) * ratio);
    const green = Math.floor(lightBlue.g + (deepBlue.g - lightBlue.g) * ratio);
    const blue = Math.floor(lightBlue.b + (deepBlue.b - lightBlue.b) * ratio);

    return `rgb(${red}, ${green}, ${blue})`; // Return the interpolated color
  };

  const coloredData = weatherData.map((value, index) => ({
    date: dateData[index],
    value,
    color: getColor(value, minValue, maxValue), // Pre-calculate color
  }));

  //array of color
  const colorArray = coloredData.map((data) => data.color);
  const dataArray = coloredData.map((data) => ({
    label: formatDate2(data.date, coloredData),
    value: data.value,
    date: formatDate(data.date),
  }));

  console.log(dataArray);

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
      <div className="flex w-full pt-16">
        <div className="w-full p-6">
          <h1 className="text-3xl font-bold text-center m-6">Data Analysis</h1>
          {/* Parameter Options as Buttons */}
          <div className="mb-4 flex justify-center space-x-4">
            {Object.keys(parameterOptions).map((option) => (
              <button
                key={option}
                onClick={() => handleParameterChange(option as ParameterType)}
                className={`p-2 rounded transition-colors duration-300 ${
                  selectedParameter === option
                    ? "bg-blue-500 text-white font-bold px-4 w-[190px]"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400 font-bold px-4 w-[190px]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="w-full mb-6 content-to-download flex">
            {/* Graph Centered Above Inputs */}
            <div className="w-4/5 chart-container mb-6 flex flex-col items-center">
              {/* Bar Chart */}
              <BarChart
                data={dataArray} // Use the dataArray created above
                {...chartSetting}
              >
                <XAxis
                  dataKey="label" // Use the formatted label for the X-axis
                  tick={{ fontSize: 12, fill: "black" }} // Customize tick style
                />
                <YAxis
                  label={{
                    value: yAxisLabel,
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                {/* Tooltip for showing actual date and value */}
                <Tooltip
                  formatter={(value) => [`${value}`, "Value: "]} // Show the value
                  labelFormatter={(label, props) => {
                    if (props && props.length > 0 && props[0].payload) {
                      return `Date: ${props[0].payload.date}`;
                    }
                    return label;
                  }}
                />

                <Bar dataKey="value" fill="#8884d8">
                  {dataArray.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colorArray[index]} />
                  ))}
                </Bar>
              </BarChart>
            </div>

            {/* Parameters on the Right Side */}
            <div className="w-1/5 p-4 h-3/4 bg-gray-100 rounded ml-4 mt-12 flex flex-col justify-center items-center text-center">
              <h2 className="text-lg font-semibold mb-2">Data Highlights</h2>
              <table className="table-auto">
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 font">Start Date</td>
                    <td className="border px-4 py-2">
                      {startDate?.toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font">End Date</td>
                    <td className="border px-4 py-2">
                      {endDate?.toLocaleDateString()}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Latitude</td>
                    <td className="border px-4 py-2">{latitude}</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Longitude</td>
                    <td className="border px-4 py-2">{longitude}</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Max</td>
                    <td className="border px-4 py-2">
                      {maxValue.toFixed(2)}{" "}
                      {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Min</td>
                    <td className="border px-4 py-2">
                      {minValue.toFixed(2)}{" "}
                      {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Median</td>
                    <td className="border px-4 py-2">
                      {calculateMedian(weatherData).toFixed(2)}{" "}
                      {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Average</td>
                    <td className="border px-4 py-2">
                      {(
                        weatherData.reduce((a, b) => a + b, 0) /
                        weatherData.length
                      ).toFixed(2)}{" "}
                      {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Unit</td>
                    <td className="border px-4 py-2">
                      {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Extra Space Below */}
          <div className="mb-8" />{" "}
          {/* Adjust the value as needed for spacing */}
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
            <button
              onClick={() => setMapExpanded(!mapExpanded)}
              className="p-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition"
            >
              {mapExpanded ? "Hide Map" : "Select Location"}
            </button>
          </div>
          {/* Map Selector */}
          <div className="flex justify-center">
            {mapExpanded && (
              <div className="mb-4 w-1/3">
                <MapSelector
                  onSelect={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                  apiKey="YOUR_GOOGLE_MAPS_API_KEY"
                />
              </div>
            )}
          </div>
          {/* Fetch Data & Download Buttons */}
          <div className="flex justify-center mb-4 ml-2">
            <button
              onClick={getWeatherData}
              className="w-1/6 p-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition"
            >
              Fetch Data
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <button
              onClick={toggleTable}
              className="w-1/6 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              {showTable ? "Hide Table" : "Show Data in a Table"}
            </button>
          </div>
          <div className="flex justify-center">
            {showTable && (
              <table className="table-auto w-1/3">
                <thead>
                  <tr>
                    <th className="border px-4 py-2 bg-gray-200">Date</th>
                    <th className="border px-4 py-2 bg-gray-200">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {dateData.map((date, index) => (
                    <tr key={date}>
                      <td className="border px-4 py-2 text-center">
                        {formatDate(date)}
                      </td>
                      <td className="border px-4 py-2 text-center">
                        {weatherData[index]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-center mb-4">
            <button
              onClick={handleDownload}
              className="w-1/6 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Download Graph & Data
            </button>
          </div>
          {/* Learn More About the Data Section */}
          <div className="p-2 text-center">
            <Link to={{ pathname: "/quiz"}} className="text-blue-500 hover:underline">
              Learn more about data..
            </Link>
          </div>
          {/* Quiz Section */}
          {/* <div className="p-6">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => setQuizExpanded(!quizExpanded)}
            >
              Take a Quiz
            </button>
            {quizExpanded && (
              <div className="mt-4">
                <p>Your quiz questions will go here...</p>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default DataAnalysis;
