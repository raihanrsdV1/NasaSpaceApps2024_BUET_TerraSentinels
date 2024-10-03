import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";
import Navbar from '../Navbar'; 
import Sidebar from '../Sidebar'; 

const WaterData = () => {
    const [latitude, setLatitude] = useState<number>(25.621889);
    const [longitude, setLongitude] = useState<number>(88.638489);
    const [maxDistance, setMaxDistance] = useState<number>(1);
    const [mapHtml, setMapHtml] = useState<string | null>(null);
    

    const getWaterData = async () => {
        try {
            console.log("Fetching water data...");
            const response = await axios.get("/water-data/", {
                params: {
                    lat: latitude,
                    long: longitude,
                    max_distance: maxDistance
                },
            });
            console.log(response);
              
            if (response.data.map) {
                console.log("Data obtained");
                setMapHtml(response.data.map);  // Set the HTML string for the map
            } else {
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