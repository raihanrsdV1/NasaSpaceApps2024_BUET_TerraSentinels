import { useState, useEffect } from "react";
import axios from "../../utils/AxiosSetup";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import html2canvas from 'html2canvas';
import MapSelector from "../MapSelector"; // Adjust the path as necessary
import DatePicker from "react-datepicker"; // Install react-datepicker with npm or yarn
import "react-datepicker/dist/react-datepicker.css";
import { Bar, BarChart, Cell, XAxis, YAxis, Tooltip} from "recharts";
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';





// We will fetch from nasapower api and gee api

type APITypes = "nasapower" | "gee";

const nasapower = ["Surface Temperature", "Precipitation", "Humidity"];
// will degine the gee api types later


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
  const [showTable, setShowTable] = useState(false); // State for toggling the table

  const toggleTable = () => {
    setShowTable(!showTable); // Toggle show/hide table
  };


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
      const imgData = canvas.toDataURL('image/png');

      // Create a new jsPDF instance
      const pdf = new jsPDF();

      // Add the chart image to the PDF
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 100); // Adjust dimensions as needed

      // Add dataset in tabular format
      const tableData = weatherData.map((value, index) => ({
        date: dateData[index].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), // Format date as yyyy-mm-dd
        value,
      }));

      const headers = ['Date', 'Value'];
      const rows = tableData.map(row => [row.date, row.value]);

      // Add table headers and data using autoTable
      pdf.autoTable({
        head: [headers],
        body: rows,
        startY: 120, // Starting position for the table
      });

      // Calculate statistics
      const maxValue = Math.max(...weatherData);
      const minValue = Math.min(...weatherData);
      const medianValue = calculateMedian(weatherData);
      const mostRecurringRange = calculateMostRecurringRange(weatherData);
      const extremeValueInfo = getExtremeValueInfo(weatherData, dateData);

      // Add key points to the PDF
      pdf.setFontSize(12);
      pdf.text(`Max Value: ${maxValue}`, 10, pdf.autoTable.previous.finalY + 10);
      pdf.text(`Min Value: ${minValue}`, 10, pdf.autoTable.previous.finalY + 20);
      pdf.text(`Median Value: ${medianValue}`, 10, pdf.autoTable.previous.finalY + 30);
      pdf.text(`Most Recurring Range: ${mostRecurringRange}`, 10, pdf.autoTable.previous.finalY + 40);

      // Add extreme value information
      // Tabbulate the data
      pdf.text('Extreme Value Information', 10, pdf.autoTable.previous.finalY + 50);
      const extremeValueHeaders = ['Date', 'Value'];
      const extremeValueRows = [[extremeValueInfo.date, extremeValueInfo.value]];
      pdf.autoTable({
        head: [extremeValueHeaders],
        body: extremeValueRows,
        startY: pdf.autoTable.previous.finalY + 60,
      });

      // Save the PDF name it accordingly to the data being downloaded and time range selected
      pdf.save(`weather-data-${parameter}-${startDate?.toISOString().slice(0, 10)}-${endDate?.toISOString().slice(0, 10)}.pdf`);
      
    }
  };

  const calculateMedian = (data: Array<number>) => {
    const sortedData = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sortedData.length / 2);
    return sortedData.length % 2 !== 0 ? sortedData[mid] : (sortedData[mid - 1] + sortedData[mid]) / 2;
  };

  const calculateMostRecurringRange = (data: Array<number>) => {
    const frequency: Record<number, number> = {};
    data.forEach(value => {
      frequency[value] = (frequency[value] || 0) + 1;
    });
    const mostRecurringValue = Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    return `${mostRecurringValue} (${frequency[mostRecurringValue]} occurrences)`;
  };

  const getExtremeValueInfo = (data: Array<number>, dates: Array<string>) => {
    const maxIndex = data.indexOf(Math.max(...data));
    return {
      value: Math.max(...data),
      date: dates[maxIndex].replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3'), // Format date as yyyy-mm-dd
    };
  };


  useEffect(() => {
    if(nasapower.includes(selectedParameter)) {
      getWeatherData();
      
    }
  }, [latitude, longitude, startDate, endDate, parameter]);

  const handleParameterChange = (param: ParameterType) => {
    setSelectedParameter(param);
    setParameter(parameterOptions[param]);
  };

  const formatDate = (date: string) => {
    // make it month date like Jan 01
    return dayjs(date, 'YYYYMMDD').format('DD-MMM-YYYY');
  };

  const formatDate2 = (date: string, coloredData: Array<any>) => {
    // make it month date like Jan 01
    const formattedDate = dayjs(date, 'YYYYMMDD').format('MMM DD');
  
    // Check the date range to decide the format
    const firstDate = dayjs(coloredData[0].date, 'YYYYMMDD');
    const lastDate = dayjs(coloredData[coloredData.length - 1].date, 'YYYYMMDD');
  
    const totalDays = lastDate.diff(firstDate, 'days');

    // if month january then show year also
  
    if (totalDays < 180) {
      // Less than 60 days: Show full date
      return formattedDate;
    } else if (totalDays <= 365*5) {
      // Less than 2 years: Show month and year
      if(dayjs(date).format('MMM') === 'Jan'){
        return dayjs(date).format('YYYY');
      }
      return dayjs(date).format('MMM'); // e.g., "Feb 2021"
    } else{
      // More than 2 years: Show year only
      return dayjs(date).format('YYYY'); // e.g., "2021"
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
      const threshold = maxValue * 0.95; // 95% of the maximum value
    
      // If the value exceeds the threshold, return red
      if (clampedValue > threshold) {
        return 'rgb(255, 0, 0)'; // Red color for values > 95%
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
    const dataArray = coloredData.map((data) => ({ label: formatDate2(data.date,coloredData), value: data.value, date: formatDate(data.date) }));

    console.log(dataArray);

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
                  tick={{ fontSize: 12, fill: 'black' }} // Customize tick style
                />
                <YAxis label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }} />

                {/* Tooltip for showing actual date and value */}
                <Tooltip
                  formatter={(value) => [`${value}`, 'Value: ']} // Show the value
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
            <div className="w-1/5 p-4 h-3/4 bg-gray-100 rounded ml-4 mt-14 flex flex-col justify-center items-center text-center">
              <h2 className="text-lg font-semibold mb-2">Data Highlights</h2>
              <table className="table-auto">
                <tbody>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Start Date</td>
                    <td className="border px-4 py-2">{startDate?.toLocaleDateString()}</td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">End Date</td>
                    <td className="border px-4 py-2">{endDate?.toLocaleDateString()}</td>
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
                      {maxValue} {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Min</td>
                    <td className="border px-4 py-2">
                      {minValue} {parameterStyles[selectedParameter].unit}
                    </td>
                  </tr>
                  <tr>
                    <td className="border px-4 py-2 font-bold">Unit</td>
                    <td className="border px-4 py-2">{parameterStyles[selectedParameter].unit}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Extra Space Below */}
          <div className="mb-8" /> {/* Adjust the value as needed for spacing */}

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
            <button onClick={getWeatherData} className="w-1/4 p-2 bg-green-500 text-white rounded mr-2 hover:bg-green-600 transition">
              Fetch Data
            </button>
          </div>
          <div className="flex justify-center mb-4">
            <button onClick={toggleTable} className="w-1/4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              {showTable ? "Hide Table" : "Show Data in Tabular"}
            </button>
          </div>
          <div className="flex justify-center mb-4">
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
                      <td className="border px-4 py-2 text-center">{formatDate(date)}</td>
                      <td className="border px-4 py-2 text-center">{weatherData[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex justify-center mb-4">
            <button onClick={handleDownload} className="w-1/4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
              Download Graph & Data
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