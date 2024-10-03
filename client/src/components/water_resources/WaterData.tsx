import React, { useEffect, useState } from 'react';
import axios from "../../utils/AxiosSetup";
import Navbar from '../Navbar'; 
import Sidebar from '../Sidebar'; 
import MapSelector from '../MapSelector';
import DistanceSlider from './DistanceSlider'; // Import the slider component

const WaterData = () => {
    const [latitude, setLatitude] = useState<number>(25.621889);
    const [longitude, setLongitude] = useState<number>(88.638489);
    const [maxDistance, setMaxDistance] = useState<number>(1);
    const [mapHtml, setMapHtml] = useState<string | null>(null);
    


    // Fetch water data from backend
    const getWaterData = async () => {
        try {
            const response = await axios.get("/water-data/", {
                params: {
                    lat: latitude,
                    long: longitude,
                    max_distance: maxDistance
                },
            });
              
            if (response.data.map) {
                setMapHtml(response.data.map);  // Set the HTML string for the map
            } else {
                console.error("No map data found");
            }
        } catch (error) {
            console.error("Error fetching water data:", error);
        }
    };

    useEffect(() => {
        getWaterData();
    }, [latitude, longitude, maxDistance]);

    // Render the map HTML in an iframe
    const renderMapInIframe = () => {
        if (!mapHtml) return null;

        const iframeSrc = 'data:text/html;charset=utf-8,' + encodeURIComponent(mapHtml);

        return (
            <iframe 
                src={iframeSrc} 
                title="Water Source Map" 
                className="w-full h-[500px] border-none" 
                style={{ border: 0 }}
            />
        );
    };

    return (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex flex-grow">
                <Sidebar />
                <div className="flex flex-col items-center justify-center flex-grow p-4 mt-20">
                    <h1 className="text-4xl font-bold mb-6">Water Data</h1>
                    
                    {/* Map Container */}
                    <div className="w-full max-w-4xl h-96 mb-20">
                        {mapHtml ? renderMapInIframe() : <p>Loading water data...</p>}
                    </div>

                    {/* Map Selector Section */}
                    <div className="w-full max-w-2xl mt-10 bg-white p-6 shadow-lg rounded-lg">
                        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                            Select your location on the map
                        </h2>

                        <MapSelector
                            onSelect={(lat, lng) => {
                                setLatitude(lat);
                                setLongitude(lng);
                            }}
                            apiKey={"AIzaSyAvwlUzN8yS6W6oWei0anmvA_bTuao_ay0"}
                            mapId={"a76d6833c6f687c8"}
                        />

                        {/* Selected Coordinates */}
                        <div className="mt-4 text-center">
                            {latitude && longitude && (
                                <p className="text-gray-700">
                                    Selected Coordinates: Lat: {latitude}, Lng: {longitude}
                                </p>
                            )}
                        </div>

                        {/* Distance Slider Section */}
                        <DistanceSlider
                            maxDistance={maxDistance}
                            setMaxDistance={setMaxDistance}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterData;
