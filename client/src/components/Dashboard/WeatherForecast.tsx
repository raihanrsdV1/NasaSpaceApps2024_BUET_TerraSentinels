import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeatherData {
    dates: string[];
    temperatures: number[];
    humidities: number[];
    precipitations: number[];
}

const WeatherForecast = () => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null); // State to store weather data
    const [latitude, setLatitude] = useState<number>(23.2);
    const [longitude, setLongitude] = useState<number>(-88.5);
    const [selectedDate, setSelectedDate] = useState<string>(''); // State to store selected date
    const [selectedParameter, setSelectedParameter] = useState<string>('temperature'); // State to store selected parameter

    const getWeatherData = async () => {
        try {
            const response = await axios.get(`weather-forecast/${latitude}/${longitude}/`);
            if (response.data) {
                setWeatherData(response.data);
                if (response.data.dates.length > 0) {
                    setSelectedDate(response.data.dates[1]); // Set default date
                    setSelectedParameter('temperature'); // Set default parameter
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

    // Filter data by selected date
    const filteredData = weatherData.dates
        .map((date, index) => ({
            date,
            temperature: weatherData.temperatures[index],
            humidity: weatherData.humidities[index],
            precipitation: weatherData.precipitations[index],
        }))
        .filter(data => data.date.startsWith(selectedDate)); // Filter based on selected date

    const minTemperature = Math.min(...weatherData.temperatures);
    const maxTemperature = Math.max(...weatherData.temperatures);

    const minHumidity = Math.min(...weatherData.humidities);
    const maxHumidity = Math.max(...weatherData.humidities);

    const minPrecipitation = Math.min(...weatherData.precipitations);
    const maxPrecipitation = Math.max(...weatherData.precipitations);

    const uniqueDates = Array.from(new Set(weatherData.dates.map(date => date.split(' ')[0])));

    const y_domain = selectedParameter === 'temperature'
        ? [Math.floor(minTemperature) - 1, Math.ceil(maxTemperature) + 1]
        : selectedParameter === 'precipitation'
            ? [Math.floor(minPrecipitation) - 1, Math.ceil(maxPrecipitation) + 1]
            : [Math.floor(minHumidity) - 1, Math.ceil(maxHumidity) + 1]; // for humidity

    const parameterOptions = [
        { label: "Temperature", value: "temperature" },
        { label: "Humidity", value: "humidity" },
        { label: "Precipitation", value: "precipitation" },
    ];

    return (
        <div style={{ fontSize: "20px" }}>
            <div style={{ fontSize: "25px" }}><b>Weather Forecast Details</b></div>

            <label htmlFor="latitude-input">Latitude:&nbsp;</label>
            <input
                type="number"
                id="latitude-input"
                value={latitude}
                onChange={(e) => setLatitude(parseFloat(e.target.value))}
            />
            <div>&nbsp;</div>

            <label htmlFor="longitude-input">Longitude:&nbsp;</label>
            <input
                type="number"
                id="longitude-input"
                value={longitude}
                onChange={(e) => setLongitude(parseFloat(e.target.value))}
            />
            <div>&nbsp;</div>

            {/* Button to fetch weather data */}
            <button onClick={handleFetchData}>Fetch Data</button>

            <div>&nbsp;</div>
            
            <label htmlFor="date-select" >Select Date: &nbsp;&nbsp;</label>

            <select
                id="date-select"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
            >
                {uniqueDates.map(date => (
                    <option key={date} value={date}>
                        {date}
                    </option>
                ))}
            </select>
            <div>&nbsp;</div>
            <label htmlFor="parameter-select">Select Parameter:&nbsp;&nbsp;</label>
            <select
                id="parameter-select"
                value={selectedParameter}
                onChange={(e) => setSelectedParameter(e.target.value)}
            >
                {parameterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <ResponsiveContainer width="50%" height={600}>
                <LineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        ticks={filteredData.filter((_, index) => index % 2 === 0).map(item => item.date)}  
                    />



                    <YAxis
                        domain={y_domain}
                        ticks={Array.from({ length: Math.ceil((y_domain[1] - y_domain[0]) / 2) + 1 }, (_, i) => y_domain[0] + i * 2)} 
                        allowDecimals={false}
                    />


                    <YAxis />
                    <Tooltip />

                    <Legend />


                    <Line
                        type="monotone"
                        dataKey={selectedParameter}
                        stroke="#8884d8"
                        strokeWidth={4}
                        name={selectedParameter.charAt(0).toUpperCase() + selectedParameter.slice(1)}
                    />

                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default WeatherForecast;
