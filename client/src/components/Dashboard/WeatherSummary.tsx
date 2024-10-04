import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";

interface WeatherData {
    dates: string[];
    temperatures: number[];
    humidities: number[];
    precipitations: number[];
}

interface WeatherSummaryProps {
    latitude: number;
    longitude: number;
    setLatitude: (value: number) => void;
    setLongitude: (value: number) => void;
}

const WeatherSummary: React.FC<WeatherSummaryProps> = ({ latitude, longitude, setLatitude, setLongitude }) => {
    const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

    const getWeatherData = async () => {
        try {
            const response = await axios.get(`weather-forecast/${latitude}/${longitude}/`);
            if (response.data) {
                setWeatherData(response.data);
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

    const today = new Date().toISOString().split('T')[0];
    const futureData = weatherData.dates
        .map((date, index) => ({
            date: date.split(' ')[0],
            temperature: weatherData.temperatures[index],
            humidity: weatherData.humidities[index],
            precipitation: weatherData.precipitations[index],
        }))
        .filter(data => data.date > today);

    const groupedData = futureData.reduce((acc: any, curr) => {
        if (!acc[curr.date]) {
            acc[curr.date] = {
                temperatures: [],
                humidities: [],
                precipitations: []
            };
        }
        acc[curr.date].temperatures.push(curr.temperature);
        acc[curr.date].humidities.push(curr.humidity);
        acc[curr.date].precipitations.push(curr.precipitation);
        return acc;
    }, {});

    const summaryData = Object.keys(groupedData).map(date => {
        const temps = groupedData[date].temperatures;
        const hums = groupedData[date].humidities;
        const precs = groupedData[date].precipitations;
        return {
            date,
            maxTemp: Math.max(...temps),
            minTemp: Math.min(...temps),
            maxHumidity: Math.max(...hums),
            minHumidity: Math.min(...hums),
            maxPrecipitation: Math.max(...precs),
            minPrecipitation: Math.min(...precs),
        };
    });

    return (
        <div
        style={{
            fontSize: "20px",
            width: "100%",
            backgroundColor: "#f9f9f9", // Light background color
            padding: "20px", // Padding for inner spacing
            margin: "20px", // Margin for outer spacing
            borderRadius: "10px", // Rounded corners
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)", // Soft shadow for depth
            border: "1px solid #ddd", // Light border for structure
            height: "650px",
            overflowY: "scroll"
        }}
    >
        <div style={{ fontSize: "25px", fontWeight: "bold", marginBottom: "15px", textAlign: "center" }}>
            Weather Forecast Summary (min-max)
        </div>
    
        <div className="flex justify-between mb-4">
            <div>
                <label htmlFor="latitude-input" style={{ marginRight: "10px", fontWeight: "bold" }}>Latitude:</label>
                <input
                    type="number"
                    id="latitude-input"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        width: "150px"
                    }}
                />
            </div>
            <div>
                <label htmlFor="longitude-input" style={{ marginRight: "10px", fontWeight: "bold" }}>Longitude:</label>
                <input
                    type="number"
                    id="longitude-input"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                        width: "150px"
                    }}
                />
            </div>
        </div>
    
        <table className="min-w-full divide-y divide-gray-200" style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
                <tr className="bg-green-200" style={{ backgroundColor: "#d1f7c4" }}>
                    <th className="px-4 py-2 text-center text-green-700" style={{ padding: "10px", color: "#2d6a4f", fontWeight: "bold" }}>Date</th>
                    <th className="px-4 py-2 text-center text-green-700" style={{ padding: "10px", color: "#2d6a4f", fontWeight: "bold" }}>Temp (°C)</th>
                    <th className="px-4 py-2 text-center text-green-700" style={{ padding: "10px", color: "#2d6a4f", fontWeight: "bold" }}>Humidity (%)</th>
                    <th className="px-4 py-2 text-center text-green-700" style={{ padding: "10px", color: "#2d6a4f", fontWeight: "bold" }}>Precipitation (mm)</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {summaryData.map((data, index) => (
                    <tr
                        key={data.date}
                        className={`${index % 2 === 0 ? "bg-green-100" : "bg-white"} hover:bg-green-200 transition-all`}
                        style={{
                            backgroundColor: index % 2 === 0 ? "#f0f9f0" : "#ffffff",
                            transition: "background-color 0.3s"
                        }}
                    >
                        <td className="px-4 py-2 text-center" style={{ padding: "10px" }}>{data.date}</td>
                        <td className="px-4 py-2 text-center" style={{ padding: "10px" }}>{data.minTemp} - {data.maxTemp}</td>
                        <td className="px-4 py-2 text-center" style={{ padding: "10px" }}>{data.minHumidity} - {data.maxHumidity}</td>
                        <td className="px-4 py-2 text-center" style={{ padding: "10px" }}>{data.minPrecipitation} - {data.maxPrecipitation}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    
    );
};

export default WeatherSummary;
