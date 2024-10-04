import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register the required components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const PredictionPage: React.FC = () => {
  const [labels, setLabels] = useState<string[]>([]);
  const [forecastData, setForecastData] = useState<number[]>([]);
  const [lowerBound, setLowerBound] = useState<number[]>([]);
  const [upperBound, setUpperBound] = useState<number[]>([]);

  useEffect(() => {
    const fetchPrediction = async () => {
      try {
        const response = await axios.post('/predict/', {
          location: { latitude: 12.34, longitude: 56.78 },
          start_year: 1993,
          end_year: 2022,
        });

        const data = response.data;

        // Get the current month and year
        const currentDate = new Date();
        const currentMonthYear = currentDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

        // Format the dates as "MMM YYYY" (e.g., "Jan 2024")
        const labels = data.map((d: any) =>
          new Date(d.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        );

        // Filter the data to show only predictions from the current month onwards
        const filteredData = data.filter((d: any) =>
          new Date(d.date) >= currentDate
        );

        const filteredLabels = filteredData.map((d: any) =>
          new Date(d.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
        );

        const forecasts = filteredData.map((d: any) => d.forecast);  // Get forecasted values for y-axis
        const lowerBounds = filteredData.map((d: any) => d['lower spi'] || 0);   // Fallback to 0 if undefined
        const upperBounds = filteredData.map((d: any) => d['upper spi'] || 0);   // Fallback to 0 if undefined

        setLabels(filteredLabels);
        setForecastData(forecasts);
        setLowerBound(lowerBounds);
        setUpperBound(upperBounds);
      } catch (error) {
        console.error('Error fetching prediction data', error);
      }
    };

    fetchPrediction();
  }, []);

  // Create chart data
  const chartData = {
    labels, // Monthly labels (e.g., Jan 2024, Feb 2024)
    datasets: [
      {
        label: 'Forecast',
        data: forecastData,
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Lower Bound',
        data: lowerBound,
        borderColor: 'rgba(255, 99, 132, 0.2)',
        fill: false,
      },
      {
        label: 'Upper Bound',
        data: upperBound,
        borderColor: 'rgba(54, 162, 235, 0.2)',
        fill: false,
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Monthly Predictions</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
};

export default PredictionPage;
