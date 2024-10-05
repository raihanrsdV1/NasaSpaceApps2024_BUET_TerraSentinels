import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import useAxios from "../../hooks/useAxios";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";

interface DiseaseData {
  disease: string;
  count: number;
}

interface BlightData {
  month: string;
  count: number;
}

const DiseaseStatisticsChart: React.FC = () => {
  const [diseaseData, setDiseaseData] = useState<DiseaseData[]>([]);
  const [blightData, setBlightData] = useState<BlightData[]>([]);
  const axios = useAxios();

  useEffect(() => {
    // Fetch disease data from the backend API
    const fetchDiseaseData = async () => {
      try {
        const response = await axios.get("disease-occurrence/");
        console.log("Disease occurrence data:", response.data);
        const chartData = response.data.diseases.map(
          (disease: string, index: number) => ({
            disease,
            count: response.data.counts[index],
          })
        );
        setDiseaseData(chartData);
      } catch (error) {
        console.error("Error fetching disease occurrence data:", error);
      }
    };

    // Fetch Blight time series data from the backend API
    const fetchBlightData = async () => {
      try {
        const response = await axios.get("blight-time-series/");
        console.log("Blight time series data:", response.data);
        const blightChartData = response.data.months.map(
          (month: string, index: number) => ({
            month,
            count: response.data.counts[index],
          })
        );
        setBlightData(blightChartData);
      } catch (error) {
        console.error("Error fetching Blight data:", error);
      }
    };

    fetchDiseaseData();
    fetchBlightData();
  }, []);

  return (
    <div className="flex">
      <Navbar />
      <Sidebar />
      <div className="w-full">
        {/* Disease Occurrences in One Year */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center p-4">
            Disease Occurrences in One Year
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={diseaseData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="disease" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#ffcf00" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Blight Time Series Chart */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center p-4">
            Blight Disease Time Series Over the Past Year
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={blightData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DiseaseStatisticsChart;