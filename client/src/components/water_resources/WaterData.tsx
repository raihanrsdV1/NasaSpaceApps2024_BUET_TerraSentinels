import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../Navbar'; 
import Sidebar from '../Sidebar'; 
const WaterData = () => {
    const [latitude, setLatitude] = useState<number>(37.7749);
    const [longitude, setLongitude] = useState<number>(-122.4194);
    const [maxDistance, setMaxDistance] = useState<number>(1);
    const [mapHtml, setMapHtml] = useState<string | null>(null);
    
    const getWaterData = async () => {
        try {
            console.log("Fetching water data2...");
            console.log(latitude, longitude, maxDistance);
            const response = await axios.get(`water-data/${latitude}/${longitude}/${maxDistance}`);
              
            if (response.data.map_html) {
                console.log("Data obtained");
                setMapHtml(response.data.map_html);
            }
            else {
                console.error("No map data found");
            }
        } catch (error) {
            console.error("Error fetching water data:", error);
        }
    };

    useEffect(() => {
        console.log("Fetching water data...");
        getWaterData();
    }, [latitude, longitude, maxDistance]);

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <Sidebar />
            <div className="flex flex-col items-center justify-center h-full">
                <h1 className="text-4xl font-bold">Water Data</h1>
                {/* Render HTML */}
                {mapHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: mapHtml }} />
                ) : (
                    <p>Loading water data...</p>
                )}
            </div>
        </div>
    );
};

export default WaterData;